"""Render Codex config from Claude Code settings and MCP inputs.

This module owns `.codex/config.toml` generation. It reads Claude Code
settings for model/sandbox equivalents, asks `mcps.py` for MCP server tables,
and preserves explicit target model settings without inventing cross-provider
model equivalents or personality defaults.
"""

from __future__ import annotations

import tomllib
from collections.abc import Mapping
from pathlib import Path

from migrate.common import (
    CODEX_CONFIG_PATH,
    ConversionResult,
    GeneratedText,
    MigrationReportItem,
    MigrationSummary,
    PlannedArtifact,
    ScopePaths,
    json_string,
    json_string_tuple,
    load_scope_settings,
    map_model_name,
    model_migration_notes,
    map_permission_mode,
)
from migrate.hooks import has_convertible_hooks
from migrate.mcps import (
    mcp_report_items,
    mcp_server_toml_table,
    read_claude_mcp_servers,
    validate_mcp_commands,
)
from utils.util import TomlValue, render_toml_document


def convert_settings(scope: ScopePaths) -> ConversionResult:
    settings = load_scope_settings(scope.source)
    mcp_servers = read_claude_mcp_servers(scope.source)
    if not settings and not mcp_servers:
        return ConversionResult()

    enabled_mcp_servers = json_string_tuple(settings.get("enabledMcpjsonServers"))
    disabled_mcp_servers = frozenset(
        json_string_tuple(settings.get("disabledMcpjsonServers"))
    )
    source_model = json_string(settings.get("model"))
    report_items = mcp_report_items(mcp_servers) if mcp_servers else []
    report_items.extend(
        MigrationReportItem("manual_fix_required", CODEX_CONFIG_PATH, note)
        for note in model_migration_notes(source_model)
    )
    config_toml = render_codex_config(
        model=source_model,
        permission_mode=json_string(settings.get("permissionMode")),
        enabled_mcp_servers=enabled_mcp_servers,
        disabled_mcp_servers=disabled_mcp_servers,
        mcp_servers=mcp_servers,
        codex_hooks_enabled=has_convertible_hooks(scope.source),
    )
    if not config_toml.strip():
        return ConversionResult(report_items=report_items)
    return ConversionResult(
        summary=MigrationSummary(mcp_servers=len(mcp_servers)),
        artifacts=[
            PlannedArtifact(
                relative_path=CODEX_CONFIG_PATH,
                payload=GeneratedText(config_toml),
            )
        ],
        report_items=report_items,
    )


def render_codex_config(
    model: str | None,
    permission_mode: str | None,
    enabled_mcp_servers: tuple[str, ...],
    disabled_mcp_servers: frozenset[str],
    mcp_servers: tuple[tuple[str, dict[str, object]], ...],
    codex_hooks_enabled: bool,
) -> str:
    document: dict[str, TomlValue] = {}
    target_model = map_model_name(model) if model else None
    if target_model:
        document["model"] = target_model
    sandbox_mode = map_permission_mode(permission_mode)
    if sandbox_mode:
        document["sandbox_mode"] = sandbox_mode

    if mcp_servers:
        document["mcp_servers"] = {
            server_name: mcp_server_toml_table(
                server_name,
                server_config,
                enabled_mcp_servers,
                disabled_mcp_servers,
            )
            for server_name, server_config in mcp_servers
        }

    if codex_hooks_enabled:
        document["features"] = {"codex_hooks": True}

    return render_toml_document(document)


def merge_codex_config(existing: str, generated: str) -> str:
    """Preserve target values and comments; surface conflicting selections."""
    incoming = tomllib.loads(generated)
    current = tomllib.loads(existing)
    if current == incoming:
        return existing
    try:
        import tomlkit
    except ImportError as exc:
        raise RuntimeError(
            "Merging an existing config requires tomlkit to preserve its content. "
            "Run the migrator with 'uv run --with tomlkit python', or install "
            "tomlkit in an isolated Python environment. The existing config was not changed."
        ) from exc

    document = tomlkit.parse(existing)

    def add_missing(target, additions, prefix=()):
        for key, value in additions.items():
            field_path = (*prefix, key)
            if key not in target:
                target[key] = value
            elif isinstance(value, Mapping) and isinstance(target[key], Mapping):
                add_missing(target[key], value, field_path)
            elif target[key] != value:
                raise ValueError(
                    "Existing Codex setting conflicts at "
                    + ".".join(field_path)
                    + "; resolve the selected setting explicitly before retrying. "
                    "The existing config was not changed."
                )

    add_missing(document, incoming)
    return tomlkit.dumps(document)


def validate_config_toml(target_root: Path) -> list[MigrationReportItem]:
    config_path = target_root / CODEX_CONFIG_PATH
    if not config_path.exists():
        return [
            MigrationReportItem(
                "warning",
                CODEX_CONFIG_PATH,
                "not present; no Codex config to validate.",
            )
        ]

    try:
        parsed = tomllib.loads(config_path.read_text())
    except tomllib.TOMLDecodeError as exc:
        return [
            MigrationReportItem(
                "error",
                CODEX_CONFIG_PATH,
                f"invalid TOML: {exc}.",
            )
        ]

    report_items = [
        MigrationReportItem("ok", CODEX_CONFIG_PATH, "valid TOML."),
    ]
    report_items.extend(validate_mcp_commands(parsed))
    return report_items
