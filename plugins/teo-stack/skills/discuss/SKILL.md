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

Judge each element as grounded or open. Grounded means sufficiently supported
for the next judgment, not conclusively proven or individually confirmed by the
user. Support may be a verified fact, a reasoned inference from explicit anchors,
or judgment within the user's delegated discretion. For an inference, name its
anchors, reasoning, and any material assumption; keep it distinguishable from an
observed fact. Mark it grounded when remaining uncertainty does not materially
change the next judgment. Do not leave an element open merely because the user
did not supply its wording or the mechanism has not been conclusively verified.
Keep it open when indispensable information or a consequential user-owned choice
is missing. Do not invent facts to complete the table, or treat a grounded
inference as user approval. Do not grade elements with percentages or confidence
scores; the judgment is binary.

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
the user steer which element the discussion stands on. The earliest open element
is the next investigation target, including within the current turn; the table
limits reporting, not how far investigation may progress.

### Actively derive answers for every element

Treat every element as a reasoning task for the AI, not a questionnaire for the
user. Make the strongest reasonable effort to fill it from context, evidence,
inference, and delegated judgment before asking. The question is whether a
reasonable answer can be derived with the available information, not whether
certainty is possible.

- For Ideal result, first derive an observable successful future and criteria
  for recognizing it from Intent and Background. Go beyond paraphrasing the
  complaint; distinguish necessary outcomes from optional assumptions. Do not
  begin by asking the user to design the desired outcome.
- For Current reality, separate verified observations from inferred behavior.
  For Cause, derive the best-supported explanation, its reasoning, and what
  would change it. Lack of conclusive proof alone does not prevent continuing
  the discussion; never present an inferred mechanism as an observed fact.
- Continue through as many elements as can reasonably be derived in the same
  turn. Sequential reasoning does not mean one element per turn. When an
  assumption remains, reason forward conditionally and continue work that does
  not depend on resolving it; do not settle a materially ambiguous solution.
- Before asking, retrieve accessible evidence and derive everything that can
  reasonably be inferred. Ask only when indispensable information is unavailable
  or a consequential choice remains outside the user's delegated judgment.
  Explain why that missing answer changes the judgment. Provide the filled
  portions and, when supportable, a recommended answer with reasons; do not
  hand the entire element back to the user.
- After a user correction, update the affected premise and immediately
  investigate its consequences. Merely acknowledging the correction and
  repeating the coverage table is insufficient.
- If ending with the same earliest open element, state what new evidence was
  examined and the concrete reason further investigation cannot resolve it.
  Do not repeat an unanswered question without new evidence.

Initiative does not lower the grounding standard: keep unsupported inferences
provisional and never treat an inferred preference as user approval.

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

Ask one discriminating question only when missing information prevents a
reasonable answer or materially different interpretations require a user-owned
choice — and only after investigation, inference, and delegated judgment can no
longer resolve it. Do not hand the user a
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

When Assets include existing implementations, connect the requested capability
to an existing owner, its contract, and a working consumer or example when
available. Use the repository's existing maps and catalogs; do not create
another inventory by default. A list
of resources is not yet evidence that a proposed solution uses them. Explain
which part of the request the existing contract covers and the specific gap,
if any. A failed name search does not establish absence; trace the responsibility
through exports, callers, and adjacent implementations within the relevant scope.

Let this evidence change the solution. Prefer direct use, then an extension of
the same owner for a demonstrated gap, then a new owner for a distinct or absent
responsibility. Existing code that violates the governing contract is not a
reuse target merely because it exists. During discussion, inspect contracts and
usage without implementing a trial. Carry the selected owner and unresolved
applicability check into the existing handoff so execution starts by applying
that resource, not by redesigning the capability.

For non-implementation discussions, use the relevant source material, prior
decisions, or existing work instead; do not invent an API mapping or code trial.

After context compaction or uncertain continuity, reread the active request,
primary issue or source artifact, and confirmed goal or distinctions before
continuing.

## Keep the goal convergent

Once Intent, Ideal result, and Constraints are grounded, maintain a compact
anchor of Outcome, Done, and Don't.

