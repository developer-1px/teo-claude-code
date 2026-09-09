---
name: migrate-to-codex
description: "Migrate selected Claude Code instructions, skills, agents, hooks, and MCP configuration into Codex files, preserving source files and unrelated target settings."
---

# Migrate to Codex

Complete the selected migration and verify the generated artifacts. Resolve the
source, target, and requested surfaces from the user's request and existing
context before writing.

## Boundaries

Preserve source Claude files, secrets, unrelated code, and unrelated Codex
configuration. Migration authorization covers the selected generated artifacts,
not arbitrary existing skills or settings that happen to share a target root.
Inspect collisions and retain user-maintained content.

Do not infer cross-provider model equivalence or force a personality. The
converter omits Claude model and effort overrides and reports the unmapped
selection. Preserve existing target choices or runtime inheritance; select Sol,
Astra, or another model only from the user's workload, authorization, and current
availability. An explicitly supplied target model ID is not a request to upgrade
to the newest model.

## Inspect and migrate

Use the bundled CLI via its actual absolute path. Do not assume this skill is
installed under a repository's .codex directory. Python 3.11 or newer is needed.
For an existing target config, use an isolated environment with tomlkit
(for example, `uv run --with tomlkit python <script> ...`) so comments and
unrelated values survive merging. Conflicting existing values are reported
without overwriting the file; resolve only the selected setting from the
user's authorized choices, then continue.

Read [references/differences.md](references/differences.md) for the surfaces
being migrated. It describes converter behavior; verify current product docs
when a runtime-dependent mapping matters.

The useful CLI modes are:

- --scan-only: inspect source surfaces without a target or writes.
- --plan: inspect target paths, collisions, and report rows.
- --doctor: inspect readiness and manual-review work.
- --dry-run: inspect the proposed migration without deploying.
- --validate-target: validate an existing generated target.

Inspect the relevant plan, dry-run, then migrate the selected target. Use
--mcp, --skills, or --subagents to select surfaces when appropriate.
Instructions, hooks, and plugin reporting also participate according to the
CLI plan; do not assume a flag limits every artifact category.

Use --replace only when removing the enumerated orphan targets is explicitly
in scope and their contents have been proven disposable. The CLI's "orphan"
classification means absent from the source plan, not proven generated or safe
to delete.

Use an available task plan for a substantial migration. A particular TODO tool
or status schema is not required.

## Verify the result

Inspect the actual generated AGENTS.md, skills, config, hooks, and agent files
for the selected surfaces, plus .codex/migrate-to-codex-report.txt.
Resolve actionable manual-review items that can be fixed within the authorized
target. Keep provider-specific semantics and unavailable mappings visible.

Run --validate-target after edits. Validate meaningful runtime behavior when
the migration changes hooks, permissions, tool routing, or model selection.
TOML parsing alone does not prove these work.

Do not rerun a writing conversion over manually corrected artifacts merely to
make report rows disappear. Preview another run first and rerun it only when
the generated result needs changing. Stop once the selected artifacts are
correct and required checks pass; report unsupported or user-owned decisions
without an indefinite self-healing loop.

## Commands

Replace the example paths with the resolved scope roots and quote paths with
spaces. The CLI normalizes .claude and .codex scope paths; inspect --plan to
verify the actual output locations.

```sh
python3 "/absolute/skill/path/scripts/migrate-to-codex.py" --help
python3 "/absolute/skill/path/scripts/migrate-to-codex.py" --source "/source/scope" --scan-only
python3 "/absolute/skill/path/scripts/migrate-to-codex.py" --source "/source/scope" --target "/target/scope" --plan
python3 "/absolute/skill/path/scripts/migrate-to-codex.py" --source "/source/scope" --target "/target/scope" --dry-run
python3 "/absolute/skill/path/scripts/migrate-to-codex.py" --source "/source/scope" --target "/target/scope"
python3 "/absolute/skill/path/scripts/migrate-to-codex.py" --validate-target "/target/scope"
```

## Handoff

Report what was added or changed, what needs checking before use, what could
not be migrated, and verification. Use a compact table when several artifacts
need comparison, grouped by real scope when useful. State concrete limitations;
do not hide missing capability behind a generic successful migration.
