---
name: layer-abstraction-refactor
description: Refactor layered code so dependency direction and abstraction walls are enforced through explicit layer entrypoints. Use for 레이어 추상화, 추상화 벽, facade-only imports, layer skipping, implementation-file imports, application/domain/foundation hierarchies, or public surface cleanup.
---

# Layer Abstraction Refactor

Turn layer folders into enforceable abstraction walls. Upper layers may depend only in the allowed direction and must enter a lower layer through an explicit entrypoint instead of knowing its internal files.

Use precise terms:

- `layer entrypoint` or `facade`: hides a layer's implementation layout
- `variability seam`: allows behavior substitution through multiple justified adapters
- `package public API`: imports available to external package consumers

Do not call every layer entrypoint a seam. Encapsulation and variability are different reasons to introduce a surface.

## Establish invariants

Adapt the names to the repository, then make the rules explicit:

- the first path segment identifies a layer
- dependencies flow only toward lower, more reusable layers
- upper layers do not skip a required intermediate layer
- cross-layer imports target an explicit adjacent-layer entrypoint
- lower layers never import upper layers
- entrypoint allowlists use exact paths, not broad globs
- internal entrypoints do not automatically become package exports
- documentation and automated checks enforce the same rules

Keep an existing package public surface unless the user explicitly approves a breaking change. Do not widen package exports merely to make an internal refactor convenient.

## Inspect before editing

Read repository instructions and architecture docs, then inventory:

```bash
rg --files <src-root>
```

Map each path level:

| Level | Expected meaning |
|---|---|
| first segment | layer |
| second segment | owner, concept, or slice inside the layer |
| deeper segment | technical role or private implementation |

Inspect package exports and all static imports/re-exports. Resolve source conventions such as TypeScript imports ending in `.js` back to their actual source files.

Count at least:

- upper-to-adjacent-lower crossings
- layer skips
- reverse imports
- imports targeting lower-layer implementation files
- package exports added only for internal use

Report counts with target paths and explain which lower-layer vocabulary leaks upward.

## Classify smells

Treat these as violations:

- layer skip, such as `application` importing `foundation` through a required `domain` layer
- reverse dependency from lower to upper
- implementation leak through imports such as `domain/document/state/runtime`
- facade in name only that re-exports the entire lower layer
- package export widened for a repository-internal entrypoint
- a role-only folder such as `types` or `utils` occupying the owner/slice level
- different category kinds mixed at the same path depth

A technical file such as `types.ts` may be valid inside an owner-named slice. It is a smell only when the role name replaces the owner.

Explain each smell as a change-propagation problem: which upper imports must change when lower implementation moves?

## Design the target wall

Prefer this shape when it matches the repository:

```text
src/
  application/<concept>/index
  domain/<concept>/index
  foundation/<concept>/index
```

Define allowed crossings explicitly:

```text
application -> domain/<concept>/index
domain      -> foundation/<concept>/index
```

An entrypoint should expose the narrow contract the upper layer needs, not mirror every internal file. Preserve standard and domain vocabulary in exported names.

Prove the structure on one representative owner before migrating the rest:

1. add or narrow the lower-layer entrypoint
2. move one upper-layer import family to it
3. confirm the upper layer no longer names lower implementation files
4. move an internal lower file and verify upper imports remain unchanged

## Refactor in crossing-sized steps

1. Add the required lower-layer entrypoint without widening package exports.
2. Redirect one crossing family to the entrypoint.
3. Move misplaced orchestration or runtime code to its actual owner.
4. Leave only upper-layer policy, use-case composition, or framework adaptation above.
5. Remove obsolete re-exports and compatibility paths.
6. Add exact allowed entrypoints to the repository's layer checker.
7. Update the repository's architecture SSOT with the same rules.
8. Repeat only after focused verification passes.

Use `git mv` for real moves and preserve unrelated worktree changes.

## Verify mechanically

Use repository commands first. At minimum verify:

- typecheck, focused tests, and relevant build
- reverse imports: zero
- skipped-layer imports: zero unless explicitly documented
- non-entrypoint crossings: zero
- package exports unchanged unless deliberately approved
- old internal import paths: zero

The checker should enforce exact layer names, direction, adjacency, and allowed entrypoint paths. Avoid prefix or glob exceptions that turn the wall into a convention-only rule.

## Completion criteria

Finish only when:

- every cross-layer import follows the documented direction
- upper layers know only adjacent lower-layer entrypoints
- lower implementation files can move without upper import changes
- internal entrypoints and external package APIs remain distinct
- the checker and architecture SSOT agree
- no temporary alias or broad barrel remains without an explicit compatibility window
- relevant tests, typecheck, and build pass
