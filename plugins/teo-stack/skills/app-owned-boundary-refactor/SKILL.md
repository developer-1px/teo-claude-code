---
name: app-owned-boundary-refactor
description: Refactor frontend source trees so packages, layers, slices, segments, routes, and page-local code have explicit owners and dependency direction. Treat FSD names as examples rather than a required target. Use for src reorganization, app-owned versus reusable placement, route/page/widget residency, and layer smell removal.
---

# App-Owned Boundary Refactor

Reshape the source tree so a reader can answer four questions from paths and imports:

1. Who owns this code?
2. How widely is it reused in production?
3. Which direction may dependencies flow?
4. Is this a reusable package contract or app-owned implementation?

This skill owns placement, residency, and dependency direction. It does not redefine UI command/query ownership or props/store/dispatch conventions. When entity, feature, and widget semantics are in scope, apply `entity-interface-refactor` as the single source of truth for those decisions.

## Discover the repository's vocabulary

Before proposing a target tree:

- read repository instructions and architecture docs
- inspect the dirty worktree and current branch
- list the relevant source tree and package exports
- map production importers, excluding tests, stories, fixtures, and generated files
- inspect route entry points and first-level page composition
- sample history for ambiguous ownership

Do not force FSD names onto a repository that already expresses the same hierarchy with different terms.

Use this generic hierarchy:

```text
layer > slice > segment
```

- A layer defines dependency direction.
- A slice groups one independent owner or change reason.
- A segment groups files by technical role inside that owner.

Names such as `shared`, `entities`, `features`, `widgets`, and `pages` are examples of layers. Names such as `api`, `model`, `ui`, and `lib` are examples of segments. Role-only names such as `components`, `hooks`, `types`, and `utils` are usually weak slice names because they do not identify an owner.

## Establish placement invariants

Adapt these invariants to local terminology:

- app-owned code may depend only toward lower, more reusable layers
- a reusable package must not import app `src`
- app-owned implementation must not leak into reusable package exports
- sibling slices must not silently orchestrate each other
- a public entry point must hide internal file layout when the repository uses facades
- page-local code stays with its closest production owner until reuse is demonstrated
- global placement requires real production ownership by multiple independent consumers, not anticipated reuse

Do not create a layer, slice, barrel, wrapper, or alias merely to make the tree look symmetrical.

## Determine production residency

Classify every candidate by real importers:

| Residency | Default placement |
|---|---|
| one route or page | page-local under that owner |
| one stable domain family | the domain-owned slice |
| multiple independent production owners | a justified global slice or reusable package |
| story, fixture, or test only | keep near its owner or remove if obsolete |
| no importer | investigate as dead or unfinished code |

Do not count re-export barrels as independent consumers. Follow imports to the actual runtime owners.

Promotion and demotion are both normal:

- promote page-local code only after independent reuse exists
- demote global code when it has only one real production owner

## Preserve the route and screen map

For route-based applications, keep the composition legible:

```text
route -> page -> first-level visible blocks -> local internals
```

The page should reveal major visible regions, their order, and route-level visibility. Do not hide the whole screen behind an opaque wrapper whose only job is to mirror the page. A first-level block should correspond to a recognizable screen region, not an arbitrary file-size split.

Keep route-specific state, layout, and composition under the route or page unless another production owner genuinely shares them. Remove stale route-era names and wrappers once the migration is complete.

When the repository uses entity/feature/widget layers, defer whether a block is query-only or command-owning to `entity-interface-refactor`; this skill decides only where the resulting owner belongs in the tree.

## Test whether a seam is real

Before preserving a wrapper, barrel, adapter, or public component, ask:

- Does it hide volatile implementation?
- Does it enforce dependency direction?
- Does it serve multiple real production consumers?
- Does it express a stable contract or invariant?

If deleting the seam only shortens the import path and changes no responsibility, prefer deletion. Keep compatibility aliases only for an explicit migration window and remove them before declaring the refactor complete.

## Build an evidence table

Record the proposed moves before editing:

| Path | Current owner | Production consumers | Dependency issue | Target owner | Decision evidence |
|---|---|---:|---|---|---|

The evidence should distinguish:

- verified production imports
- route/page ownership
- package export constraints
- inferred ownership that still needs confirmation

Do not use file size alone as move evidence.

## Refactor one owner at a time

1. Freeze the target invariants for one owner.
2. Move the owner and its tests, stories, styles, and local types together.
3. Use `git mv` for actual moves.
4. Update direct imports and public entry points.
5. Remove obsolete aliases, barrels, wrappers, and empty directories.
6. Run focused tests and typecheck before moving the next owner.
7. Re-scan production importers and dependency direction.

Preserve the existing UI and behavior unless the user explicitly asks for a redesign. Do not mix unrelated formatting or cleanup into the structural change.

## Check dependency direction

When the repository layout matches the bundled scanner, run:

```bash
node ~/.codex/skills/app-owned-boundary-refactor/scripts/check-boundaries.mjs <repo-root>
```

The scanner checks common app/package and layer-direction violations. Treat it as supporting evidence; inspect its assumptions before applying it to a differently named tree. Add a project-local equivalent when the convention is meant to become enforceable.

Also run the repository's relevant:

- typecheck and focused tests
- architecture or import guards
- production build
- stale-path and old-name searches
- package-boundary checks

## Completion criteria

The refactor is complete only when:

- paths communicate owner, residency, and role
- dependency direction is mechanically checkable
- reusable packages do not depend on app implementation
- route/page composition remains visible
- page-local and global placement matches production reuse
- temporary aliases and pass-through wrappers are removed or explicitly time-bounded
- no duplicate command/query or interface convention has been introduced here
- typecheck, focused tests, guards, and build remain green
