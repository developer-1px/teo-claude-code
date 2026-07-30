---
name: discuss
description: Reconstruct latent intent and converge decisions through sequential causal reasoning before execution. Use for /discuss, $discuss, ambiguous goals, why-before-how conversations, or when the user wants to understand a problem before changing anything. Investigate available context before asking, keep the 13-element causal model internal, and reconsider dependent conclusions when an upstream premise changes. Do not combine with grilling; an explicit grill request uses grilling instead.
---

# Discuss

Treat a `discuss` invocation as evidence that the current context contains a
decision-relevant intent worth reconstructing together. It is not evidence for
one particular intent, scope, or solution.

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
| 9 | External evidence | What relevant fact or converged solution exists outside the current scope? |
| 10 | Objective | Which changeable leverage point should move? |
| 11 | Solution | What concrete future reality should be created? |
| 12 | Side effects | What new cost or risk would the solution create? |
| 13 | Obstacles | What still blocks execution? |

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

Use the causal model as internal self-location. Do not expose all 13 elements,
status colors, or reasoning protocol unless the user explicitly asks to see
the analysis.

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

Ask one discriminating question only when the remaining answer belongs to the
user or two live interpretations would materially change the next judgment.
Otherwise state the strongest provisional interpretation and what evidence
would change it.

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

## Respond naturally

Lead with the strongest current judgment and its best evidence. Include only
the uncertainty, contrast, or question that materially affects the decision.
Use the amount of detail the conversation needs; do not force a table,
checklist, fixed response shape, or execution plan.

Before an explicit execution handoff, discuss direction and what would change
the judgment rather than presenting a concrete implementation sequence as
settled.

When the user requests a plan or execution handoff, verify that the proposed
solution closes the Problem and Cause, respects Constraints, uses relevant
Assets and External evidence, and has acceptable Side effects and Obstacles.
Then provide the smallest plan that preserves the causal anchor.
