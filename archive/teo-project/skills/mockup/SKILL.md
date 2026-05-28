---
name: mockup
description: Use this skill whenever the user asks Claude to design, prototype, lay out, or visually build a UI screen — BEFORE /go or /blueprint's Phase 3. This skill runs a multi-turn fidelity-ladder loop (Data → Importance → Low-fi wireframe → Mid-fi → Hi-fi) where each turn consumes one step, produces a concrete artifact (schema file, screenshot, etc.), and gates progress with explicit completion criteria — the user must approve before the next phase. Unlike one-shot design tools, this skill uses turns like /discuss does, showing actual rendered screenshots at each fidelity tier so the user SEES the design before committing to implementation. Triggers on "design this screen", "mock up", "let's prototype", "how should this look", "make a screen for X", and implicit cues like "Gmail clone" or "dashboard for Y" where visual validation matters before real implementation.
---

## Why this skill exists

LLMs that build UIs default to one-shot widget assembly: receive brief → emit `<ListBox>` + `<Avatar>`. Result fails on sight (truncated chips, invisible contrast, broken hierarchy).

Designers don't work one-shot. They climb a **fidelity ladder**: grayscale wireframe → mid-fi with real text → hi-fi with color and polish. Each rung is a screenshot. Each screenshot is a checkpoint where they ask "does this read?" before climbing higher.

This skill gives Claude that ladder. Six phases, each with a concrete artifact and a gate. You cannot skip rungs.

## The 6 phases

```
Phase 1: Data Inventory      → schema + fake fixtures (with edge cases)
Phase 2: Importance Matrix   → 1st / 2nd / 3rd gaze assignment per field
Phase 3: Low-fi Wireframe    → grayscale boxes rendered, screenshot taken
Phase 4: Mid-fi Render       → real text + basic typography, screenshot
Phase 5: Hi-fi Render        → ax axes applied (surface/textStyle/tone), screenshot
Phase 6: Promote             → hand off to /go for implementation
```

Rule: earlier phases can be revisited (regression), but you cannot enter phase N+1 until phase N's gate is satisfied AND the user has said "next" (or equivalent).

## File layout

Every mockup lives in its own folder under `src/pages/__mockup__/{slug}/`:

```
src/pages/__mockup__/{slug}/
├── schema.ts          (Phase 1)
├── fixtures.ts        (Phase 1 — uses faker + hand-crafted edges)
├── DataInspector.tsx  (Phase 1 — renders schema+fixtures as table for screenshot)
├── ImportanceView.tsx (Phase 2 — renders matrix as visual grid for screenshot)
├── Wireframe.tsx      (Phase 3 — grayscale)
├── Midfi.tsx          (Phase 4 — real text, minimal ax)
├── Hifi.tsx           (Phase 5 — full ax)
└── routes.ts          (temp routes: /__mockup__/{slug}/data|importance|low|mid|hi)

screenshots/mockup-{slug}-{data|importance|low|mid|hi|final}.png
docs/YYYY/YYYY-MM/YYYY-MM-DD/{slug}Mockup.md  (progress log + contract + embedded screenshots)
```

## Golden rule: Phases 3–6 end with a screenshot

The real "see it" work starts at Phase 3 (low-fi wireframe). Phases 1–2 are text decisions — schema code and a ranking matrix. Rendering those as tables just to screenshot them is ritual, not verification. Text is sufficient for 1–2; pixels are required from 3 onward.

- Phase 1 (Data): schema.ts + fixtures.ts exist. No DataInspector, no screenshot needed.
- Phase 2 (Importance): matrix in the progress log. No ImportanceView, no screenshot needed.
- Phase 3–6: every gate requires a rendered-page screenshot file. No exceptions.

The progress log file is the state: reopening `/mockup {slug}` reads its frontmatter's `phase:` field and resumes.

## Per-turn output format

Every turn MUST produce this block so the user always knows where they are:

```markdown
📍 **Phase {N}: {name}** · {X/Y gates met}

### What I did this turn
{concrete actions — file created, screenshot rendered, etc.}

### Gate checklist
- [x] {completed criterion, with artifact reference}
- [x] {another — e.g., "screenshot saved: screenshots/mockup-gmail-low.png"}
- [ ] {pending — what's still needed}

### Next step
{one of:}
- ✅ **Ready for Phase {N+1}.** Say "next" to advance, or "stay" to refine.
- 🔁 **Still in Phase {N}.** {what this turn attempted, what's missing}
- ⏪ **Regression needed to Phase {M}.** Reason: {finding from this turn}
```

