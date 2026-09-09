# Converter coverage and migration differences

This reference describes the bundled converter, not a complete or permanently
current product compatibility matrix. The older exhaustive table was based on
an April 2026 snapshot. Verify current documentation for a mapping that affects
the selected migration, especially hooks, permissions, agent settings, or
plugin layout. Do not fetch every documentation page for an unrelated surface.

## Instructions and skills

The converter inspects CLAUDE.md / AGENTS.md and Claude skill or command files.
Provider-neutral instructions may become symlinks; instructions with
provider-specific behavior need a target copy and semantic review. Do not edit
a source file through a generated symlink.

Directory skills copy supported scripts, references, and assets under the
source root. Legacy single-file skills and slash commands become skill
entrypoints, with provider-only expansion or metadata reported for review.

Tool allowlists preserved as prose do not enforce permissions. Runtime
interpolation, automatic file expansion, skill preload, invocation policy,
model metadata, and hooks need their actual intent mapped to supported target
behavior. Keep explicit-only invocation distinct from model choice.

The CLI writes project-shaped .agents/skills paths relative to its normalized
scope root. Inspect the plan and current discovery contract for global or
account-specific installations; do not assume every Codex host shares one home
directory.

## Models and effort

There is no automatic Claude-family to OpenAI-family equivalence in this
converter. Claude names and aliases are omitted from generated model overrides
and reported, allowing existing target settings or parent inheritance to remain
in effect. Cross-provider effort is also omitted and reported rather than
increased or clamped by a family heuristic.

Explicit target model IDs are preserved; their availability and effort support
still require validation in the target environment. A source inherit/default
selection produces no model override.

Do not replace an old mapping with a new universal flagship pin. Preserve the
workload's cost, latency, and quality role when the user asks to select a target.
The converter does not add a personality default.

## Config and MCP

MCP/settings output goes into .codex/config.toml under the normalized target
scope. Existing files are merged using tomlkit to preserve comments and unrelated
settings; use an isolated Python environment with that package. Conflicting
values are reported before the config is written. The operator resolves only
the setting covered by the user's migration request.

The converter handles common stdio and HTTP server fields, literal environment
values, simple environment references, bearer-token environment references,
and per-server enablement. Complex substitutions, header helpers, OAuth details,
and source policy allow/deny rules can require manual adaptation.

Do not copy credentials into prompts or reports. Verify supported authentication
and transport behavior using the target runtime and current docs. An unsupported
conversion does not establish that the product lacks the capability.

## Agents

Agent files become .codex/agents/*.toml with name, description, and developer
instructions. Missing identifying metadata is inferred and reported.

Model and effort follow the rule above. Source tool lists, skill preload, and
unmapped permission semantics remain review items; prompt guidance is not
isolation or enforced access control. The converter has only partial permission
mappings. Use current runtime permissions rather than translating a source
permission name by intuition.

Without target model/effort overrides, Codex subagents can inherit the parent
selection. Review source agents with deliberately different cost or capability
roles before relying on that inheritance.

## Hooks and plugins

The bundled hook converter emits a supported subset of command hooks into
.codex/hooks.json and may generate a feature setting. Its supported subset is
an implementation limit, not current product documentation.

Inspect the actual event, matcher, command, output, blocking behavior, and
runtime support before relying on a converted hook. Never treat a successfully
parsed file as proof that a permission or lifecycle hook executes.

Plugin trees and marketplace entries are reported for manual migration.
Inspect the available plugin workflow when plugin conversion is requested.
Do not copy a source marketplace layout into Codex without verifying its format.

## Validation and repeated runs

--validate-target checks parseability, required fields, instruction/skill shape,
and some MCP command availability. It does not prove model availability, safe
hook semantics, correct source-to-target meaning, or runtime discovery.

--plan and --dry-run reveal generated paths and collisions. --replace identifies
targets absent from the source plan; it does not prove those targets are unused
or generated. Preserve unrelated target content and preview subsequent writes
so that they do not overwrite manual corrections.

## Current sources

Read the relevant primary documentation when its contract affects the work:

- [Codex configuration](https://developers.openai.com/codex/config-reference)
- [Codex skills](https://developers.openai.com/codex/skills)
- [Codex subagents](https://developers.openai.com/codex/subagents)
- [Codex MCP](https://developers.openai.com/codex/mcp)
- [Codex hooks](https://developers.openai.com/codex/hooks)
- [Codex plugins](https://developers.openai.com/codex/plugins/)
- [Sol prompting](https://developers.openai.com/api/docs/guides/prompt-guidance-gpt-5p6)
- [Astra guidance](https://developers.openai.com/api/docs/guides/latest-model)
