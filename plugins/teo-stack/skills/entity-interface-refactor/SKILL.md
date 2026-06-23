---
name: entity-interface-refactor
description: Use when refactoring frontend entity folders, FSD feature/entity boundaries, exported type names, prefix alignment, or cohesive entity/viewModel/value-object props so files and UI interfaces are grouped by real domain or UI concepts instead of role labels, generic names, or shredded field props. Trigger on requests such as entities 응집도, 접두어 정렬, 인터페이스 중심 폴더링, FSD 위치 점검, feature/entity 경계 리팩토링, props drill, entity shredding, viewModel props, 엔티티를 그대로 넘기기.
---

# Entity Interface Refactor

Refactor entities by the domain interface they expose, not by incidental file role. The folder tree is an alphabetic navigation surface, so names must sort into meaningful families.

## Goal

- Entity folders name stable domain interfaces: `BillingWallet`, `AdminBillingPlan`, `SessionMessage`.
- Same conceptual family shares the same prefix: `Billing*`, `AdminBilling*`, `Session*`.
- Page-only concepts stay under the page. Cross-page domain concepts live under `entities`.
- Features and widgets consume entity surfaces; they should not invent competing domain names.
- Domain-aware UI receives a cohesive entity, value object, context, or viewModel as one interface when fields move together.
- Shared primitive controls keep scalar contracts such as `label`, `value`, `onChange`, and `disabled`.

## Preflight

1. Check the current branch and dirty files. Do not touch unrelated changes.
2. List entity folders with `find .../entities -maxdepth 2 -type f | sort`.
3. For each candidate, inspect responsibility and consumers with `rg`.
4. For props work, scan for JSX that passes 3+ fields from the same object to a non-shared child.
5. Build a compact table before edits:

| Item | Current | Responsibility | Evidence | Decision | Proposed |
|---|---|---|---|---|---|
| Folder/file/type | Existing name | What changes together | Local usage/imports/protocol | keep/rename/move/split | New name |

## Naming Rules

- Prefer interface nouns over implementation roles.
- Keep protocol/vendor names only at adapter boundaries. When re-exporting, import the external symbol by its original name and alias only the local export, for example `Message as SessionMessage`.
- Avoid generic exported names inside entities: `Message`, `ToolCall`, `SortKey`, `Status`.
- Prefix exported types/functions with the entity family when they are part of that entity surface:
  - `SessionMessage`, `SessionToolCall`, `SessionTurnStats`
  - `parseSessionMessages`, `mergeSessionAssistantMessages`
- Preserve literal protocol/tool names when changing them would alter runtime behavior.
- If two folders sort apart but belong to one family, fix the prefix before splitting deeper.
- If a type is only used by one page and has no cross-page domain meaning, move it to that page instead of creating a new entity.

## Computed Function Rules

Use these when moving `computed`, `useMemo`, selector, derived atom, or hook-return calculations.

- If a pure function's parameters or return value directly use one entity interface/value object, place it under that entity and prefix the export with the entity family, for example `getInvoiceTotals(invoice)` or `buildFileTree(files)`.
- If the concept is page-only, place it under `pages/<page>/entities/<Entity>/lib` or `model`; do not create a global entity just because the function is pure.
- If a `useMemo` only caches a pure entity transform, leave `useMemo` in the component and move the transform body to the entity.
- If a calculation exists to feed one feature's affordance, composes unrelated entities, or names a feature-specific view state, keep it near that feature instead of inventing an entity.
- Do not move event handlers, atom setters, DOM/ref logic, clipboard calls, navigation, JSX/`ReactNode` rendering, class-name decisions, or table column renderer definitions into entities.
- Entities may expose parsers, derived values, data builders, predicates, and formatters for their own interface. They must not depend on `features`, `widgets`, page route models, React hooks, or browser APIs.

## Props Interface Rules

Use these for `features/*`, `widgets/*`, `pages/*`, and page-private UI. Do not apply them to `shared/ui` primitives.