If all gates for the current phase are checked, explicitly propose advance. Don't auto-advance.

## Phase 1 — Data Inventory

**Inputs:** user brief ("Gmail-style list", "settings page for X", etc.)

**Work this phase does:**

1. Define TS interfaces for every entity shown on screen (`schema.ts`).
2. Generate fake fixtures in `fixtures.ts`:
   - **2–3 hand-crafted edge cases** (max-length subject, 3 labels, 0 labels, unread+starred+attachment, etc.) — LLM writes these because intent matters.
   - **Bulk via faker** (`@faker-js/faker`) — deterministic seed, so output is reproducible. Don't hand-write 15 random rows.
   - Separate fixtures for **empty / loading / error** states.
3. Document ranges in a comment block: `// from: 6–20 chars · subject: 10–80 · labels: 0–3 each 2–10ch`.

**Gate checklist:**
- [ ] `schema.ts` exists with every entity's interface (all fields typed)
- [ ] `fixtures.ts` exists with ≥ 12 rows (for list screens) or ≥ 1 full example (for detail screens)
- [ ] At least 2 edge cases identified by name in a comment
- [ ] Empty/loading/error fixtures present (or explicitly marked N/A with reason)
- [ ] Measured ranges (from/subject/preview/labels char counts) posted in the progress log as a table
- [ ] User approved the ranges

No DataInspector, no screenshot. Phase 1 is a text decision — schema + fixtures + a range table in the log. Rendering a table just to screenshot it is ritual.

**Regression triggers:**
- During Phase 4 (Mid-fi) the real text overflows unexpectedly → return here, extend the edge case.

## Phase 2 — Importance Matrix

**Inputs:** schema from Phase 1.

**Work this phase does:**

Propose a 3-level matrix mapping every field to a gaze tier:

```markdown
| Field | 1st | 2nd | 3rd |
|---|---|---|---|
| sender    | ●   |     |     |
| subject   |     | ●   |     |
| unread    |     | ●   |     |  (state modifier — elevates subject row)
| preview   |     |     | ●   |
| date      |     |     | ●   |
| labels    |     |     | ●   |
| attachment|     |     | ●   |
```

Rules:
- No ties at 1st gaze (pick exactly one anchor).
- 2nd gaze can hold 2 fields max.
- Every schema field must land in some tier (or be marked **hidden**).
- Explain each placement with one-sentence reason.

**Gate checklist:**
- [ ] Every schema field placed in tier 1/2/3 or marked hidden
- [ ] 1st gaze has exactly one anchor
- [ ] 2nd gaze ≤ 2 fields
- [ ] One-line reason per placement
- [ ] Matrix posted in the progress log as markdown
- [ ] User approved the matrix

No ImportanceView, no screenshot. Phase 2 is pure ranking — the visual representation of that ranking happens at Phase 5 (Hierarchy), not here.

**Regression triggers:**
- During Phase 3 (Low-fi) the wireframe can't represent the matrix visually → return here, re-rank.

## Phase 3 — Low-fi Wireframe

**Inputs:** schema + fixtures + importance matrix.

**Work this phase does:**

1. Write `layout.ts` using **`defineLayout`** — split structure (topbar vertical split, body horizontal 3-pane, etc.). This file is reused by Phase 4 and Phase 5. Decide split ratios here once.
2. Write `WireframeWidgets.tsx` — placeholder-bar widgets using `role:'badge' + surface:'display' + tone:'neutral-dim'` + nbsp runs (or `ui/Skeleton` if it shows with adequate contrast in the chosen theme). **Bar widths must be driven by Phase 1 fixture char counts** (senderSize/subjectSize/previewSize mapping) so the data distribution—edge-min vs edge-max vs typical—is visible at wireframe fidelity. Icons from lucide-react, not emojis. Only REGION labels (MAILBOX, LABELS) stay as text; field labels are implied by bar width.
3. Write `PageLow.tsx` — `FlatLayout` wrapper + `createWidgetRegistry` + grayscale filter via `PageLow.module.css` (filter + monospace only).
4. Register `/__mockup__/{slug}/low` route **outside AppShell** (so no activity-bar leaks into the mockup).
5. Take a Puppeteer screenshot: `screenshots/mockup-{slug}-low.png`.
6. **LLM self-review**: does the split ratio work for the content density? Any region starved or bloated? Are field placements readable at this box sizing?
7. Present screenshot + findings to user.

