---
name: responsibility-surface-refactor
description: Stabilize a package/module public surface while moving implementation into responsibility-named internal slices. Use when the user asks for layer > slice cleanup, package index/facade cleanup, public API preserving refactors, "same picture" refactoring, or splitting many modules by responsibility without changing imports.
---

# Responsibility Surface Refactor

Refactor toward this shape:

```txt
public surface / facade
  -> small responsibility slices
     -> lower-level domain/foundation primitives
```

The goal is not smaller files. The goal is a stable outside contract with internal code arranged by independent reasons to change.

## Relation To Existing Skills

Use this skill as an orchestration lens when several existing refactor instincts point to the same outcome.

| Skill | It answers | This skill adds |
|---|---|---|
| `srp` | Does this file have more than one reason to change? | How to preserve a public facade while splitting many files/packages. |
| `cohesion` | Which code should move together? | A target surface: stable entrypoint, hidden implementation slices, no new public churn. |
| `app-owned-boundary-refactor` | Where should frontend app code live by layer? | Library/package-neutral rules for public API, internal layer direction, package entrypoints. |
| `entity-interface-refactor` | What domain interface/name should entities expose? | Applies the same interface-first idea to packages/modules, not only frontend entities. |
| `ocp` | Are variants scattered across consumers? | Keep extension points behind a facade when the split would otherwise create new edit sites. |
| `naming` | Is the name aligned with responsibility? | Enforce file names like `types`, `create`, `plan`, `store`, `operations`, `read`, `codec`, `host`. |

## Target Shape

- `index.ts` or package root is a public barrel or thin facade only.
- Existing public imports remain source-compatible unless the user explicitly asks for a breaking change.
- Implementation files are named by responsibility, not by arbitrary role buckets.
- Internal imports flow downward or inward; no value cycles and no type cycles.
- A slice exposes the smallest API needed by the facade or sibling slice.
- Tests stay focused on public behavior unless a new internal helper has meaningful standalone invariants.

Common slice names:

```txt
types       public and cross-slice contracts
create      facade composition / lifecycle wiring
plan        validation, capability checks, patch/action planning
operations  command wrappers or execution mapping
store       maps, snapshots, listeners, id allocation
read        query/read model construction
copy        clone/snapshot copy helpers
errors      error constructors and result mapping
codec       encode/decode/version envelope logic
host        environment adapter lookup
watch       subscription/flush/status lifecycle
```

## Workflow

1. **Map the public surface.**
   Read package exports, tests, docs, and external imports. Write down what must remain import-compatible.

2. **Identify change reasons.**
   For the target file/module, list responsibilities by why they change: facade wiring, types, validation, planning, execution, persistence, search/read, store/listeners, host/codec, copy/error mapping.

3. **Choose slices.**
   Create only slices with a real independent reason to change. Do not split by LOC alone. Keep a large single-responsibility file intact.

4. **Preserve the facade first.**
   Make `index.ts` re-export the same public names from new files. Then move implementation behind it. Public API compatibility is the primary invariant.

5. **Move by responsibility.**
   Move related functions/types together. Prefer local imports between sibling slices over pass-through re-export chains. Do not add a new abstraction unless it removes real coupling.

6. **Check direction.**
   Scan for value cycles, type cycles, and layer inversions. A lower primitive layer must not import an upper facade/application layer.

7. **Verify behavior and contract.**
   Run focused typecheck/tests for touched packages, then the smallest root/package verify that proves public consumers still compile. Use build/smoke when packaging is part of the surface.

## Preflight Template

```markdown
Surface: package/module and public entrypoints
Must preserve: imports, exports, runtime behavior, package metadata
Current mixed responsibilities:
- types/contracts:
- facade/lifecycle:
- validation/planning:
- execution/operations:
- read/search/store/persistence:
Target slices:
- `index.ts`: public barrel/facade
- `types.ts`: ...
- `create.ts`: ...
Risk checks:
- public export diff:
- value/type cycles:
- layer direction:
- verification:
```

## Split Rules

- If a function exists only to compose public API, it belongs in `create.ts` or the facade.
- If a type is part of the public API or used across slices, put it in `types.ts`.
- If code asks “can this happen?” or builds operations without applying them, put it in `plan.ts`, `guard.ts`, or a domain-specific planner.
- If code applies patches, writes hosts, dispatches commands, or mutates stores, put it in `operations.ts`, `apply.ts`, `commit.ts`, or `store.ts`.
- If code encodes external formats or talks to browser/storage/clipboard, split `codec.ts` from `host.ts`.
- If code keeps listeners, ids, maps, snapshots, or mutable state, isolate it in `store.ts` or `state.ts`.
- If a slice name becomes vague (`utils`, `helpers`, `core`), stop and name the actual responsibility.

## Completion Criteria

- Public imports from the package/module still work.
- Entry files are barrels or thin facades, not mixed implementation files.
- Responsibility slices are named after change reasons.
- No new import cycles or layer inversions.
- Relevant typecheck/tests/build/smoke pass.
- If tied to issues, comment with the concrete slices created, verification, and PR link.
