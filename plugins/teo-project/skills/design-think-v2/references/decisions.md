# 13 Decisions — Question templates, defaults, examples

Each decision has three parts:
- **Question** — what to ask the user
- **Default** — what to propose if the user has no opinion
- **Score heuristic** — how to judge 🔴/🟡/🟢
- **Example** — a filled answer (from the Gmail list example)

Use this file as the lookup when filling the understanding table. Don't paste the whole template at the user — synthesize the specific question for their screen.

---

## 1. Job

**Question:** What does the user accomplish on this screen, in 3 seconds?

**Default:** Derive from screen type. Inbox → "scan, pick which to open." Dashboard → "spot anomalies." Settings → "change one specific thing quickly."

**Score:** 🟢 when a single-sentence answer exists with an action verb + object + time constraint. 🟡 if verb is vague ("understand"). 🔴 if no answer.

**Example:** "Scan the inbox and pick which email to open. Target: decide within 3 seconds per row."

---

## 2. User & Context

**Question:** Who uses this, on what device, under what time pressure, how often per day?

**Default:** Desktop, keyboard+mouse, 10–50x per day, low individual urgency but high cumulative time.

**Score:** 🟢 when device + frequency + input method + urgency are all stated. 🟡 if 2–3 filled. 🔴 if nothing.

**Example:** "Power user on desktop, keyboard-first (j/k/Enter shortcuts), ~50 opens per day, 2–3 second patience per scan."

---

## 3. Content inventory

**Question:** What's the actual shape of the data? Min / typical / max for each field — character counts, item counts, ranges.

**Default:** Never assume. Ask for or measure sample data.

**Score:** 🟢 when every field in the primary list/detail has min/max/typical. 🟡 if only max is known. 🔴 if guessed.

**Example for a mail row:**
- sender: 6–20 chars (typical 12)
- subject: 10–80 chars (typical 30)
- preview: 30–120 chars (shown as single line, clamped)
- labels: 0–3 chips, each 2–8 chars
- date: always 7 chars ("Apr 14" or "12:43 PM")
- attachment: boolean

---

## 4. Information priority

**Question:** If the user's eye lands on one row, what do they see at 1st gaze, 2nd gaze, 3rd gaze? Force 3 levels, no ties.

**Default:** Apply the inverted pyramid. 1st = identity (who/what). 2nd = primary action cue (subject/status). 3rd = supporting detail (time, labels, preview).

**Score:** 🟢 when 3 distinct levels, each with 1–3 fields, no overlaps. 🟡 if only 2 levels or fields are tied. 🔴 if all fields are "equally important."

**Example:**
- 1st: sender name
- 2nd: subject + unread state
- 3rd: preview · date · attachment icon · label chips

Warning sign: if the user insists all 5 fields are equally important, the design will fail. Push back with "at 80px row height, 4 of these will be visually equal; which one wins when they tie?"

---

## 5. Scan pattern

**Question:** How do users' eyes move across this screen? F-pattern (text-heavy pages), Z-pattern (landing pages), list-row (repeated uniform rows), grid (tiles)?

**Default:** For list screens → list-row horizontal scan with vertical rhythm. For dashboards → F or grid. For forms → Z.

**Score:** 🟢 when named pattern + implied vertical rhythm (row height, gap). 🟡 if pattern named but no rhythm. 🔴 if unnamed.

**Example:** "List-row. Horizontal scan left-to-right per row: sender → subject → preview → date. Vertical rhythm: 48px comfortable / 36px compact rows, no extra gap (bordered)."

---

## 6. Layout skeleton

**Question:** What regions does the screen have, and how much area does each get?

**Default:** Apply canonical patterns. Mail/messaging → 3-pane (nav · list · detail) at roughly 18% · 35% · 47%. Settings → 2-column (nav · form). Dashboard → single column with cards.

**Score:** 🟢 when every region has a role and an area percentage, and total = 100%. 🟡 if roles stated but areas fuzzy. 🔴 if "three columns" with no numbers.

**Example:**
- TopBar: 100% × 64px fixed
- Sidebar: 18% · nav + compose + folders
- MailList: 35% · categories + toolbar + list + pagination
- MailDetail: 47% · toolbar + header + thread + actions

---

## 7. Visual hierarchy

**Question:** How many contrast levels, and how does each level differentiate from the others? Use size, weight, color, background, space — but pick the fewest levers that work.

**Default:** 4 levels is the sweet spot.
- L1 (hero/title): textStyle `page`, 22/600
- L2 (section/label): `label`, 14/500
- L3 (body): `body`, 14/400
- L4 (caption/dim): `caption`, 12/400 with tone dim

Plus **orthogonal states**: unread = surface `display` + weight +100. Selected = surface `raised` + ring.

**Score:** 🟢 when 4–5 levels spec'd with concrete textStyle and weight. 🟡 if named but unspecified. 🔴 if "big, medium, small."

**Example (Gmail list):**
- L1 subject in detail header = `textStyle: 'page'` (22/600)
- L2 from / sender = `textStyle: 'label'` (14/500)
- L3 body text = `textStyle: 'body'` (14/400)
- L4 date / caption = `textStyle: 'caption'` (12/400, tone `neutral-dim`)
- Unread strip = `surface: 'display'` + weight 500, read = `surface: 'ghost'` + weight 400

