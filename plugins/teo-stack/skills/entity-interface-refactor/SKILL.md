---
name: entity-interface-refactor
description: Refactor frontend entity, feature, and widget ownership with a causal UI command/query rule. Use for FSD boundaries, entity UI interaction, feature-only command ownership, props/viewModel/store/dispatch naming, capability leaks, entity shredding, and concept bloat.
---

# Entity Interface Refactor

Make UI ownership mechanically reviewable:

- Only a feature may own UI commands. A feature may also own query-side state.
- Entity and widget code is query-only.
- `entities/**/api` may expose the full CRUD surface, mutation hooks, and cache consistency logic.
- Interfaces must not carry command capability through query-only owners.
- Names must reveal one owner and one concept instead of multiplying wrappers.

This is a UI ownership convention, not a restriction on data-access APIs.

## Classify by causal direction

Trace what caused the state transition. Do not classify by whether the code calls `setState`, `dispatch`, or a mutation hook.

```text
fact or authoritative observation -> projection -> render = Query
user or system intent -> decision -> effect              = Command
```

Use these owners:

| Owner | May contain |
|---|---|
| `entities/**/api` | queries, CRUD clients, mutation hooks, cache invalidation and reconciliation |
| entity model/UI | stable domain facts, pure transforms, read projections, rendering, observable lifecycle fallback |
| feature | intent binding, interactive state, validation, actions, dispatch, mutation orchestration, navigation, clipboard, notification, storage or runtime commands |
| widget | query-only composition of a visible multi-entity screen block |
| shared | domain-free terminal controls, browser primitives, and general utilities |

A query may update a cache, read model, measurement, or rendered fallback after an authoritative observation. A feature is not command-only: it may keep query state coupled to its command lifecycle, such as validation, pending, error, or confirmation state.

Classify in this order:

1. If it is a data-access operation, keep the client or hook in `entities/**/api`.
2. If it binds intent, decides what the intent means, or performs an effect, place it in a feature.
3. If its public interface accepts or exports command capability, place the capability-owning UI in a feature.
4. If it only projects observations, classify it as query-side.
5. Put single-entity query UI with the entity. Put multi-entity visual composition in a widget.
6. If one component mixes both paths, split the query view from the feature-owned command seam.

When causal evidence is genuinely ambiguous, prefer feature ownership until the intent path is disproved.

## Prevent capability leaks

Entity and widget interfaces must not accept, export, or relay:

- command callbacks such as `onSave`, `onDelete`, or `onNavigate`
- `Action`, `Dispatch`, or state-plus-dispatch store tuples
- router, clipboard, notification, storage, or runtime command objects
- interactive `ReactNode` slots such as action menus or control rows
- generic callbacks that merely disguise one of the capabilities above

A widget may render a self-contained feature component. It must not become a transport layer for the feature's command capability. Compose the query widget and command feature at their real common owner, or let the feature own its command seam.

Do not mistake DOM lifecycle callbacks for commands automatically. Trace the causal path. An image `onError` that exposes a visible fallback can remain query-side; a click handler that chooses a mutation cannot.

## Keep command families coherent

For a command-owning feature named `X`, use one exact prefix when the corresponding concepts exist:

```ts
type XState = ...;
type XAction = ...;
type XDispatch = (action: XAction) => void;
type XStore = readonly [XState, XDispatch];
```

Apply these rules:

- Do not invent missing family members only to complete the naming pattern.
- Reserve `dispatch` for an action union. Name a single command with a verb such as `saveSchedule`.
- Within frontend UI command families and component interfaces, reserve `Store` for a state-plus-dispatch tuple. A read-only prop bag is not a store. Internal persistence, registry, or cache modules should use their actual responsibility name.
- Use `Action` for an internal UI transition and `Command` for an explicit request to an external capability when both concepts are needed.
- Rename only after ownership is correct. Matching names do not repair a leaking interface.

A prefix mismatch inside an existing family is a violation. A partial family is not.

