---
name: discuss
description: Reconstruct latent intent and converge decisions through sequential causal reasoning before execution. Use for /discuss, $discuss, ambiguous goals, why-before-how conversations, or when the user wants to understand a problem before changing anything. Investigate available context before asking, surface a compact coverage table each turn up to the earliest open element, reconsider dependent conclusions when an upstream premise changes, and proactively propose the execution handoff once the causal chain is grounded. Do not combine with grilling; an explicit grill request uses grilling instead.
---

# Discuss

Treat a `discuss` invocation as evidence that the current context contains a
decision-relevant intent worth reconstructing together. It is not evidence for
one particular intent, scope, or solution.

In the first response on a new topic, when the provided evidence — a
screenshot, an error, attached material, surrounding conversation — is broader
than the surface question, present two or three latent-intent hypotheses and
recommend one. Answering the surface question does not close the turn: check
whether the answered fact serves the reconstructed intent, and keep
investigating toward that intent.

## Keep discussion separate from execution

Inspect, reason, compare, and draft during discussion. Do not modify files or
configuration, create goals or issues, send external messages, or begin
implementation until the user explicitly asks to proceed.

Agreement with a diagnosis or direction is not by itself execution approval.

## Reason through the causal model

Reason through these elements in order by default:

| # | Element | Question |
|---:|---|---|
| 1 | Intent | Why does the user want this? |
| 2 | Background | What event or pattern triggered it? |
| 3 | Ideal result | What observable future would satisfy the intent? |
| 4 | Current reality | What is verified now? |
| 5 | Problem | What gap separates the ideal from reality? |
| 6 | Cause | What mechanism produces that gap? |
| 7 | Constraints | What conditions cannot change? |
| 8 | Assets | What existing code, knowledge, or tools can help? |
| 9 | External evidence | What relevant facts, standards, and comparable outcomes exist outside the current scope? |
| 10 | Ecosystem convergence | In which direction is the relevant ecosystem converging, under what selection pressures, and how stable is it? |
| 11 | Objective | Which changeable leverage point should move? |
| 12 | Solution | How should the objective and relevant convergence direction become a concrete future reality in this scope? |
| 13 | Side effects | What new cost or risk would the solution create? |
| 14 | Obstacles | What still blocks execution? |

Collect evidence whenever it appears, but keep downstream conclusions
conditional on their upstream premises. Do not settle a solution while an
earlier ambiguity could materially change it.

When user correction or stronger evidence changes an upstream premise:

- identify the narrowest premise the new evidence actually contradicts;
- withdraw every downstream conclusion that depends on it;
- return to the earliest affected element and reason forward again;
- preserve verified facts that do not depend on the rejected premise; and
- do not protect a preferred solution by treating the correction as one more
  constraint.

Do not treat the rejection of one premise as rejection of adjacent hypotheses.
When the dependency is uncertain, downgrade the affected conclusion to a
hypothesis instead of either preserving or discarding it as fact.

Judge each element as grounded or open. An element is grounded only when it
rests on an anchor — a quoted user statement, a file path, a rule name, or a
verified observation — and a single interpretation survives. Do not grade
elements with percentages or confidence scores; the judgment is binary.

Use the causal model as live shared state, not a hidden protocol. Every
discuss response includes a compact coverage table, from element 1 through the
earliest open element only — never all 14 rows by default:

```markdown
| 요소 | 내용 (앵커) | 판정 |
|---|---|---|
| 의도 | 배너의 발생 원인 파악 (사용자 원문: "왜 떠?") | 🟢 |
| 배경 | PR #12359 머지 다음 날 로컬 화면에서 관찰 | 🟢 |
| 이상적 결과 | 배너가 뜨지 않아야 하는 조건이 미확정 | ⬜ |
```

Each row carries its anchor — a quoted user statement, a file path, a rule
name, or a verified observation. The judgment column is binary: 🟢 grounded or
⬜ open. No percentages, no confidence scores, no extra status labels. Rows
after the earliest open element stay internal even when provisional evidence
exists for them. Written state survives the turn; unwritten state does not —
the table is what lets the next turn resume instead of drift, and what lets
the user steer which element the discussion stands on. The next turn's work is
to move the earliest open element.

## Investigate before asking

Resolve the likely scope from the active conversation first, then inspect the
relevant code, documents, tests, rules, and history. Do not ask the user for a
fact available in those sources.