The Goal Anchor is a navigation aid, not a substitute for the grounded
decisions that control implementation. Keep it concise, but do not compress
material scope, ownership, structure, behavior, rationale, or boundary
decisions into generic Outcome, Done, or Don't statements. The full Execution
Contract carries those decisions; the Goal Anchor points back to them.

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
and produce the smallest deterministic Execution Contract. Present its Goal
Anchor and propose moving to execution.

## Contract settled solutions

Whenever presenting a solution as settled, recommended for adoption, or ready
to record in a pre-execution issue, include an Execution Contract. Do this even
when the user has not yet authorized implementation. A solution without its
contract is still a hypothesis: label it accordingly and do not write an issue
from it.

The contract must preserve every confirmed decision whose omission could make
reasonable executors choose materially different targets, scope, owners,
dependency directions, structures, behaviors, fallback policies, invariants,
or completion evidence. Preserve the grounded Problem, Cause, decision
rationale, and included or excluded boundary whenever they close such a fork.

If the discussion settled a component tree, route or product surface,
one-to-one mapping, ownership boundary, dependency direction, state
transition, fallback classification, API shape, naming dictionary, or ordered
sequence, reproduce that artifact in the contract rather than compressing it
into prose. Put it under the smallest applicable contract section, usually
`Grounded Decision Context`, `Target Structure`, `Canonical Mapping`, or
`Behavior Contract`.

Before drafting or updating a pre-execution issue:

- reread the latest user-approved solution and Goal Anchor;
- write the Execution Contract first;
- map every material grounded decision forward into the contract and every
  contract item backward to its discussion anchor;
- project the contract into the issue without weakening exact names,
  hierarchy, boundaries, invariants, exclusions, or completion evidence; and
- compare the finished issue back to the contract item by item.

Do not substitute broad phrases such as "separate responsibilities", "follow
the agreed structure", or "refactor appropriately" for a confirmed concrete
structure. If a fresh executor would need to infer a material decision, the
contract and issue are incomplete.

The Execution Contract is the stable semantic handoff, not a new workflow or
tracker. `discuss` owns its meaning; repository-specific issue tooling projects
it into the durable work item; the execution workflow preserves it and records
changing run state separately. Keep repository labels, branch conventions,
project fields, and PR mechanics out of this skill.

### No-reinterpretation covenant

Treat the Execution Contract as a projection of the grounded discussion, never
as a fresh synthesis opportunity. Every Outcome, Done, Don't, Success Evidence,
Guardrail, and work-scope implication must trace to an explicit user-approved
statement or a causally necessary consequence already established in the
grounded model.

- Do not turn an example, analogy, rejected proposal, assistant suggestion, or
  observed smell into an objective, deliverable, component, or work item.
- Do not revive a withdrawn conclusion when compressing the discussion into the
  contract.
- Do not treat `proceed`, `진행해`, or equivalent execution approval as approval
  for content first introduced while drafting the contract, issue, or plan.
- If the user explicitly asks to proceed, preserve that authorization. Record
  already grounded decisions in the smallest Execution Contract and continue;
  the absence of a named Goal Anchor or contract does not require reapproval.
  Ask only about a consequential unresolved choice or a change beyond the
  authorized scope, not about routine implementation decisions.

Before proposing execution, run both directions of the source check. Compare
each contract item against its discussion anchor and remove any unmatched item.
Then compare every material grounded decision forward into the contract. If a
decision is missing, restore it without weakening its exact meaning. When an
unmatched or missing item reveals that the discussion never closed a material
decision, reopen the earliest affected causal element instead of guessing.

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

When explaining relationships, sequences, boundaries, competing
interpretations, or premise changes, prefer a compact ASCII diagram when it
makes the reasoning easier to grasp. Use it as part of the answer rather than
as a mandatory checkpoint or decorative summary.

Before an explicit execution handoff, discuss direction and what would change
the judgment rather than presenting a concrete implementation sequence as
settled.

When the user requests a plan or execution handoff, verify that the proposed
solution closes the Problem and Cause, respects Constraints, uses relevant
Assets and External evidence, accounts for the grounded Ecosystem convergence
state, and has acceptable Side effects and Obstacles. Then provide the
smallest plan that preserves the causal anchor.