---

## 8. Component choice

**Question:** For each region, which CATALOG part covers it? Any region without an existing part is a GAP.

**Default:** Read `src/interactive-os/CATALOG.md` first. Map each region to the smallest matching part. Don't invent — if you can't find a part, name the gap explicitly.

**Score:** 🟢 when every region has a named part from ui/ or ui/composites/. 🟡 if 1–2 gaps. 🔴 if most regions are "custom."

**Example:**
| Region | Part |
|---|---|
| TopBar | `Combobox` + `ButtonToolbar` + `Avatar` |
| Sidebar | `NavList` + FAB button |
| MailCategories | `TabList` |
| MailListToolbar | `Checkbox` + `ButtonToolbar` + `Pagination` |
| MailListBody | `ListBox` + (GAP: `MailListItem` composite — extract after first build) |
| MailDetailHeader | `Avatar` + `Badge` + `DisclosureGroup` |
| MailDetailBody | `<details>` thread + body + `FilePreview` |
| MailDetailActions | `ButtonToolbar` |

Any gap goes into the output file under `## GAPs` with extraction plan.

---

## 9. States

**Question:** What does this screen look like in each of: empty, loading, error, selected, disabled, no-permission?

**Default:** Every screen has at least empty + loading + error. Selected applies to lists. Disabled applies to action controls.

**Score:** 🟢 when each applicable state has a visual spec. 🟡 if 1–2 missed. 🔴 if no states beyond "happy path."

**Example (Gmail list):**
- Empty: `EmptyState` with icon + "No mail in this folder."
- Loading: `Skeleton` × 8 rows
- Error: `Alert` tone `danger` with retry
- Selected row: `surface: 'raised'` + focus ring accent
- Disabled action: `surface: 'ghost'` + opacity 0.5 + cursor not-allowed

---

## 10. Interaction

**Question:** What visual change happens on hover / focus / press / disabled for each interactive element?

**Default:** Pull from rolePreset. Hover = bg delta 2%. Focus = ring accent 2px. Press = scale 0.98. Disabled = opacity 0.5.

**Score:** 🟢 when the 4 states are specified per interactive role (button, item, tab). 🟡 if one state missing. 🔴 if only hover.

**Example:** Every `role: 'control'` or `role: 'item'` element → hover bg-delta, focus ring, press scale-in, disabled opacity.

---

## 11. Density / responsive

**Question:** Does the screen support density modes? What are the breakpoints, and what changes at each?

**Default:** Single density is fine for most screens. Responsive: ≥1280 = full layout, <1280 = collapse to 2-pane or stack, <768 = stack everything.

**Score:** 🟢 when density + 1–2 breakpoints have concrete changes. 🟡 if "should be responsive." 🔴 if no thought given.

**Example (Gmail list):**
- Comfortable: 48px row · md padding · labels visible
- Compact: 36px row · sm padding · labels hidden · preview truncated harder
- ≥1280: 3-pane
- <1280: 2-pane (detail covers list on click)
- <768: stacked, detail full-screen

---

## 12. Visual contract

**Question:** Given decisions 4 and 7, what measurable rules make the design verifiable? Write them as assertions.

**Default:** Auto-derive. For each priority level → a no-truncation or contrast rule. For each hierarchy level → a font-size/weight check. For each orthogonal state → a delta assertion.

**Score:** 🟢 when ≥ 5 assertions, each measurable by DOM or stylesheet. 🟡 if vague rules ("should be readable"). 🔴 if no assertions.

**Example (Gmail list — Visual Contract):**
```
- sender-no-truncation: `.list-row .sender` must not trigger CSS ellipsis at widths ≥ 180px
- unread-contrast: Δ(background-color) between unread and read rows ≥ 4.5:1
- chip-fits-8-chars: `.list-row .label-chip` min-width ≥ 8ch
- hierarchy-monotonic: fontSize(page) > fontSize(label) ≥ fontSize(body) > fontSize(caption)
- star-visible-when-filled: `.star[filled="true"]` computed opacity > 0.5
- selected-ring: `.list-row[aria-selected="true"]` has outline or box-shadow
```

These are the skill's **durable output**. Downstream `/improve-design` and guard hooks consume them directly.

---

## 13. Critique (pre-mortem)

**Question:** Apply three tests and list what fails:

1. **Squint test**: close your eyes halfway. Can you still identify the 1st-gaze element from decision 4?
2. **5-second test**: a new user sees this for 5 seconds. Can they answer "what does this screen do" (decision 1)?
3. **Contrast check**: does every body text meet WCAG 4.5:1?

**Default:** Walk through these in order. Each one either passes or produces a finding.

**Score:** 🟢 when all three pass or findings are recorded. 🟡 if 1–2 pass and others skipped. 🔴 if not run.

**Example:**
- Squint: ✅ sender names dominate, pattern recognizable.
- 5-second: ✅ "a mail inbox" is instantly readable.
- Contrast: ⚠️ caption on ghost background is 3.8:1 (borderline). Action: bump caption color or use on sunken only.

Record findings as either (a) fixes to apply now or (b) additional Visual Contract assertions.
