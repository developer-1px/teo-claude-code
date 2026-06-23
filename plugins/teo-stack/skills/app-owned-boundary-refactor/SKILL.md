---
name: app-owned-boundary-refactor
description: >-
  Refactor frontend source trees so layer/slice/segment(role) hierarchy stays
  clear. Treat FSD names such as shared/entities/features/widgets/app as examples,
  not as the required target. Use when the user asks to reorganize src, separate
  app-owned code from reusable packages, remove layer smells, or clarify 책임 경계.
---

# App-Owned Boundary Refactor

## Intent

Restructure a frontend app so reusable headless behavior stays in `packages` or existing external packages, while app-owned code keeps a clear `layer > slice > segment(role)` hierarchy. Optimize for responsibility boundaries and dependency direction, not cosmetic folder names.

## Hierarchy Rule

The primary rule is:

```txt
layer > slice > segment(role)
```

- `layer`: architectural dependency level, such as package/core/entities/foundation/engine/host/renderer/app, or shared/entities/features/widgets/app.
- `slice`: cohesive domain or use-case area inside that layer, such as document, command, selection, toolbar, workspace, or user-profile.
- `segment(role)`: implementation role inside a slice, such as model, ui, hooks, ports, adapters, tests, schemas, or effects.

Prefer the repository's existing layer vocabulary when it is coherent. Do not force FSD folder names onto a codebase that already has clearer domain layers.

## Example Shape

FSD-style names are one possible shape, not the rule:

```txt
packages/*           reusable headless engines; must not import src/*
src/shared/*         domain-free app-local utilities, hooks, test support, environment ports
src/entities/*       app data interfaces; folder names are interface names
src/features/*       leaf app use cases over entities/packages
src/widgets/*        screen blocks and user-facing composition
src/app/*            app shell, entry, command adapters, previews, devtools wiring
```

Another valid shape can be:

```txt
src/core/*           primitive kernel
src/entities/*       serializable contracts
src/foundation/*     domain algorithms over adapters
src/engine/*         reusable headless capabilities
src/host/*           concrete document/item implementation
src/renderer/*       visual projection
src/app/*            app-owned orchestration
```

Use `ui` for TSX view files when a slice needs a view segment. Do not use `ui` as a generic components bucket; if one slice's `ui` folder contains multiple peer screen blocks with independent reasons to change, the slice is too broad and must be split first. Use `hooks`, `adapters`, or `effects` for `use*` files that subscribe to product runtime, query clients, navigation, browser APIs, or mutation ports. Use `model` for pure commands, reducers, ports, schemas, selectors, action types, and non-React logic. If local convention currently places runtime adapter hooks such as `use*ProductStore` under `model`, classify the file by responsibility first: it is an adapter/hook role living in a transitional or local segment name, not proof that pure model may own effects. Prefer explicit `hooks`, `adapters`, or `effects` segments for new or touched runtime code when that does not create noisy churn. These segment names are conventions, not mandatory when the repository already has better local names.

When a repository has already chosen a domain page shape such as `pages/<domain>/app`, `pages/<domain>/pages/*`, page-local `features`, `widgets`, and `entities`, do not introduce a parallel concept such as `layout` for the same shell/frame responsibility. Prefer the local term, keep peer folders at the same semantic level, and avoid mixing route pages, slices, role segments, and loose TSX files in one directory.

## Boundary Rules

- `packages/*` may depend on other packages, never on app `src/*`.
- Lower/reusable layers must not depend on higher/app-owned layers.
- Imports should point toward lower layers or stay inside the same layer/slice.
- A slice should not import a sibling slice unless the repository explicitly defines that as a stable public contract. If sibling coordination appears, classify it as orchestration and move it to a higher composition layer.
- App/shell layers may compose lower layers, but lower layers must not import app/shell code.
- Higher composition layers such as pages, widgets, and app may import lower feature/entity public contracts, stores, and action types to compose them. Lower feature/entity slices must not import higher widget/page internals; move shared types down to the owning feature/entity/domain model instead.
- Parent stores may lift or route child actions, but child state/action types stay owned by the child slice. Do not redefine a child contract in the parent just to avoid an import.
- Put mutation ports near the data interface when they describe data writes for that interface.
- Put environment ports such as clipboard/prompt/storage bridges in `shared`.
- Runtime adapters may depend on product hooks, query clients, mutations, navigation, and browser effects at the edge. Pure reducers/selectors/action builders must not import those runtime concerns.
- Do not introduce generic page-local buckets such as `parts`, `components`, `sections`, or `blocks` unless the repository already documents them as real layers. When a folder name describes size or reuse status instead of responsibility, treat it as a boundary smell and replace it with a named slice.