## Reduce interface concepts

Treat `Props` as TypeScript plumbing, not a domain concept. Inline private single-use props by default.

Keep a named props type only when at least one condition is true:

- it is a stable public component surface
- it has two or more production consumers
- it is a real adapter seam
- a generic, `forwardRef`, or similar TypeScript constraint makes the name useful
- it expresses a stable entity interface rather than a temporary field list

Prefer one cohesive entity, value object, or justified view model over shredded scalar fields. A view model is justified when it composes multiple entities or adds owner-derived UI state. It is not justified when it merely renames or rewraps one entity.

Before adding any named `Props`, `State`, `View`, `ViewModel`, `Action`, `Dispatch`, `Store`, `Controller`, or `Adapter`, require it to do at least one job:

- reduce facts a caller must know
- express an invariant
- hide behavior or volatile representation
- collapse competing synonyms
- serve a real multi-consumer or adapter seam

Otherwise keep the representation local or reuse the existing concept.

Removing a type name alone is not simplification. Reduce caller knowledge or delete the unnecessary seam.

## Audit before moving code

First inspect repository rules, architecture docs, the dirty worktree, the relevant tree, imports, production consumers, exports, tests, and recent history. Exclude stories, tests, fixtures, and generated files when measuring production residency.

Record evidence in a compact table:

| Item | Current responsibility | Causal path | Interface evidence | Decision |
|---|---|---|---|---|

Search for:

- event bindings and interactive state in entities or widgets
- mutation, router, clipboard, notification, storage, and runtime effects
- callback, dispatch, action, store, or interactive-slot props crossing entity/widget interfaces
- entity imports from feature, widget, page, or app code
- duplicated prop interfaces and pure pass-through wrappers
- private single-use `*Props`, one-field `Store`/`ViewModel`, `Store<never>`, `Dispatch<never>`, and synonym families
- owner-prefix mismatches between `State`, `Action`, `Dispatch`, and `Store`

When hooks appear disconnected from their owner, run:

```bash
node ~/.codex/skills/entity-interface-refactor/scripts/find-disconnected-hooks.mjs <ui-root>
```

Treat its output as candidate evidence, not an automatic violation.

## Refactor in owner-sized slices

1. Choose one entity, feature, or widget family.
2. Draw its query and command causal paths.
3. Split mixed components at the command seam.
4. Move the complete command family together: UI, model, tests, stories, and command-specific types.
5. Preserve entity API CRUD and cache behavior.
6. Shrink the interface and delete obsolete wrappers or aliases.
7. Align the remaining command-family names.
8. Update project-local guards only for hard rules; keep heuristic smells in review tooling.
9. Run focused tests after each owner-sized move.

Use `git mv` for real moves. Do not combine unrelated formatting or cleanup with the ownership change.

## Separate violations from review signals

Automate these hard violations when the repository supports it:

- UI command capability declared or interpreted outside its feature owner, or accepted, exported, or relayed by an entity or widget
- command-family prefix mismatch
- public UI command-family `Store` used for anything other than state plus dispatch
- entity code importing a higher UI owner
- entity API CRUD moved out merely to satisfy UI CQRS

Review these as smells because context can justify them:

- private single-use props types
- one-field bags or view models
- duplicated interfaces and pass-through wrappers
- synonym proliferation or an overgrown concept family
- lifecycle callbacks, measurements, fallbacks, and cache writes whose causal direction needs tracing

## Verify

Run the repository's relevant typecheck, focused tests, architecture guards, and production build. Then search for stale paths, old prefixes, duplicate interfaces, and compatibility aliases.

The refactor is complete only when:

- entity and widget production interfaces are query-only
- every UI command has an identifiable feature owner
- entity API CRUD and cache consistency remain intact
- command families use one owner prefix without fabricated members
- remaining named interfaces pass the concept gate
- no temporary bridge, alias, or pass-through wrapper remains without a documented compatibility need
- behavior, tests, and builds remain equivalent
