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
src/features/*       app use cases, actions, forms, commands, and behavior surfaces
src/widgets/*        read-only screen blocks and visible layout composition
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

Treat `entities` as interface-centered ownership, not as a convenient data folder. An entity slice owns a stable data/interface concept and its pure types, pure transforms, normalization, projection, and data-only views. Do not put screen layout, product runtime, route state, mutation orchestration, or arbitrary page helper code in an entity just because the code maps over data.

For app-owned UI, use this quick placement rule before inventing a wrapper: delegate visible screen UI and layout to `widgets`, deterministic computed/projection logic to the owning `entities`, and business behavior such as validation, command payload construction, mutation intent, submit/delete/toggle/save flows, and user-action surfaces to `features`. Treat this as the default split; override it only when the repository has an explicit local convention or the code is truly presentation-only and private to one file.

When a repository has already chosen a domain page shape such as `pages/<domain>/app`, `pages/<domain>/pages/*`, page-local `features`, `widgets`, and `entities`, do not introduce a parallel concept such as `layout` for the same shell/frame responsibility. Prefer the local term, keep peer folders at the same semantic level, and avoid mixing route pages, slices, role segments, and loose TSX files in one directory.

When tab routes or subpages are the user's primary screen units, treat each tab as a `Page*`. The `Page*` component must reveal that tab's screen map by directly composing all page widgets. Do not hide the whole tab behind one opaque `*Panel`, `*Workspace`, `*Surface`, `*View`, or `*Shell` wrapper. Page-local `widgets` must be logical screen units visible in the design, such as toolbar, header banner, hero carousel, section, table, sidebar, detail panel, or overlay host. Widgets are read-only screen surfaces: they compose layout, text, entity displays, and feature surfaces, but they do not own event handlers, commands, validation, submit/close/toggle behavior, keyboard routing, or mutation intent. The widget folder tree should match the user's visible screen map: if the screen has Toolbar, HeaderBanner, MCP section, and API section, prefer peer widget folders with those names instead of one broad catalog/panel folder that hides the structure.

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

## Responsibility Closure / Props Lens

Do not split responsibility into props unless that boundary is real.

- `shared/*` primitives are the main place where granular props, DOM callbacks, and generic component APIs are expected. Shared components are domain-free reusable building blocks.
- App-owned `pages`, `widgets`, `features`, and `entities` should keep responsibility closed inside the owning component or slice. If a component is not truly reused with different behavior, do not give it a reusable-looking API such as `connectorName`, `toolName`, `action`, `selectedPermission`, `onSelect`, or `onClose` just to make a small child file.
- Prefer one coarse boundary such as `store`, `[state, dispatch]`, or an owning entity/view-model contract. Let the component derive its own identity, labels, selected state, and action payloads internally.
- If a title, label, row subpart, or read-only visual subpart has only one production owner, keep it as a private non-exported component inside the owning feature/entity/widget file. If a button, menu item, permission option, field, or action control has only one production owner, keep it private inside the owning feature/entity file; do not leave action controls in widgets. Do not create a separate module, public import path, or story for one-owner subparts.
- A feature surface should represent a real behavior unit such as `ConnectorDetailHeaderActions`, `ConnectorDetailToolsSection`, `ConnectorAddDialogFrame`, `ConnectorCatalogFilterControls`, or `CustomCreateMenu`. Its internal buttons and fields can be private subcomponents.
- Promote a smaller component to its own file only when there are two or more production callers, a stable public boundary, or an independent reason to change. Story-only reuse and "the props look reusable" are not enough.
- If extracting a component forces the parent to pass the same entity identity, dispatch, current option, label, and selected state back down, the extraction probably leaked responsibility. Inline it or move the whole behavior surface so it can own the data it needs.

## Handler Ownership Lens

Use handler density as a responsibility smell, not as an absolute rule. First distinguish **public component API** from **leaf DOM event binding**.

- Public component props in app-owned `pages`, `widgets`, `features`, and `entities` should not expose DOM-shaped user-intent callbacks such as `onOpen`, `onSelect`, `onToggle`, `onSubmit`, or `handleChange`. Prefer `[state, dispatch]`, a named `store`, `dispatch`, or an explicit action descriptor. Exceptions are framework/library-required APIs such as DOM `onClick` on native elements, external render props, API callbacks such as React Query `onSuccess`, and stable port callbacks whose responsibility is the port itself.
- Leaf feature or entity UI components may bind DOM events directly (`onClick`, `onChange`, keyboard handlers, pointer/drag handlers). The leaf handler should be a local `handle*` function that translates the DOM event into a domain/user-intent action and calls `dispatch(action)`. Do not pass the local `handle*` function upward or sideways as component API. Page-scoped widgets are not handler leaves; they compose feature/entity leaves.
- If a leaf only turns its own entity identity into a non-mutating intent such as `open`, `select`, or `focus`, it may stay with the closest entity/view owner when that keeps data rendering cohesive. Keep this exception out of widgets. Move mutation, validation, command execution, routing, and multi-step interaction ownership to a named feature/affordance slice.

- In FSD-like page trees where the project convention is "UI-only Pages/Widgets", treat any DOM/user-event binding inside a widget as a feature-boundary marker. Keep the logical screen unit as the page-composed widget, then move the behavior surface into the closest `features/<use-case>/ui`. Simple entity identity dispatch such as `open/select/focus` can stay with the closest entity/view owner when it has no mutation or routing knowledge, but not inside widgets.
- Do not reclassify an entire visible widget as a feature just because one child binds an event. Split the block: `Page*` composes page widgets, widgets own layout-only shells and visible sections, and features own coherent behavior surfaces that widgets compose.
- Do not satisfy handler ownership by hiding handlers in a hook while leaving the visual handler-bound component in the wrong owner. Hooks may support a feature, but the handler-owning UI component should move with the feature when the handler owns use-case behavior. Local leaf handlers that only dispatch explicit actions stay with the closest responsible view.
- Page layers may coordinate route/page state and pass explicit stores such as `[state, dispatch]` to page widgets. Page-scoped widgets should not expose DOM-shaped `on*` user-intent handler props as their public boundary.
- Page-scoped widgets should have no DOM event handlers or `handle*` functions. This includes structural behavior such as overlay backdrop close, dialog close buttons, carousel dots, hover/pause, keyboard routing, search fields, select filters, toggles, submit buttons, menu items, and command buttons. Wrap those behaviors in nearest named feature surfaces and let those features translate DOM/shared callbacks into domain actions.
- Widgets may directly use shared layout and typography primitives when those primitives do not own user intent, such as content headers, layout toolbars, frames, stacks, or surfaces. Shared interactive primitives belong inside feature surfaces when they create or change domain/page state. A toolbar widget, for example, should compose `ConnectorCatalogFilterControls` and `ConnectorAddMenu` feature surfaces rather than directly importing `ToolbarSearchField`, `SelectFilter`, `Switch`, or menu item callbacks.
- Contract/data layers: keep event handlers minimal. They should primarily expose data interfaces, parsers, formatting helpers, queries/mutations for that interface, and tiny presentational views.
- Use-case/affordance slices: usually own at least one user-intent action or handler such as `select`, `submit`, `save`, `delete`, `toggle`, `retry`, `refresh`, drag, keyboard routing, or command registration.
- Composition/shell layers may route stores and compose feature surfaces. Widgets should remain read-only; field event conversion, validation, mutation intent, keyboard flow, close behavior, and multi-step selection logic should live in lower feature/affordance UI, hooks, or model segments.
- In FSD-style repos, the above often maps to `entities`, `features`, and `widgets/app`; treat that as a translation, not a requirement.

## Data / Action Placement Lens

Use data rendering and user action ownership as the first split when a UI component is hard to classify.

- If a component primarily renders data for a stable interface and has no user-intent handlers, put it in the owning `entities/<interface>/ui`. It may accept display slots for already-built controls, but it should not own mutation intent.
- Extract to `entities` only around a named interface or data concept. Keep pure functions there when their inputs and outputs are that interface or its value objects. If the data exists only to support one visible screen block, prefer a page-local entity such as `pages/<Page>/entities/<Entity>/model` over global `src/entities`; do not put deterministic projection into a widget model just because the widget displays it.
- Do not use `entities` for screen shape. Repeated rendering is only an entity signal when the repeated item has a stable interface boundary; if the repeated structure is a visible screen region, it is still a widget/section concern.
- If a component owns mutation intent, validation, command execution, routing, keyboard flow, menu selection, install/connect/toggle/submit/delete, or translates raw form fields into a domain command, put it in a named `features/<use-case>/ui` slice. It can compose entity views and lower feature controls.
- If a component primarily renders an entity/view model and only dispatches a simple identity action (`open/select/focus`) for itself, prefer the closest owner over a forced feature move. Use a `dispatch`/action boundary so the entity view does not know the mutation or routing implementation.
- If a data-only helper has only one owner and no stable second caller yet, keep it in the closest page-local entity when it is deterministic entity/value projection. Keep it private inside the owning feature only when it builds command payloads or use-case state. Keep it private inside widget UI only when it is presentation-only formatting, class selection, or markup-local data.
- If a page-local component is shared by multiple widgets, name the shared responsibility: use `features/ConnectorDetailPanel`, `widgets/SkillTemplateCatalog`, `entities/Connector`, etc. Do not create `parts/*` just because the component is "not directly composed by Page".
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

Use stores and hooks to clarify state ownership, not to hide coupling.

- Store boundaries are data/state ownership boundaries. Split by the slice's invariant, lifecycle, persistence/source, and reason to change, not by widget names, JSX regions, or the desire to make a component shorter.
- In page trees that use `Page*.tsx` and `Page*.hooks.ts`, do not add a page-root `hooks/` folder beside the `Page*` file for page-only orchestration. Keep route/page lifecycle wiring, page runtime-source adapters, page selection sync, and page command routing in `Page*.hooks.ts`. If the file starts collecting unrelated behavior, distribute that behavior to the owning `features/<Feature>/hooks`, `features/<Feature>/model`, or `entities/<Entity>/model` instead of creating more page-root hook files.
- Do not create `catalogStore`, `detailStore`, `panelStore`, or `workspaceStore` wrappers whose only job is to bundle unrelated queries, mutations, selections, local UI state, and command dispatchers into one return object. That raises coupling while making the JSX look smaller.
- Avoid store-to-store dependencies. One store should not call another store's methods or receive another store as an option. Cross-slice orchestration belongs in the page/app command dispatcher, an effect/adapter layer, or a selector over independent state slices.
- Reducer/slice units should follow state shape: runtime source, browse/filter selection, connection state, dialog draft, permission draft, mutation feedback, etc. Reuse action/reducer/selectors across UI surfaces instead of inventing a widget-level store for each surface. Reducer state may live at the page when the page is the SSOT; computed selectors over entity/value state should live in the owning entity model, and business command reducers/actions should live in the owning feature model.
- If several stores constantly reach into each other, either collapse them into one real data boundary or split the actual owning state concepts. Do not keep artificial `catalog/detail/connector` stores just because matching component names exist.
- A `[state, dispatch]` store is a component boundary contract. Keep state serializable or view-model shaped when practical, and keep side effects in the owning page/feature dispatcher or command adapter.
- Hooks may compute or subscribe, but they should not be used to bypass the handler ownership rule. The visual leaf that binds a user event should still dispatch an explicit action.

## Product Surface / Store Adapter Lens

Use this lens for non-trivial product surfaces that need the same UI to run against product runtime, story/canvas fixtures, tests, or mocks.

- Treat `[state, dispatch]`, a named store, or an explicit action contract as the public UI boundary. If a separate public view component is justified by a real second caller or stable inspection surface, it should consume that contract and avoid importing product runtime. Do not create a separate `*View.tsx` only for story convenience or to hide product adapter complexity.
- Pure store model owns state shape, actions, reducers, selectors, and deterministic projection. It must not import React Query, router APIs, browser APIs, JSX, or mutation implementations.
- Product adapters create the store from real hooks, queries, mutations, navigation, and effects. Fixture/story/mock adapters create the same store contract from fake data or local reducers.
- A page command dispatcher may route actions across independent state slices, product mutations, and effect adapters. Do not disguise that routing as a child store, and do not pass one store into another store to coordinate siblings.
- A page composition store may assemble child stores and call selectors, but the core read-side projection should live in the owning entity model when it is deterministic over entity/value data. Do not create one widget-level product store that bundles unrelated queries, mutations, selections, child-store wiring, and command dispatchers for an entire tab. Feature slices should own mutation intent, validation, command payloads, and use-case state transitions.
- If a page or composition layer needs to trigger a feature mutation while assembling a widget surface, it should call a feature-owned command/port or dispatch a feature-owned action. Avoid making feature form payloads, validation, or command semantics private widget model details.
- Thin child-store projection wrappers are acceptable only when they isolate a stable child contract or make product/story/test replacement materially easier. They are a smell when they only alias fields for one caller, split props for aesthetic reasons, or hide unrelated coupling behind a shorter JSX call.
- When a repository keeps runtime `use*ProductStore` files under `model`, report it as a role/folder mismatch or transitional convention before treating it as a boundary violation. For touched code, prefer separating pure reducer files from runtime adapter files even if they remain in the same folder temporarily.

## TSX Composition Smell Lens

Use this lens when a TSX file imports many queries, mutations, reducers, helpers, and child components but only some of them appear in JSX.

- A TSX component should primarily compose JSX and read a small amount of local view state. Widgets should pass store contracts to feature surfaces instead of assembling dispatch behavior themselves. If the render function is dominated by non-JSX script, derived maps, mutation feedback assembly, command mapping, or unrelated store construction, treat it as a composition smell.
- Move deterministic non-React transforms to the owning entity `model` or `lib` when they compute entity/value projection. Move command payload construction and use-case decisions to the owning feature `model`. Keep only cache/subscription wrappers in TSX when needed, and avoid creating widget `model` files except for truly presentation-only constants or view formatting.
- Move command mapping and mutation orchestration to the owning page or feature dispatcher, not to widgets and not to a generic "god hook" that couples unrelated responsibilities.
- Product wrapper TSX may create an adapter store, but the visible view should be easy to identify and should receive an explicit store contract. If adapter construction dominates the wrapper, move it to an adapter/hook/effects file.
- Avoid importing modules that are not represented by the component's JSX or by the store/dispatch contract it directly owns. Unused or indirectly assembled imports in JSX files are a sign that ownership is leaking.

## Derived Data Lens

Use this lens when refactoring `computed`, `useMemo`, derived atoms, selector hooks, or render-body `map/filter/reduce/sort/new Set/new Map` calculations.

- Do not classify by the presence of `useMemo`. Classify by what the calculation owns.
- If the calculation is deterministic, side-effect free, and its inputs/outputs are an entity interface or value object, move the core transform to the owning entity's `model` or `lib`. Keep only the cache/subscription wrapper such as `useMemo(() => computeX(input), [input])` in UI code.
- If the entity meaning exists only inside one page, use a page-local entity such as `pages/<page>/entities/<Entity>/lib`. Do not promote page-only computed functions to global `src/entities`.
- If the calculation composes several entities into one view state, first ask whether the resulting concept is an entity/value projection. If yes, use the closest page-local or domain entity model. If the result encodes a use-case decision, command state, or validation, use the owning feature model. Avoid widget models for computed state unless the calculation is purely visual and private to the widget.
- If the calculation creates JSX, `ReactNode`, class names, table column renderers, DOM measurements, refs, clipboard/navigation effects, or user-event semantics, keep it in feature/widget UI. These are presentation or action responsibilities, not entity computed functions.
- Entity computed functions must not import React, Jotai setters, DOM/browser APIs, feature slices, widget slices, or page route models. Page-local entities follow the same rule inside their page boundary.

## Route / Page / Widget Lens

For FSD-like frontend trees, classify by screen responsibility before trusting the folder name.

- A `Route` file selects one `Page*` entry for the URL. Route files read URL/search/hash/params, create route-derived page props and callbacks, and pass those props to the Page. Route files must not become the screen composition layer.
- A route should normally import exactly one route-selected `Page*` for that URL. If it imports page widgets/features directly, the route is taking over page composition.
- A `Page` is the route-selected screen composition surface. It receives route-derived props, sets page/body metadata when local convention requires it, owns the page shell/frame, and visibly composes the page-level widgets/sections that make up the screen.
- Route-derived props stop at `Page*`. Page-scoped `widgets`, `features`, and entities must not import page route models, receive a `route` prop object, or know router APIs unless they are explicitly route adapters.
- Do not make `Page*` a pass-through wrapper that returns one opaque `*Panel`, `*Workspace`, `*Surface`, `*View`, `*Shell`, or equivalent container. If that component owns route-derived action wiring, route layout, side/center/right regions, page-level providers, `<main>`, shell/frame selection, or whole-screen composition, move that composition up into `Page*`.
- A page-scoped `widgets/*` component is one logical screen unit visible in the design and directly composed by `Page*`, such as toolbar, header banner, hero carousel, section, sidebar, detail panel, stage, table panel, or overlay host. It is not "global" just because the folder is named `widgets`; if it only belongs to one route, keep it near that route.
- A `Page*` must not compose feature-level UI as first-level screen blocks. If the screen map contains a dialog, drawer, panel, toolbar, banner, catalog, or section, expose that visible surface as a page widget and let the widget compose any feature surfaces it needs. Page top-level JSX should read as the screen map in widget names, not as use-case internals.
- Dialogs and overlays are page widgets when they are user-visible surfaces. Individual dialog variants should be individual widgets when users/designers would inspect them separately. Put close/backdrop behavior, form fields, submit/cancel affordances, validation, and command-intent controls inside the closest feature slice, then compose that feature surface inside the owning dialog widget.
- Make widget folder structure and screen structure logically identical. When a screen can be described as `Page -> Toolbar + HeaderBanner + MCPSection + APISection`, the page folder should expose those as peer widgets or named sub-widgets. A broad `Catalog`, `Panel`, or `HeroPreview` folder is acceptable only when it is actually the screen unit a user/designer would point to.
- For tab pages, make the tab `Page*` import and render every first-level widget. Prefer `PageX -> Toolbar + HeaderBanner + SectionA + SectionB + Dialog/Overlay` over `PageX -> XPanel -> all screen blocks`.
- If the project has chosen UI-only Pages/Widgets, a page-scoped widget remains the visible block shell. Split, do not collapse: keep the directly composed page block in `widgets/*`, and move behavior surfaces or affordances to page-local `features/*`. When the widget needs a search, filter, menu, toggle, submit, close, carousel, or command control, make that behavior a feature surface and have the widget compose it.
- Page-local components that are not directly composed by `Page*` should live under the closest owning slice by responsibility: readonly screen subparts under the owning widget, user-action surfaces under the owning feature, and stable data views/projections under the owning entity. When they are shared by multiple page widgets but still not reusable outside the page, promote them to a named page-local `features/*` or `entities/*` slice based on whether they own user action or data rendering. Do not use `parts/*` as a neutral holding area.
- Do not put `*Page`, `*PageSurface`, `*Workspace` route shells, `<main>`, global modals, or whole-screen composition under global or page `widgets/*`. Avoid naming a page widget `*Workspace` when it composes multiple peer page regions; split the shell into `Page*`, then keep the individual screen blocks under page-scoped `widgets/*`.
- Page widgets should receive the already-computed view state they need and compose visible UI. Keep entity/value projection in entities, behavior state and command payload construction in features or page state, and only presentation constants or class/style decisions near the visible widget. Promote props only when the same component is rendered by two or more callers with genuinely different data/behavior, or when a higher layer must coordinate it.
- Treat a page-scoped widget's public props as a boundary. Do not pass DOM-shaped `on*` props into widgets to pretend they are presentational. If the parent must coordinate page-wide behavior, pass a named store or read-only view model to the widget, and let feature surfaces bind user events from that store.
- If markup and classes are the same, either use the same component or deliberately share only the class/CSS while keeping separate components. Avoid near-duplicate visual structures drifting apart accidentally.
- Keep `shared` for domain-free, cross-page primitives and controls. Move to `shared` only after a real second owner appears.
- Do not use `shared` for domain concepts just because more than one page uses them. If the shared concept still belongs to a domain or route family, keep it in that domain's upper `entities`, `features`, or `widgets` layer. Example: `pages/skills/features/*` is skills-domain common; `shared/*` is non-domain app-local infrastructure or primitives.
- Treat global domain-named folders such as `src/ui/widgets/<domain>/*`, `src/ui/features/<domain>/*`, or `src/ui/entities/<domain>/*` as suspicious until proven global. Collect production importers excluding stories, tests, generated i18n, and dev-only previews. If all production importers live under one page subtree, move the code to that page or inline tiny one-owner controls into the owning feature/entity file; use the owning widget file only for readonly visual subparts. If importers live under sibling pages in one domain route family, move it to that domain's upper `pages/<domain>/widgets`, `features`, or `entities` according to responsibility. If there are no production importers, delete it or keep it only as an explicit dev/story artifact when the repo has a documented place for that. Story-only reuse does not justify a global domain feature.
- When a folder contains peer slice folders, keep the peer folders at the same semantic level. Do not mix page folders, slice folders, role folders, and loose TSX files in one directory. If a page-local feature needs UI, use `pages/<Page>/features/<Feature>/ui/*`; if it needs model code, use `pages/<Page>/features/<Feature>/model/*`.
- Prefer the closest owner. Page-only `entities`, `features`, and `widgets` live under that page. If ownership is genuinely split across sibling pages inside one domain area, use the domain area's upper `entities`, `features`, or `widgets` before considering `shared`.
- Avoid dumping page-specific data into a page-level `model` by default. Put entity/value projection near the closest owning `entity`, business/use-case decisions near the owning `feature`, and only presentation constants or markup-local helpers near the owning `widget`; route metadata can stay with the page.
- Distinguish UI handlers from API callbacks. `onSuccess`, `onError`, runtime subscriptions, and port callbacks can live near the data interface when they describe that interface; do not count them the same as DOM or user-intent handlers.

## Workflow

```
Read tree -> map layer > slice > segment -> classify responsibility -> move files/tests -> remove smells -> verify behavior
```

- Start with `find src packages -maxdepth 3 -type d | sort` and package metadata.
- Identify the repo's existing layer vocabulary before proposing a target shape.
- For any domain-named global folder such as `src/ui/widgets/skills`, `src/ui/features/skills`, or `src/ui/entities/skills`, run a production-importer residency scan before trusting the folder name:
  - include TS/TSX imports from production source;
  - exclude stories, tests, generated i18n, fixtures, and devtools-only records unless the task is about those surfaces;
  - classify each exported file as page-local, domain-common, truly global, or dead/story-only.
- Classify by responsibility and dependency direction before moving files.
- Use `git mv` where possible and rewrite imports mechanically.
- Preserve tests beside the moved responsibility.
- Put TSX view files under the owning slice's `ui`.
- Put `use*` React hooks under the owning slice's `hooks`, `adapters`, or `effects` according to the repository's local segment vocabulary.
- Put pure logic, reducers, selectors, action types, and action builders under the owning entity or feature `model`. Do not use a widget `model` as a dumping ground for projection or business decisions.
- For store-driven surfaces, first identify the pure store contract, the product adapter, and any fixture/story/mock adapter. Then move UI by ownership.
- If the repository currently stores runtime adapter hooks under `model`, keep the behavior intact but avoid mixing runtime adapters and pure reducers/selectors in the same file when touching that area.
- When a composition slice accumulates `handle*` functions, extract the smallest coherent behavior surface into a lower use-case/affordance feature. Do not create one public file per one-off button, menu item, permission option, or field unless it has real reuse or an independent reason to change. Support the behavior surface with hooks/model code only as needed; do not move the handler into a hook while leaving the JSX binder in the composition layer.
- When public props include `on*` or `handle*` callbacks in app-owned page/widget/feature/entity components, first convert the boundary to a named store, `[state, dispatch]`, or an owning entity/view-model contract. Then close responsibility inside the component before deciding whether files need to move.
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