## Handler Ownership Lens

Use handler density as a responsibility smell, not as an absolute rule. First distinguish **public component API** from **leaf DOM event binding**.

- Public component props in app-owned `pages`, `widgets`, `features`, and `entities` should not expose DOM-shaped user-intent callbacks such as `onOpen`, `onSelect`, `onToggle`, `onSubmit`, or `handleChange`. Prefer `[state, dispatch]`, a named `store`, `dispatch`, or an explicit action descriptor. Exceptions are framework/library-required APIs such as DOM `onClick` on native elements, external render props, API callbacks such as React Query `onSuccess`, and stable port callbacks whose responsibility is the port itself.
- Leaf UI components may bind DOM events directly (`onClick`, `onChange`, keyboard handlers, pointer/drag handlers). The leaf handler should be a local `handle*` function that translates the DOM event into a domain/user-intent action and calls `dispatch(action)`. Do not pass the local `handle*` function upward or sideways as component API.
- If a leaf only turns its own entity identity into a non-mutating intent such as `open`, `select`, or `focus`, it may stay with the closest entity/view owner when that keeps data rendering cohesive. Move mutation, validation, command execution, routing, and multi-step interaction ownership to a named feature/affordance slice.

- In FSD-like page trees where the project convention is "UI-only Pages/Widgets", treat DOM/user-event binding that owns use-case behavior, mutation intent, validation, keyboard flow, drag/gesture flow, or command routing as a feature-boundary marker for the smallest handler-owning leaf or affordance. Preserve or introduce a widget shell for the visible page block, then move only that interactive leaf into the closest `features/<use-case>/ui`. Simple entity identity dispatch such as `open/select/focus` can stay with the closest entity/view owner when it has no mutation or routing knowledge.
- Do not reclassify an entire visible widget as a feature just because one child binds an event. Split the block: `Page*` composes page widgets, widgets own layout-only shells and visible sections, and features own the local interactive leaves those widgets compose.
- Do not satisfy handler ownership by hiding handlers in a hook while leaving the visual handler-bound component in the wrong owner. Hooks may support a feature, but the handler-owning UI component should move with the feature when the handler owns use-case behavior. Local leaf handlers that only dispatch explicit actions stay with the closest responsible view.
- Page layers may coordinate route/page state and pass explicit stores such as `[state, dispatch]` to page widgets. Page-scoped widgets should not expose DOM-shaped `on*` user-intent handler props as their public boundary. If coordination needs local state, keep the visible shell in the widget and put the direct interactive boundary in a feature component that receives a store, dispatch, or intent-named action object.
- Contract/data layers: keep event handlers minimal. They should primarily expose data interfaces, parsers, formatting helpers, queries/mutations for that interface, and tiny presentational views.
- Use-case/affordance slices: usually own at least one user-intent action or handler such as `select`, `submit`, `save`, `delete`, `toggle`, `retry`, `refresh`, drag, keyboard routing, or command registration.
- Composition/shell layers: minimize low-level handlers. They may bind commands to JSX, but field event conversion, validation, mutation intent, keyboard flow, and multi-step selection logic should live in lower feature/affordance hooks or model segments.
- In FSD-style repos, the above often maps to `entities`, `features`, and `widgets/app`; treat that as a translation, not a requirement.

## Data / Action Placement Lens

Use data rendering and user action ownership as the first split when a UI component is hard to classify.

- If a component primarily renders data for a stable interface and has no user-intent handlers, put it in the owning `entities/<interface>/ui`. It may accept display slots for already-built controls, but it should not own mutation intent.
- If a component owns mutation intent, validation, command execution, routing, keyboard flow, menu selection, install/connect/toggle/submit/delete, or translates raw form fields into a domain command, put it in a named `features/<use-case>/ui` slice. It can compose entity views and lower feature controls.
- If a component primarily renders an entity/view model and only dispatches a simple identity action (`open/select/focus`) for itself, prefer the closest owner over a forced feature move. Use a `dispatch`/action boundary so the entity view does not know the mutation or routing implementation.
- If a data-only helper has only one owner and no stable second caller yet, keep it inside the owning feature/widget slice instead of promoting it to a vague shared folder.
- If a page-local component is shared by multiple widgets, name the shared responsibility: use `features/ConnectorDetailPanel`, `features/SkillTemplateCatalogSection`, `entities/Connector`, etc. Do not create `parts/*` just because the component is "not directly composed by Page".
- Keep tiny subcomponents inside the owning slice unless they have an independent reason to change or a stable interface worth naming.