- If a child renders one entity, pass the entity: `task`, `session`, `draft`, `connector`, `flag`.
- If the child renders a UI concept that is not an entity, pass one named value object or viewModel: `header`, `credentialView`, `deliveryContext`, `taskCard`, `flagCard`.
- A viewModel/value object is acceptable when it composes several entities or adds owner-derived UI state to an entity.
- A viewModel/value object is a smell when it only shreds one entity or snapshot into renamed fields.
- Do not call every bag of props a viewModel. It must name the thing the child renders or the context it needs.
- If the child needs derived state plus an entity, build that viewModel in the owner before passing it.
- Do not pass several keyed maps and keys to a row/card so it can look itself up. Build the row/card viewModel in the owner.
- Do not split a snapshot into sibling props when the snapshot fields are valid only together.
- Keep scalar props for shared controls and terminal DOM/control boundaries.
- Keep page/tab boundaries that combine independent datasets unless the child clearly renders one cohesive viewModel.
- Keep one-owner domain UI as private components inside the owning entity/feature/widget file. Promote to a separate file/export/story only after a real second production consumer or a stable public entity surface appears.

Good:

```tsx
<TaskListPanel snapshot={taskSnapshot} />
<AdminFlagCard flag={flagCard} />
<InboxPanelHeader header={header} />
<ConnectorCredentialCard credentialView={credentialView} />
<InboxDeliverySummary delivery={{ draft, selectedSession, environment }} />
```

Avoid outside `shared/ui`:

```tsx
<TaskListPanel tasks={taskSnapshot.tasks} total={taskSnapshot.total} truncated={taskSnapshot.truncated} />
<AdminFlagCard def={def} drafts={drafts} descs={descs} timeseries={timeseries} />
<InboxPanelHeader tab={tab} inboxView={inboxView} saving={saving} settingsMode={settingsMode} />
<TaskCard taskTitle={task.title} taskStatus={task.status} taskUpdatedAt={task.updatedAt} />
```

## Refactor Loop

1. Rename one cohesive family at a time.
2. Rename files first, then entity exports, then consumers.
3. Scope mechanical replacements by import source, especially for generic words like `Message`.
4. Prefer `rg -l -0 ... | xargs -0 perl -pi -e ...` for safe bulk renames.
5. After bulk replacement, inspect adapter/re-export files manually because aliases can be over-rewritten.
6. Run `rg` for old paths and old exported names.
7. For props work, move lookups/derivations to the owner before changing child props.
8. For computed work, scan `useMemo`, derived atoms, selector hooks, and render-body collection transforms; classify each as entity pure transform, feature view state, or UI/presentation logic before moving it.
9. Run focused tests plus typecheck.
10. Commit the completed family before starting the next one.

## Hook Cohesion Scanner

Use the bundled scanner when checking whether one hook mixes unrelated scripts:

```bash
node ~/.codex/skills/entity-interface-refactor/scripts/find-disconnected-hooks.mjs apps/frontend/web-ui/src/ui
```

The scanner builds a top-level dependency graph inside each `use*` function.

- `SPLIT`: return-producing graph and side-effect/action graph are disconnected.
- `REVIEW`: multiple disconnected graphs exist, but they may be intentional registration groups.
- `IGNORE`: one connected graph, or no useful split signal.

Treat output as candidate discovery, not final proof. Split only when the disconnected graphs have different change reasons.

Typical split:

```tsx
useChatPageMessageActions()
const view = useChatPageViewState()
```

Avoid hiding unrelated graphs behind a vague hook name such as `useFooView`. If a hook only composes smaller cohesive hooks, name it as a controller/facade and keep its body thin.

## Verification

- `npm -w apps/frontend/web-ui run typecheck`
- Focused entity tests when relevant:
  - `npx tsx --test apps/frontend/web-ui/src/ui/__tests__/entityContracts.test.ts`
- Add feature-specific tests if the rename crosses behavior boundaries.

## Drift Signals

- Folder names are `api`, `model`, `queries`, `helpers`, or broad role words.
- One file exports several unrelated interfaces.
- Consumers import a generic type whose meaning is only clear from the import path.
- A page-only concern appears in `entities`.
- A feature or widget owns domain state/types that should be a reusable entity surface.
- A non-shared row/card/panel receives 3+ props from the same entity or snapshot.
- A child receives a map plus a key only to reconstruct one row/card model.
- A private child receives several fields that are not an entity, but clearly form one named UI state such as a header, credential display, or delivery context.
- A component file or story exists only for a single production caller's title, label, separator, meta row, or text block; inline it as a private component in the owner instead of treating it as an entity surface.