**Why FlatLayout, not ax-only assembly:**
Viewport-fill, precise ratios, and resizable splits are the engine's job. Hand-rolling `layout: 'row' + flex:'1'` fakes the shape but fails at viewport-height and ratio precision. The rule is **feedback_flatlayout_first** — if FlatLayout can't do it, extend the engine, don't reassemble with ax.

**Gate checklist:**
- [ ] `layout.ts` uses `defineLayout` (split structure, not ax-flex fakery)
- [ ] `WireframeWidgets.tsx` with one stub per region
- [ ] `PageLow.tsx` mounts FlatLayout with registry + grayscale theme
- [ ] Route registered **outside AppShell**
- [ ] Screenshot file exists and is current (< 2 minutes old)
- [ ] LLM self-review posted (≥ 1 observation)
- [ ] User approved OR feedback incorporated

**Regression triggers:**
- Mid-fi shows cramped region that was hidden by grayscale uniformity → return here, adjust box sizes.

## Phase 4 — Mid-fi Render

**Inputs:** wireframe + fixtures + ax layout axes (but NOT hierarchy axes yet).

**Work this phase does:**

1. Write `Midfi.tsx` that uses:
   - Real data from fixtures (not placeholder names).
   - Basic `ax()` for **layout only** (`layout`, `flex`, `width`, `clamp`) — no surface/tone/textStyle variance.
   - Default ui/ components (ListBox with default renderItem, etc.) — no custom renderers yet.
2. Register `/__mockup__/{slug}/mid`.
3. Screenshot `mockup-{slug}-mid.png`.
4. LLM self-review — focus on **legibility and real-text fit**: does preview overflow? does chip truncate at this data distribution? is list row tall enough to read?
5. Present to user.

**Gate checklist:**
- [ ] `Midfi.tsx` exists, route registered
- [ ] Real fixtures rendered (no placeholder strings)
- [ ] Screenshot current
- [ ] LLM self-review found ≥ 1 specific layout issue OR explicitly "no issues"
- [ ] User approved

**Regression triggers:**
- Long subject truncates at 80ch → regress to Phase 1, extend edge to 120ch if data allows.
- Layout feels cramped → regress to Phase 3, re-shape wireframe.

## Phase 5 — Hi-fi Render

**Inputs:** mid-fi render + design decisions not yet made (surface, textStyle, tone, custom renderers).

**Work this phase does:**

1. Write `Hifi.tsx`:
   - Full `ax()` usage: `role`, `surface`, `textStyle`, `tone`, `interactive`, `content`.
   - Apply hierarchy from Importance Matrix: 1st gaze gets `textStyle: 'label'` or stronger, 3rd gaze gets `textStyle: 'caption'` or dim tone.
   - Custom renderers where needed (e.g., `renderMailItem`).
   - State visuals: unread vs read (surface delta), selected vs default, loading skeleton, empty state.
2. Register `/__mockup__/{slug}/hi`.
3. Screenshot `mockup-{slug}-hi.png`.
4. **LLM self-review — the big one.** Look for:
   - Contrast failures (unread vs read indistinguishable)
   - Truncation (chip, sender, preview)
   - Invisible elements (star opacity, icons)
   - Hierarchy inversion (caption bigger than body)
   - Empty gaps (layout: 'spread' abuse)
5. Derive **Visual Contract** from findings + hierarchy decisions — write measurable assertions to `docs/.../{slug}Mockup.md`.
6. Present screenshot + self-review + Visual Contract to user.

**Gate checklist:**
- [ ] `Hifi.tsx` exists with full ax usage
- [ ] Every state visible (default/unread/selected/loading/empty/error)
- [ ] Screenshot current
- [ ] LLM self-review identified specific pixel-level issues OR explicitly "no issues after audit"
- [ ] Visual Contract written with ≥ 5 measurable assertions
- [ ] User approved

**Regression triggers:**
- Hierarchy inversion found → stay in Phase 5, swap textStyle.
- Data shape didn't account for something (e.g., avatar size needs to change) → regress to Phase 1.

## Phase 6 — Promote

**Inputs:** approved Hi-fi + Visual Contract.

**Work this phase does:**

1. Summarize decisions: Importance Matrix + ax axis mapping + Visual Contract.
2. Propose handoff path to `/go` — which files move from `__mockup__/` to real `src/pages/{slug}/`, which need store/plugin wiring, what extra work remains.
3. Mark `docs/.../{slug}Mockup.md` `status: consumed`.