## Component Surface / Story Lens

Use this lens when deciding whether a small TSX component deserves its own file, export, or story.

- If a component has exactly one production caller, keep it as a private non-exported component in the owning file. Do not create a separate module or story just to name a helper such as a title, label, meta item, separator, or card text block.
- Promote a component to its own file only when it has a stable public boundary, two or more production callers, or an independent reason to change from the owner. Story-only reuse is not enough.
- Two or more production callers can justify keeping a tiny class wrapper module to prevent markup/CSS drift, but that still does not make it a story surface. Class-only wrappers such as title, description, label, dropdown text, and icon frame should be inspected through the owning page/widget/feature stories, not as standalone canvas stories.
- Add stories for page, widget, feature, entity, or shared UI surfaces that are real public inspection points. Do not add stories for private one-owner subcomponents.
- When deleting or inlining one-owner components, preserve the CSS class mapping in the file that owns the markup and keep any class-name convention discoverable from that owner.
- Do not replace TSX component boundaries with `renderXxx()` or icon/helper functions. Prefer private `<Component />` declarations in the same file when JSX structure deserves a local name.

## Store / Hook Cohesion Lens

Use stores and hooks to clarify ownership, not to hide coupling.

- Do not create a custom hook whose only job is to bundle unrelated queries, mutations, selections, catalog state, detail state, and command dispatchers into one return object. That raises coupling while making the JSX look smaller.
- Split hooks by cohesive reason to change: runtime source, entity adapter, feature command, local UI reducer, or page selection. If those pieces are inseparable in the domain, a single page/widget store can be simpler than several artificial stores.
- Store boundaries should usually follow UI ownership or data/source ownership, not component count. Avoid `catalogStore/detailStore/connectorStore` splits when they constantly reach into each other; either keep one cohesive page/widget store or split the actual owning concepts.
- A `[state, dispatch]` store is a component boundary contract. Keep state serializable or view-model shaped when practical, and keep side effects in the owning page/widget/feature dispatcher or command adapter.
- Hooks may compute or subscribe, but they should not be used to bypass the handler ownership rule. The visual leaf that binds a user event should still dispatch an explicit action.

## Product Surface / Store Adapter Lens

Use this lens for non-trivial product surfaces that need the same UI to run against product runtime, story/canvas fixtures, tests, or mocks.

- Treat `[state, dispatch]`, a named store, or an explicit action contract as the public UI boundary. A view component such as `*View.tsx` should consume that contract and avoid importing product runtime.
- Pure store model owns state shape, actions, reducers, selectors, and deterministic projection. It must not import React Query, router APIs, browser APIs, JSX, or mutation implementations.
- Product adapters create the store from real hooks, queries, mutations, navigation, and effects. Fixture/story/mock adapters create the same store contract from fake data or local reducers.
- A widget/page composition store may own read-side projection, panel selection, child-store wiring, and page-level dispatch routing. Feature slices should own mutation intent, validation, command payloads, and use-case state transitions.
- If a widget product adapter triggers a feature mutation, it should call a feature-owned command/port or dispatch a feature-owned action. Avoid making feature form payloads, validation, or command semantics private widget model details.
- Thin child-store projection wrappers are acceptable when they lift child dispatch, isolate a child contract, or make product/story/test replacement easier. They are a smell when they only alias fields for one caller and add no boundary.
- When a repository keeps runtime `use*ProductStore` files under `model`, report it as a role/folder mismatch or transitional convention before treating it as a boundary violation. For touched code, prefer separating pure reducer files from runtime adapter files even if they remain in the same folder temporarily.

## TSX Composition Smell Lens

Use this lens when a TSX file imports many queries, mutations, reducers, helpers, and child components but only some of them appear in JSX.

- A TSX component should primarily compose JSX, read a small amount of local view state, and wire stores/dispatchers to visible children. If the render function is dominated by non-JSX script, derived maps, mutation feedback assembly, command mapping, or unrelated store construction, treat it as a composition smell.
- Move deterministic non-React transforms to the nearest owning `model` or `lib`. Keep only the cache/subscription wrapper in the TSX file when needed.
- Move command mapping and mutation orchestration to the owning page/widget/feature dispatcher, not to a generic "god hook" that couples unrelated responsibilities.
- Product wrapper TSX may create an adapter store, but the visible view should be easy to identify and should receive an explicit store contract. If adapter construction dominates the wrapper, move it to an adapter/hook/effects file.
- Avoid importing modules that are not represented by the component's JSX or by the store/dispatch contract it directly owns. Unused or indirectly assembled imports in JSX files are a sign that ownership is leaking.

