# Example: Gmail-style mail list — full session

A walkthrough of running `/design-think` on a Gmail-style inbox list. Shows what a completed run looks like: understanding table progression, judgment calls, gap questions, and the final output file.

This example is reverse-derived from the 14-defect first Gmail showcase implementation. If the skill had run first, these defects wouldn't have shipped.

## Turn 1 — initial framing

**User:** "Design a Gmail-style mail list. /design-think gmail-list"

**Assistant:**

```
| # | Decision | Content | Score |
|---|---|---|---|
| 1 | Job | ? — scan inbox and pick a mail to open? triage with bulk actions? both? | 🟡 50% |
```

My take: the primary job is **"scan the inbox and pick which mail to open within 3 seconds"**. Bulk triage (archive/delete multiple) is secondary — it's in the toolbar but not the main-path task.

Reasoning: Gmail, Superhuman, and Missive all optimize the first-glance for row scanning. Bulk actions hide until selection appears. This is de-facto across the category.

**Gap question:** Agree? Or is bulk triage actually primary for your user (e.g., an ops team cleaning 500 mails/day)?

---

## Turn 2 — user confirms

**User:** "scan + pick. bulk is secondary."

**Assistant:**

```
| # | Decision | Content | Score |
|---|---|---|---|
| 1 | Job | Scan, pick which to open, <3s per row | 🟢 90% |
| 2 | Context | ? — desktop / keyboard / how often? | 🟡 50% |
```

My take: **desktop, keyboard-first (j/k/Enter shortcuts), ~50 opens/day, 2–3s patience per scan.** Reasoning: Gmail's keyboard map is the benchmark — users who enable shortcuts rarely go back. If this is a mobile-first use case, I'd pivot.

**Gap question:** Desktop or mobile-first? And is this internal tool (power users) or consumer (mixed literacy)?

---

## Turn 3 — user confirms desktop/power

**User:** "desktop, power user."

**Assistant:**

```
| # | Decision | Content | Score |
|---|---|---|---|
| 1 | Job | Scan, pick, <3s | 🟢 |
| 2 | Context | Desktop, keyboard-first power user, ~50x/day | 🟢 |
| 3 | Content | ? — I'll propose defaults from typical mail data | 🟡 60% |
```

My take on content inventory (measured from typical corporate mail, adjust to your data):

| Field | Min | Typical | Max |
|---|---|---|---|
| sender | 6 | 12 | 20 |
| subject | 10 | 30 | 80 |
| preview | 30 | 70 | 120 |
| labels | 0 | 1 | 3 (each 2–8 chars) |
| date | 7 (fixed, "Apr 14" / "12:43 PM") |
| hasAttachment | bool |

**Gap question:** Confirm these ranges, or do you have longer senders (display name + org)?

---

## Turn 4 — user confirms

**User:** "looks right."

**Assistant:**

```
| # | Decision | Content | Score |
|---|---|---|---|
| 1 | Job | 🟢 | ... |
| 2 | Context | 🟢 | ... |
| 3 | Content | measured ranges locked | 🟢 |
| 4 | Priority | ? | 🟡 50% |
```

My take on priority (inverted pyramid, 3 levels, no ties):

- **1st gaze**: sender name — "who is this from" is the fastest triage signal.
- **2nd gaze**: subject + unread state — unread is orthogonal (applies to everything) but visually dominant when true.
- **3rd gaze**: preview · date · attachment icon · label chips — supporting.

Reasoning: Gmail/Superhuman both lead with sender, not subject. Email is fundamentally a social signal.

**Gap question:** Agree, or does your user prioritize subject first (issue-tracker-style)?

---

## Turn 5 — user agrees

**User:** "agree."

**Assistant:**

```
5 | Scan pattern | ? | 🟡 50%
```

My take: **list-row horizontal scan, vertical rhythm 48px rows (comfortable) or 36px (compact).** Left-to-right per row: sender → subject → preview → date. No extra gap between rows — single divider line.

**Gap question:** Comfortable or compact default?

---

## Turn 6 — user picks comfortable

**User:** "comfortable."

**Assistant:**

```
6 | Layout skeleton | ? | 🟡 50%
```

My take: **3-pane at 18% / 35% / 47%.** TopBar 64px fixed. List column hosts MailCategories · Toolbar · Body · Footer(pagination) stack.

**Gap question:** 3-pane is the Gmail default; confirm or narrow detail?

---

## Turn 7 — user confirms

**User:** "3-pane."

**Assistant:**

```
7 | Visual hierarchy | ? | 🟡 50%
```

My take (4 levels):

| Level | textStyle | Use |
|---|---|---|
| L1 page | page (22/600) | Detail subject |
| L2 label | label (14/500) | Sender, section title |
| L3 body | body (14/400) | Body text, preview |
| L4 caption | caption (12/400 dim) | Date, meta |

**Orthogonal state contrast:**
- Unread row: `surface: 'display'` + sender/subject weight +100. Read: `surface: 'ghost'` + weight 400.
- Selected row: `surface: 'raised'` + accent ring.

**Reasoning:** Four levels is WCAG-compliant and shadcn-aligned. Fewer levels flatten; more noise.

**Gap question:** Lock this, or add a 5th level (e.g., unread count badges as L5)?

---

## Turn 8 — user locks 4 levels

**User:** "4 levels fine."