**Gate checklist:**
- [ ] Summary written
- [ ] `/go` handoff plan drafted
- [ ] Progress log updated to `status: consumed`
- [ ] **Final triptych screenshot: `screenshots/mockup-{slug}-final.png`** — composes low + mid + hi side-by-side (via a `/__mockup__/{slug}/final` route that iframes or grids all three) so the user sees the climb in one frame
- [ ] User explicitly approved promotion

## Tools

### faker
Use `@faker-js/faker` for bulk fake data. Install if missing (`pnpm add -D @faker-js/faker`). Always seed for determinism:

```ts
import { faker } from '@faker-js/faker'
faker.seed(42)
```

LLM writes 2–3 hand-crafted edge cases; faker fills the rest. Don't spend tokens generating 15 random names.

### Puppeteer
Use the existing `scripts/screenshot` pipeline or equivalent. Temp routes should render fast (no real data fetch, just fixtures).

### Wireframe theme
See `references/wireframe-theme.md` for the grayscale theme rules. Mount via `data-fidelity="low"` on the mockup page root; CSS overrides all surfaces to gray scale and all text to monospace.

## Progress log format

File: `docs/YYYY/YYYY-MM/YYYY-MM-DD/{slug}Mockup.md`

```yaml
---
id: {slug}Mockup
type: decision
slug: {slug}Mockup
title: {Screen name} — Mockup
tags: [mockup, ux, fidelity-ladder]
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: open | consumed
layer: design
phase: 1 | 2 | 3 | 4 | 5 | 6
---

# {slug} Mockup

## Phase 1 — Data Inventory
- [x] schema.ts (2026-04-19 10:15)
- [x] fixtures.ts — 18 rows, edges: max-subject, 3-labels, unread+star+attach
- [x] Empty/loading/error fixtures
- User approved: yes

## Phase 2 — Importance Matrix
| Field | 1st | 2nd | 3rd |
|---|---|---|---|
| ...

## Phase 3 — Low-fi
- Screenshot: screenshots/mockup-gmail-low.png
- Self-review: "sender box too narrow on small widths; extend minimum"
- User approved: yes

...

## Visual Contract (Phase 5)
- sender-no-truncation: ...
- unread-contrast: Δ ≥ 4.5:1
- chip-fits-8ch: ...
```

## Session resumption

When the user types `/mockup {slug}` and a progress log exists:

1. Read frontmatter `phase:` field
2. Read the last gate checklist for that phase
3. Resume where the checklist left off — don't re-run completed gates

If no slug given and multiple mockups exist, list them with their phase and ask which to resume.

## Regression discipline

Regression is healthy. It's the whole point of the ladder — catching problems early. But document it:

When regressing from Phase N to Phase M:
1. Write to progress log: `Regression N→M @ {timestamp}: {reason}`
2. Re-check gate M
3. Do the work at phase M
4. Re-climb through N

Don't regress silently — future sessions need to see why.

## What NOT to do

- **Skip phases.** If the user says "just go straight to Hi-fi," explain: hi-fi without low-fi means re-learning layout problems at the most expensive fidelity tier. The ladder is cheap because it catches problems at low cost.
- **Generate data inline without faker.** Token waste.
- **Auto-advance phases.** User approval is a gate. Their "looks good" is not approval — you must ask "ready for Phase N+1?"
- **Delete mockup folders after promote.** They're baselines for regression detection.
- **Render without screenshots.** The screenshot IS the artifact. A rendered page nobody looks at is not a mockup.

## Expert techniques

| Technique | Phase | Purpose |
|---|---|---|
| Squint test | 3, 5 | Can you still identify 1st gaze with eyes half-closed? |
| 5-second test | 3, 4 | Show screenshot 5s, ask "what does this screen do?" |
| Edge case naming | 1 | Every edge case has a name ("max-subject", "3-labels") |
| WCAG contrast | 5 | All text must meet 4.5:1 (3:1 for large) |
| Pre-mortem | 5 | "If this ships and users complain, what will they say?" |

## Stop conditions

- User explicitly types `/go {slug}` (advance out of mockup into implementation)
- Phase 6 gate met + approval
- User says "stop" or "this isn't working" — write regression to log, exit cleanly

Do not auto-terminate. Idle turns without user input → ask "ready for next step, or refine current?"