## Derived Data Lens

Use this lens when refactoring `computed`, `useMemo`, derived atoms, selector hooks, or render-body `map/filter/reduce/sort/new Set/new Map` calculations.

- Do not classify by the presence of `useMemo`. Classify by what the calculation owns.
- If the calculation is deterministic, side-effect free, and its inputs/outputs are an entity interface or value object, move the core transform to the owning entity's `model` or `lib`. Keep only the cache/subscription wrapper such as `useMemo(() => computeX(input), [input])` in UI code.
- If the entity meaning exists only inside one page, use a page-local entity such as `pages/<page>/entities/<Entity>/lib`. Do not promote page-only computed functions to global `src/entities`.
- If the calculation composes several entities into one feature-specific view state, keep it in the nearest owning feature/widget `model` or `lib` and name the view state. Do not force it into an entity that does not own the concept.
- If the calculation creates JSX, `ReactNode`, class names, table column renderers, DOM measurements, refs, clipboard/navigation effects, or user-event semantics, keep it in feature/widget UI. These are presentation or action responsibilities, not entity computed functions.
- Entity computed functions must not import React, Jotai setters, DOM/browser APIs, feature slices, widget slices, or page route models. Page-local entities follow the same rule inside their page boundary.

## Route / Page / Widget Lens

For FSD-like frontend trees, classify by screen responsibility before trusting the folder name.

- A `Route` file selects one `Page*` entry for the URL. Route files read URL/search/hash/params, create route-derived page props and callbacks, and pass those props to the Page. Route files must not become the screen composition layer.
- A route should normally import exactly one route-selected `Page*` for that URL. If it imports page widgets/features directly, the route is taking over page composition.
- A `Page` is the route-selected screen composition surface. It receives route-derived props, sets page/body metadata when local convention requires it, owns the page shell/frame, and visibly composes the page-level widgets/sections that make up the screen.
- Route-derived props stop at `Page*`. Page-scoped `widgets`, `features`, and entities must not import page route models, receive a `route` prop object, or know router APIs unless they are explicitly route adapters.
- Do not make `Page*` a pass-through wrapper that returns one opaque `*Workspace`, `*Surface`, `*View`, `*Shell`, or equivalent container. If that component owns route-derived action wiring, route layout, side/center/right regions, page-level providers, `<main>`, shell/frame selection, or whole-screen composition, move that composition up into `Page*`.
- A page-scoped `widgets/*` component is one visible page block directly composed by `Page*`, such as a tab panel, sidebar, detail panel, stage, carousel, table panel, or inspector panel. It is not "global" just because the folder is named `widgets`; if it only belongs to one route, keep it near that route.
- If the project has chosen UI-only Pages/Widgets, a page-scoped widget remains the visible block shell. Split, do not collapse: keep the directly composed page block in `widgets/*`, and move only handler-binding leaves or affordances to page-local `features/*`.
- Page-local components that are not directly composed by `Page*` should live under the closest owning widget/feature. When they are shared by multiple page widgets but still not reusable outside the page, promote them to a named page-local `features/*` or `entities/*` slice based on whether they own user action or data rendering. Do not use `parts/*` as a neutral holding area.
- Do not put `*Page`, `*PageSurface`, `*Workspace` route shells, `<main>`, global modals, or whole-screen composition under global or page `widgets/*`. Avoid naming a page widget `*Workspace` when it composes multiple peer page regions; split the shell into `Page*`, then keep the individual screen blocks under page-scoped `widgets/*`.
- Default to internal state/data near the visible widget that owns the page block, while keeping direct event handlers in feature UI leaves under that widget. Promote props only when the same component is rendered by two or more callers with genuinely different data/behavior, or when a higher layer must coordinate it.
- Treat a page-scoped widget's public props as a boundary. Do not pass DOM-shaped `on*` props into widgets to pretend they are presentational. If the parent must coordinate page-wide behavior, pass explicit state/action props, `[state, dispatch]`, or a named store, and let feature leaves bind the user event.
- If markup and classes are the same, either use the same component or deliberately share only the class/CSS while keeping separate components. Avoid near-duplicate visual structures drifting apart accidentally.
- Keep `shared` for domain-free, cross-page primitives and controls. Move to `shared` only after a real second owner appears.
- Do not use `shared` for domain concepts just because more than one page uses them. If the shared concept still belongs to a domain or route family, keep it in that domain's upper `entities`, `features`, or `widgets` layer. Example: `pages/skills/features/*` is skills-domain common; `shared/*` is non-domain app-local infrastructure or primitives.
- When a folder contains peer slice folders, keep the peer folders at the same semantic level. Do not mix page folders, slice folders, role folders, and loose TSX files in one directory. If a page-local feature needs UI, use `pages/<Page>/features/<Feature>/ui/*`; if it needs model code, use `pages/<Page>/features/<Feature>/model/*`.
- Prefer the closest owner. Page-only `entities`, `features`, and `widgets` live under that page. If ownership is genuinely split across sibling pages inside one domain area, use the domain area's upper `entities`, `features`, or `widgets` before considering `shared`.
- Avoid dumping page-specific data into a page-level `model` by default. Put data and helper logic near the closest owning `entity`, `feature`, or `widget`; route metadata can stay with the page.
- Distinguish UI handlers from API callbacks. `onSuccess`, `onError`, runtime subscriptions, and port callbacks can live near the data interface when they describe that interface; do not count them the same as DOM or user-intent handlers.

