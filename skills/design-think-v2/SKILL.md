---
name: design-think
description: Use this skill whenever the user asks Claude to build, mock, design, or lay out a UI screen — Gmail clone, dashboard, settings page, anything visual — EVEN when they say "just build it" or "quickly make a screen." This skill forces Claude to think like a designer (Job → Content → Priority → Hierarchy) BEFORE picking components, instead of the default "grab widgets and assemble" pattern that produces functional-but-broken output (truncated chips, invisible stars, no unread contrast). Runs as a discuss-style turn-by-turn dialog with a 🔴🟡🟢 understanding table across 13 design decisions. Triggers on "design this", "make a screen", "UI for X", "build the Y page", "mock up Z", and similar — also when you catch yourself about to write widget code without a decision trail. Sits before /blueprint and /go in the pipeline.
---

## Why this skill exists

LLMs default to **widget-first assembly** when asked to design a screen. They pick `ListBox + Avatar + Badge`, arrange them with `ax()`, and ship. The result looks like "a UI" but fails 14+ quality checks: chip truncation, invisible icons, no unread contrast, broken hierarchy.

Real designers do not start with components. They decide **Job → Content → Priority → Hierarchy** first. Components are the *last* choice, not the first.

This skill enforces that order by making Claude **ask before it builds**. It runs like a `/discuss` session: one turn at a time, an understanding table that fills in progressively, and decision output that seeds the next step (`/blueprint` or `/go`).

## How it runs

Each turn does exactly three things:

1. **Update the understanding table** — 13 rows, each marked 🔴 / 🟡 / 🟢. Output rows up to the first 🔴 (the gap to close now).
2. **Give a judgment** — "My take: X. Reason: Y." Never ask an empty question. If there is a project convention or design-world default, state it; only ask for confirmation.
3. **Ask one gap question** — targeted at the current 🔴 or weakest 🟡. Offer a default so the user can say "yes" and move on.

Stop when the user says "good enough, go to blueprint" or when rows 1–8 hit 🟢. Don't insist on filling all 13 if the user wants to ship.

## The 13 decisions

Ordered by dependency — earlier decisions seed later ones. Full question templates, defaults, and examples in `references/decisions.md`. Read it when running the skill.

| # | Decision | One-line |
|---|---|---|
| 1 | **Job** | What is the user deciding / doing in 3 seconds? |
| 2 | **Context** | Who, on what device, under what pressure, how often? |
| 3 | **Content inventory** | Real data shape — char counts, row counts, ranges. |
| 4 | **Information priority** | 1st / 2nd / 3rd gaze — inverted pyramid. |
| 5 | **Scan pattern** | F / Z / list-row / grid. |
| 6 | **Layout skeleton** | Regions and their area share. |
| 7 | **Visual hierarchy** | 4–5 contrast levels (size/weight/color/bg/space). |
| 8 | **Component choice** | Regions → CATALOG parts. |
| 9 | **States** | empty / loading / error / selected / disabled. |
| 10 | **Interaction** | hover / focus / press / disabled visuals. |
| 11 | **Density / responsive** | comfortable vs compact, breakpoints. |
| 12 | **Visual contract** | Measurable rules derived from 4 and 7. |
| 13 | **Critique** | Squint test, scan test, contrast check. |

**Dependency gates:** don't move to 4 until 1–3 are at least 🟡. Don't touch 7 (hierarchy) until 4 (priority) is 🟢 — hierarchy without priority is arbitrary styling.

## Understanding table — output format

```markdown
| # | Decision | Content | Score |
|---|---|---|---|
| 1 | Job | Scan inbox, pick which mail to open in 3s | 🟢 85% |
| 2 | Context | Desktop, keyboard-first, 50x/day | 🟢 90% |
| 3 | Content | sender 6–20ch, subj 10–80ch, preview 30–120ch, labels 0–3 | 🟢 90% |
| 4 | Priority | ? | 🔴 20% |
```

Stop at the first 🔴 in rows 1–12. Row 13 is a post-mortem; only print it when 1–12 are mostly green and we're doing a final critique pass.

## Judgment rules

Always propose first, confirm second. The priority of reasons:

1. **Project convention** — CLAUDE.md, `src/styles/DESIGN.md`, rolePreset, feedback memory. If the project has already decided, don't re-open.
2. **Best practice** — Nielsen/Norman, Apple HIG, Material, ARIA APG.
3. **Standards** — W3C WCAG (e.g., 4.5:1 contrast for body text).
4. **De facto** — shadcn/Radix defaults, or patterns you can observe across Gmail / Linear / Notion (for this domain).
5. **Design principles** — Gestalt, F/Z scan, Fitts's law.
6. **Local fit** — "works for this screen." Weakest; use only when the above don't settle it.

If a project convention contradicts a Best Practice, the convention wins — it's a deliberate choice, not an oversight.

## Axis mapping — the payoff

