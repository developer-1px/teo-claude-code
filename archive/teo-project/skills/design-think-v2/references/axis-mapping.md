# Axis mapping — decisions to ax() axes

This is the payload `/design-think` hands to `/blueprint` and `/do`. By the end of a session, every decision at levels 7 (hierarchy) and 8 (component) must have a concrete ax axis binding. This file is the lookup table.

Read `src/styles/DESIGN.md` and `src/styles/axPublic.ts` for the full axis catalog. The mappings below are the common cases for list/detail/form screens.

## Hierarchy → textStyle

Decision 7 picks 4–5 contrast levels. Map each to a textStyle.

| Level | Typical use | ax binding |
|---|---|---|
| L1 hero | Landing h1, full-screen title | `textStyle: 'hero'` |
| L1 page | Screen title, detail subject | `textStyle: 'page'` |
| L2 section | Group header, sidebar label | `textStyle: 'section'` |
| L2 label | Sender name, form label, badge text | `textStyle: 'label'` |
| L3 body | Body text, list item subject | `textStyle: 'body'` |
| L4 caption | Date, helper text, dim meta | `textStyle: 'caption'` |
| code | Inline / block code | `textStyle: 'code'` |
| overline | Eyebrow / small caps | `textStyle: 'overline'` |

Pick 4 that are actually distinct on screen. Don't use 7.

## State differentiation → surface

Decision 7 also decides how state contrast comes through. Pick one mechanism per state; don't stack two (unread + bg + ring + weight is noise).

| State | ax binding | Why |
|---|---|---|
| default row | `surface: 'ghost'` | transparent |
| unread | `surface: 'display'` + `textStyle: 'label'` | bg delta + weight bump |
| selected | `surface: 'raised'` + focus ring | elevation signals "active" |
| disabled | base + opacity via state token | don't change surface |
| hover | no ax change; CSS `:hover` bg delta 2% | rolePreset handles |

## Role → container intent

Decision 8 (component) picks a role. Role communicates intent first; size/shape/padding flow from rolePreset.

| Intent | ax binding |
|---|---|
| Clickable action (button, tab) | `role: 'control'` + `interactive: 'button'\|'tab'\|'check'\|'input'` |
| Container of controls (toolbar, button group) | `role: 'control-group'` |
| List/tree row | `role: 'item'` |
| Chip / pill label | `role: 'badge'` |
| Grid cell with nested control | `role: 'cell'` |
| Tooltip / popover content | `role: 'tip'` |
| Number display (KPI) | `role: 'metric'` |
| System alert / toast | `role: 'signal'` |
| Skeleton placeholder | `role: 'placeholder'` |
| Typography / layout only | `role: 'utility'` (omit role key) |

## Surface within role

Each role has its own allowed surfaces (see `axPublic.ts` discriminated union). Commons:

| role + surface | Appearance |
|---|---|
| `control` + `action` | Primary filled button |
| `control` + `ghost` | Transparent button (icon buttons, tabs) |
| `control` + `input` | Text input / form field |
| `control-group` + `base` | Toolbar baseline |
| `control-group` + `raised` | Floating island (sunken-parent context) |
| `control-group` + `sunken` | Container holding raised islands |
| `control-group` + `overlay` | Floating toolbar/picker |
| `item` + `ghost` | Default list row |
| `item` + `display` | Unread / highlighted row |
| `badge` + `display` | Solid chip |
| `badge` + `ghost` | Outlined chip |
| `tip` + `inverted` | Dark tooltip |

## Tone → accent/danger/success/warning/neutral

Tone is independent of role/surface. Pick by semantic meaning:

| Meaning | ax binding |
|---|---|
| Primary action | `tone: 'accent'` |
| Destructive | `tone: 'danger'` |
| Positive / complete | `tone: 'success'` |
| Warning / attention | `tone: 'warning'` |
| Neutral info | `tone: 'neutral'` (default) |
| Dimmed version | append `-dim` (`accent-dim`, etc.) |

## Layout → axis

Decision 6 (layout skeleton) picks layout per region.

| Intent | ax binding |
|---|---|
| Vertical stack | `layout: 'stack'` |
| Horizontal row | `layout: 'row'` or `'bar'` |
| Spread between ends | `layout: 'spread'` |
| Centered | `layout: 'center'` |
| Scroll container | `layout: 'scroll'` or `'scroll-x'` |
| Fill parent | `layout: 'fill'` |
| Grid N cols | `layout: 'grid-N'` |

## Content → content slot

Decision 8 may pin content type on interactive elements:

| Content | ax binding | Effect |
|---|---|---|
| Text label | `content: 'text'` | 2:1 horizontal padding |
| Icon only | `content: 'icon'` | 1:1 square padding |
| Chat bubble | `content: 'bubble'` | bubble shape |
| Code | `content: 'code'` | monospace wrapper |

## Width / flex / clamp

For responsive behavior, decision 11 drives these:

| Intent | ax binding |
|---|---|
| Full container width | `width: 'full'` |
| Natural | `width: 'auto'` or `'fit'` |
| Prose (readable) | `width: 'prose'` |
| Take remaining | `flex: '1'` |
| Don't shrink | `flex: 'none'` |
| 1 line clamp | `clamp: '1'` |
| N line clamp | `clamp: '2'` through `'4'` |
| Pre-formatted | `clamp: 'pre'` |

## The anti-pattern list (from Gmail experiment)

When the skill hands off to `/blueprint`, include these caveats so widget authors don't repeat the mistakes from the first Gmail showcase:

1. **Don't stack `flex: '1'` on adjacent elements** — they'll compete and both get squeezed. Pick one to take remainder; others get `flex: 'none'` or fixed width.
2. **`layout: 'spread'` creates huge gaps** — use only when the two children really should be at opposite ends of a full-width container. For nearby elements, use `layout: 'bar'` with natural spacing.
3. **Chip (badge) needs `flex: 'none'`** or it will shrink and truncate.
4. **Utility branch (no role) doesn't accept `tone`** — if you need dim text, wrap in `role: 'badge'` + `surface: 'ghost'` + `tone: 'neutral-dim'`.
5. **Unread contrast requires `surface: 'display'` vs `ghost`** — default ax won't produce a visible delta otherwise.
6. **Custom composites inside widgets = tomorrow's debt** — if you assemble something resembling a "MailListItem," stop and consider promoting it to `ui/composites/`. The skill's output file should flag the candidate in `## GAPs`.