## Workflow

```
Read tree -> map layer > slice > segment -> classify responsibility -> move files/tests -> remove smells -> verify behavior
```

- Start with `find src packages -maxdepth 3 -type d | sort` and package metadata.
- Identify the repo's existing layer vocabulary before proposing a target shape.
- Classify by responsibility and dependency direction before moving files.
- Use `git mv` where possible and rewrite imports mechanically.
- Preserve tests beside the moved responsibility.
- Put TSX view files under the owning slice's `ui`.
- Put `use*` React hooks under the owning slice's `hooks`, `adapters`, or `effects` according to the repository's local segment vocabulary.
- Put pure logic, reducers, selectors, action types, and action builders under `model`.
- For store-driven surfaces, first identify the pure store contract, the product adapter, and any fixture/story/mock adapter. Then move UI by ownership.
- If the repository currently stores runtime adapter hooks under `model`, keep the behavior intact but avoid mixing runtime adapters and pure reducers/selectors in the same file when touching that area.
- When a composition slice accumulates many `handle*` functions, extract the smallest handler-bound UI leaf into a lower use-case/affordance feature. Support it with hooks/model code only as needed; do not move the handler into a hook while leaving the JSX binder in the composition layer.
- When public props include `on*` or `handle*` callbacks in app-owned page/widget/feature/entity components, first convert the boundary to `[state, dispatch]`, a named store, or explicit action objects. Then decide whether files need to move by responsibility.
- When a contract/data layer UI accumulates DOM handlers, either move that UI to a use-case/affordance slice or split the data view from the interaction wrapper.
- Move upward dependencies down to stable ports, or move the caller up to the composition layer.
- Move sibling-slice orchestration into a higher composition layer.
- Move wrapper imports to direct package/entity imports when the wrapper adds no app responsibility.
- Do not introduce barrels unless they already exist or reduce real coupling.
- Do not extract a package just because code is headless; first make the app boundary explicit.

## Boundary Scans

After moving files, prefer the bundled script:

```sh
node scripts/check-boundaries.mjs /path/to/repo
```

```txt
Package src imports: 0
Sibling slice imports: 0
Layer upward imports: 0
```

For FSD-style repos, one example layer order is:

```txt
Layer order:
shared -> entities -> features -> widgets -> app
```

For domain-layered repos, define the local order first, such as:

```txt
Layer order:
core -> entities -> foundation -> engine -> host -> renderer -> app
```

Imports must point leftward/lower or stay inside the same layer and slice. Packages and external libraries are outside this app-owned layer order.

## Validation

Run checks appropriate to the repo. For this class of refactor, default to:

```sh
pnpm exec tsc -b
pnpm lint
pnpm exec vitest run src
pnpm exec vite build
```

Report any unchanged build warnings separately from failures.

Do not add structure-lock tests during active frontend reorganization unless the project explicitly asks for them. Prefer typecheck, focused behavior tests, story/canvas smoke, and boundary scans. If an existing source-string test only enforces an obsolete folder or callback shape, remove or rewrite it as behavior-oriented verification.

## Reporting

Keep the final report focused: moved boundaries, boundary scan counts, test/build results, role/folder mismatches, and remaining architectural questions. Avoid listing every moved file unless asked.