When the user names an unqualified code concept without a path, package, or
clear recent owner, do not narrow to the first plausible match. First make a
cheap filename and symbol inventory across the repository root and its nested
apps, workspaces, and packages. Finding one implementation is not search
completion. Stop after this inventory when the owner is unique; if materially
different owners remain, state only their shared conclusion until evidence
selects one.

At External evidence, recognize problem classes that already have mature
answers. Check official standards and stable de-facto convergence before
inventing a new solution. Treat external convergence as evidence, not as
authority over confirmed user intent or local constraints.

At Ecosystem convergence, synthesize the external observations into a
direction, not a ready-made answer. Ask which independently evolved approaches
are becoming more alike, which selection pressures explain that movement, and
whether the direction is `stable`, `emerging`, `contested`, or `absent`.
Any of these states can be grounded when anchored; do not prolong research just
to manufacture convergence. A convergence direction may reveal, strengthen, or
challenge the Objective, but it cannot create an Objective that does not trace
back to the local Problem, Cause, and Constraints.

Ask one discriminating question only when the remaining answer belongs to the
user or two live interpretations would materially change the next judgment —
and only after investigation can no longer narrow it. Do not hand the user a
mechanism fork that code, history, or documents can settle; reaching for a
question while discoverable evidence remains unread is an escape, not
diligence. Otherwise state the strongest provisional interpretation and what
evidence would change it.

After evidence narrows the problem to one boundary, do not collapse materially
different mechanisms inside that boundary. Name the fork and inspect the
cheapest distinguishing evidence; ask for it only when it is not discoverable.
State the verified boundary as the conclusion and keep mechanisms inside it
explicitly provisional until distinguishing evidence closes the branch.

Prefer evidence in this order: confirmed user intent, delegated judgment,
scoped rules and verified artifacts, official standards, strong de-facto
standards, general principles, then inference.

After context compaction or uncertain continuity, reread the active request,
primary issue or source artifact, and confirmed goal or distinctions before
continuing.

## Keep the goal convergent

Once Intent, Ideal result, and Constraints are grounded, maintain a compact
anchor of Outcome, Done, and Don't.

Keep the anchor stable against downstream solution ideas, reviews, severity
labels, and generic best practices. Reopen it when the user corrects an
upstream premise or stronger evidence falsifies one. A useful but causally
unnecessary improvement remains a separate objective.

Treat review feedback as evidence for a smell or leak, not as a new objective,
issue, or work queue. Do not create or mandate follow-up work from review alone;
do so only when the user independently adopts it or evidence makes it necessary
to satisfy the current anchor.

When discussion drifts, return to the earliest unresolved causal element and
the remaining distance to Done.

## Propose the transition

Discussion has a terminal state; reaching it is this skill's job, not the
user's. When Intent, Ideal result, and Constraints are grounded, and Problem,
Cause, Ecosystem convergence, and Solution each carry an anchor plus a
falsification condition, do not keep discussing and do not wait to be asked
for a plan. Run the gate in [references/frt-gate.md](references/frt-gate.md),
then read [references/execution-contract.md](references/execution-contract.md)
and produce the smallest applicable Execution Contract. Present its Goal
Anchor and propose moving to execution.

The Execution Contract is the stable semantic handoff, not a new workflow or
tracker. `discuss` owns its meaning; repository-specific issue tooling projects
it into the durable work item; the execution workflow preserves it and records
changing run state separately. Keep repository labels, branch conventions,
project fields, and PR mechanics out of this skill.

If the gate fails, name the failing claim and treat it as the earliest open
element instead of proposing.

Proposing the transition is still discussion. Execution begins only after the
user explicitly approves; a proposal the user ignores or redirects reopens the
conversation without penalty.

## Respond naturally

Lead with the strongest current judgment and its best evidence. Include only
the uncertainty, contrast, or question that materially affects the decision.
Use the amount of detail the conversation needs; beyond the coverage table, do
not force additional tables, checklists, fixed response shapes, or execution
plans.

Before an explicit execution handoff, discuss direction and what would change
the judgment rather than presenting a concrete implementation sequence as
settled.

When the user requests a plan or execution handoff, verify that the proposed
solution closes the Problem and Cause, respects Constraints, uses relevant
Assets and External evidence, accounts for the grounded Ecosystem convergence
state, and has acceptable Side effects and Obstacles. Then provide the
smallest plan that preserves the causal anchor.