This is what makes the skill useful downstream. Every decision at level 7 (hierarchy) and 8 (component) maps to concrete `ax()` axes. That mapping becomes the seed for `/blueprint` widget code.

See `references/axis-mapping.md` for the full table. Quick example:

| Decision | → ax axis |
|---|---|
| L1 page title | `textStyle: 'page'` |
| L2 section label | `textStyle: 'label'` |
| Unread row | `surface: 'display'` + `textStyle: 'label'` |
| Selected row | `surface: 'raised'` + ring |
| Pill FAB (Compose-style) | `role: 'control'` + `surface: 'action'` + `shape: 'pill'` |

By the end of the skill run, the output file contains an **Axis Mapping** section that `/blueprint` Phase 3 consumes directly.

## Visual contract — auto-derived

Decisions 4 and 7 produce measurable rules in decision 12. These are the **regression-proof** outputs of the skill.

Examples:
- **Priority 1st = sender name** → rule: sender must never truncate at list widths ≥ 180px.
- **Hierarchy: unread bg Δ ≥ 4.5** → rule: contrast-check unread vs read rows.
- **Content: chip 2–8 chars** → rule: chip min-width must accommodate 8 chars.


## Output file

One file per screen, appended to each turn. Path:

```
docs/YYYY/YYYY-MM/YYYY-MM-DD/{slug}DesignThink.md
```

Frontmatter:

```yaml
---
id: {slug}DesignThink
type: decision
slug: {slug}DesignThink
title: {Screen name} — Design Think
tags: [design-think, ux, ui]
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: open | consumed
layer: design
---
```

Body sections appear only after the corresponding decision hits 🟡 or 🟢. Don't write empty headers.

Required sections once they're earned:

```markdown
## 1. Job
## 2. Context
## 3. Content inventory
## 4. Information priority
## 5. Scan pattern
## 6. Layout skeleton
## 7. Visual hierarchy
## 8. Component choice
## 9. States
## 10. Interaction
## 11. Density / responsive
## 12. Visual contract    ← measurable rules
## 13. Critique

## Axis mapping           ← consumed by /blueprint
```

`status: consumed` gets set when `/blueprint` or `/go` starts using the file.

## Transition to next skill

When to hand off:

| Next skill | Minimum gate |
|---|---|
| `/blueprint` | Decisions 1–6 all 🟢, 7 at least 🟡 — blueprint needs priority + hierarchy to pick components non-arbitrarily. |
| `/go` (skip blueprint) | 1–8 🟢, 9–12 🟡 — only when the layout is small enough not to need blueprint's coverage matrix. |

Phrase the handoff like this:

```
Decisions 1–6 🟢, 7 🟡. Ready for /blueprint.

Axis mapping seeded:
| L1 page title | textStyle: 'page' |
| unread row    | surface: 'display' + textStyle: 'label' |
| ...

Move to /blueprint, or keep filling 7–9 first?
```

The user decides. Don't auto-transition.

## Mid-run exit is fine

This is a tool, not a ritual. If the user says "enough, I'll just build it," save what's there with `status: open` and stop. Another session can resume with `/design-think {slug}` — the file is the state.

## Two common failure modes to avoid

1. **Filling rows without judgment.** Don't ask "what's the priority?" Ask "My take: 1st=sender, 2nd=subject+unread, 3rd=preview+date+labels. Agree, or reorder?" Empty questions kill the skill's value.
2. **Stretching to all 13.** If the user has a clear vision and rows 1–8 fill quickly to 🟢, ship. Rows 9–13 are for screens where polish matters (production views, primary workflows). Skip them on internal tools or prototypes.

## Expert techniques (use them when the moment fits)

| Technique | When |
|---|---|
| **5-second test** | Decision 1 (Job). Show a sketch, ask "what does this screen do?" |
| **Squint test** | Decision 7 (Hierarchy). If everything disappears at once, hierarchy is flat. |
| **Content-first sizing** | Decision 3 (Content). Measure real data before deciding widths. |
| **Inverted pyramid** | Decision 4 (Priority). Force 3 levels; no ties. |
| **Gestalt proximity** | Decision 6 (Layout). Related elements must cluster. |
| **WCAG 4.5:1** | Decisions 7, 12. Body text minimum; 3:1 for large text. |
| **Pre-mortem** | Decision 13 (Critique). "If this ships and users complain, what will they say?" |

## Working examples

See `references/examples/gmail-list.md` for a full run — how the 13 decisions fill for a Gmail-style mail list screen, and what the final output file looks like.

## Stop conditions

Listen for these signals and stop:

- "Good enough" / "ship it" / "let's blueprint this"
- Direct invocation of another skill (`/blueprint`, `/go`)
- User frustration with the pace — offer to jump to a higher-gate exit
- Rows 1–12 all 🟢 and critique (13) complete

Don't self-terminate. If the user is quiet, ask "ready to hand off, or keep refining?"