Rows 1–7 all 🟢. Skill switches to component selection.

**Assistant:**

```
8 | Component choice | filling... | 🟡 70%
```

Region → CATALOG mapping (read from `src/interactive-os/CATALOG.md`):

| Region | Part | Status |
|---|---|---|
| TopBar | Combobox + ButtonToolbar + Avatar | ✅ |
| Sidebar | NavList + Compose button | ✅ |
| MailCategories | TabList | ✅ |
| MailListToolbar | Checkbox + ButtonToolbar + Pagination summary | ✅ |
| MailListBody | ListBox + custom renderItem | ⚠️ GAP: `MailListItem` composite is inline — flag for extraction after first build |
| MailListFooter | Pagination | ✅ |
| MailDetailToolbar | ButtonToolbar | ✅ |
| MailDetailHeader | Avatar + Badge + DisclosureGroup | ✅ |
| MailDetailBody | `<details>` (HTML native) + body + FilePreview | ✅ |
| MailDetailActions | ButtonToolbar | ✅ |
| Compose overlay | Form in floating overlay | ✅ |

**One GAP noted:** MailListItem will be a custom composite inside MailListBody widget. After build, extract to `ui/composites/` so the next mail-like screen doesn't rebuild it.

**Gap question:** Accept the GAP, or preemptively sketch the MailListItem composite now?

---

## Turn 9 — user accepts GAP

**User:** "note it, move on."

**Assistant:** Rows 1–8 🟢 (with GAP). Enough to hand off to `/blueprint`.

Final understanding table:

```
1 Job 🟢 · 2 Context 🟢 · 3 Content 🟢 · 4 Priority 🟢 · 5 Scan 🟢 · 6 Layout 🟢 · 7 Hierarchy 🟢 · 8 Component 🟢 (+1 GAP)
9–13: skipped (user opted to ship); will be filled in `/improve-design` pass after build.
```

Visual contract (auto-derived from rows 4 and 7):

```
- sender-no-truncation: `.list-row .sender` must not trigger ellipsis at widths ≥ 180px
- unread-contrast: Δ bg between unread and read rows ≥ 4.5:1
- chip-fits-8-chars: `.list-row .label-chip` min-width ≥ 8ch
- chip-flex-none: chip must have flex: 'none' (don't shrink under flex competition)
- hierarchy-monotonic: fontSize(page) > fontSize(label) ≥ fontSize(body) > fontSize(caption)
- star-visible-when-filled: `.star[data-filled="true"]` computed opacity > 0.5
- selected-ring: `[aria-selected="true"] .list-row` has outline or box-shadow
```

Axis mapping (seeds `/blueprint`):

| Decision | Axis |
|---|---|
| Detail subject | `textStyle: 'page'` |
| Sender / section label | `textStyle: 'label'` |
| Preview / body | `textStyle: 'body'` |
| Date / caption | `textStyle: 'caption'` + `role: 'badge'` + `tone: 'neutral-dim'` (utility branch can't hold tone alone) |
| Unread row | `role: 'item'` + `surface: 'display'` + `textStyle: 'label'` |
| Read row | `role: 'item'` + `surface: 'ghost'` + `textStyle: 'body'` |
| Selected row | add `data-selected` + CSS ring |
| Label chip | `role: 'badge'` + `surface: 'ghost'` + `flex: 'none'` (locked to prevent shrink) |
| Compose FAB | `role: 'control'` + `surface: 'action'` + `shape: 'pill'` + `tone: 'accent'` |

---

## Output file (final state)

`docs/2026/2026-04/2026-04-19/gmailListDesignThink.md` — appended across 9 turns.

Frontmatter:

```yaml
---
id: gmailListDesignThink
type: decision
slug: gmailListDesignThink
title: Gmail Mail List — Design Think
tags: [design-think, ux, ui, gmail]
created: 2026-04-19
updated: 2026-04-19
status: open
layer: design
---
```

When `/blueprint` starts consuming this file, set `status: consumed`.

---

## What would have been different

If this skill had run *before* the first Gmail showcase build, these defects from the real 14-defect list would have been prevented:

| Defect from first Gmail build | Prevented by |
|---|---|
| chip truncation ("Wo" / "Imp") | Decision 3 (chip 2–8 chars) + Visual Contract (`chip-fits-8-chars`, `chip-flex-none`) |
| preview disappearing | Decision 4 (preview at 3rd gaze) + layout axis spec (no flex-1 competition) |
| star invisible | Visual Contract (`star-visible-when-filled`) |
| unread contrast too weak | Decision 7 (surface `display` vs `ghost`) + Contract (`unread-contrast`) |
| body width unbounded | Decision 11 (prose width cap) — would need rows 9–13 filled |
| rectangle Compose button | Axis mapping (`shape: 'pill'`) explicitly specified |
| subject ↔ star huge gap | Layout decision + anti-pattern list (no `layout: 'spread'` for close elements) |
| font hierarchy too flat | Decision 7 4-level textStyle spec (locked) |

**Coverage:** 8 of 14 defects prevented by rows 1–8 alone. The remaining 6 would have been caught in decisions 9–13 (States, Interaction, Density, Contract, Critique) if the user had chosen to complete the polish pass.

That's the point — rows 1–8 catch the biggest defects, and the user can opt into 9–13 when stakes demand it.
