---
name: discuss
description: "Clarify intent, causes, constraints, and a decision before execution. Use for $discuss, /discuss, or a request to understand and discuss a problem before changing it. Preserve settled decisions and prepare an actionable handoff when the discussion converges."
---

# Discuss

Help the user reach a grounded decision. Start from the actual question and
available context; infer a broader intent only when the evidence supports it.
Offer alternative interpretations when they would materially change the answer.

## Discussion and execution

During discussion, inspect, reason, compare, and draft in the conversation.
Discussion alone does not authorize file changes, issue creation, external
messages, or implementation. Agreement with a diagnosis is not an execution
handoff.

An explicit request to proceed carries forward the scope already agreed in the
conversation. A missing named artifact or Goal Anchor is not a reason to ask
for the same approval again. Reconstruct the handoff from existing decisions
and continue through the applicable execution workflow. Ask only if a material
choice remains unresolved or the proposed work would expand that scope.

## Causal model

Use these elements to locate the decision that matters next, not as a fixed
sequence of user questions:

| Element | Decision it supports |
|---|---|
| Intent | Why the user wants this |
| Background | What triggered the request |
| Ideal result | The observable result that would satisfy it |
| Current reality | What the evidence establishes now |
| Problem | The gap between ideal and reality |
| Cause | The mechanism producing the gap |
| Constraints | What must hold |
| Assets | Existing code, knowledge, tools, and capabilities |
| External evidence | Relevant standards and comparable outcomes |
| Ecosystem convergence | Direction and stability of relevant external practice |
| Objective | The changeable cause or condition to address |
| Solution | A concrete way to reach the objective |
| Side effects | Material costs or new failure modes |
| Obstacles | What remains before execution |

Keep dependent conclusions conditional on their premises. When a correction
changes a premise, revise the conclusions and diagrams that depend on it,
preserving unrelated verified facts. Limit a retraction to what the user
actually withdrew: a misrouted message does not cancel an otherwise authorized
task, while cancellation of the original objective stops it. Do not absorb
a rejected premise into a preferred solution as another constraint.

Distinguish grounded decisions from open hypotheses using user statements,
source locations, rules, or observations. A decision can be sufficiently
grounded while routine implementation choices remain delegated.

For a complex or multi-turn discussion, show a compact coverage table when
establishing or changing shared state. Include relevant grounded elements and
the earliest material open element, with their anchors. Do not repeat unchanged
rows or require a table for a simple answer. Keep later hypotheses available
without presenting them as settled.

## Evidence and questions

Inspect relevant code, documents, tests, and history before asking for facts
they can settle. For an ambiguous symbol or unqualified concept, inventory
plausible owners before selecting one; a first search hit is not ownership
evidence. Stop expanding the search once the owner and required facts are clear.

Consult external evidence when it could change the decision. A local diagnosis
does not require an ecosystem survey. When convergence matters, distinguish
stable, emerging, contested, absent, and insufficient evidence; none requires
manufacturing a recommendation. External practice cannot override confirmed
intent or local constraints.

When evidence narrows a problem to a boundary but leaves different mechanisms
inside it, inspect the cheapest distinguishing observation. Ask a focused
question only when its answer is unavailable and would materially change scope
or the decision. Otherwise state the working assumption and keep investigating.

If continuity is uncertain, recover the active request, settled decisions, and
relevant evidence. Reuse completed work; do not restart the discussion merely
because context was compacted.

## Preserve the decision

Once the direction is grounded, carry a short Outcome / Done / Don't anchor:
the result, its completion evidence, and the boundaries to preserve.
Retain exact names, mappings, ownership, behavior, diagrams, corrected premises,
and rejected models when their omission could reopen an already settled choice.

Keep useful but independent improvements outside the current objective. Review
comments and observed smells are evidence to assess, not automatic new work.

## Converge and hand off

When the material causal chain is grounded, check the relevant claims in
[references/frt-gate.md](references/frt-gate.md). Use
[references/execution-contract.md](references/execution-contract.md) when
preparing an implementation handoff or issue-ready scope.

Present the smallest handoff that preserves the actual decisions and propose
execution. Do not keep researching or invent missing sections after the
decision is ready. If the user has already asked to proceed, record that
handoff and continue without a new ceremonial approval.

A handoff may choose a routine implementation mechanism using delegated
judgment. It may not introduce an unapproved outcome, broaden a boundary, or
revive a rejected solution. Ask about the specific unresolved choice when
necessary, while completing independent authorized work.

## Response

Lead with the current judgment, supporting evidence, and the uncertainty or
next decision that matters. For code questions, anchor the explanation in actual
files and symbols: who owns the decision, the call or data path, and relevant
state changes. Distinguish the current implementation from a proposed model;
pattern names alone are not an explanation.

For a MECE request, identify the classified set and the classification axis,
give each item one disposition on that axis, and expose unknowns. Keep
independent axes separate; role and location are not competing categories.

Honor an explicitly requested format. Otherwise prefer a compact ASCII flow
or tree for structural or causal relationships and a table for repeated
mappings, only when clearer than prose. Preserve an approved diagram's meaning.
A simple answer does not need a diagram or a full causal-model inventory.
