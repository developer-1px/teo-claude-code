# Execution Contract

Use this reference only when a grounded discussion is ready to cross into
execution. The contract preserves meaning across issue creation, context
compaction, session resume, agent handoff, implementation, and review. It is a
handoff schema, not another user-invoked step.

## Stable contract

Produce the smallest deterministic contract that lets a fresh executor
reproduce the agreed direction without reopening any material decision.
`Smallest` means removing only information whose absence cannot change a
reasonable executor's choice of target, scope, owner, dependency direction,
structure, behavior, fallback policy, invariant, or completion evidence. It
does not mean minimizing headings, words, or issue-body length.

```markdown
### Goal Anchor
- Outcome: [one user-visible or operational result]
- Done: [observable evidence that closes the original gap]
- Don't: [non-goals and invariants that must remain unchanged]

### Success Evidence
- [observation, acceptance case, test, state, or artifact that proves Done]
```

The Goal Anchor is a compact navigation aid, not the whole handoff. Add
`Grounded Decision Context` whenever omitting the grounded problem, cause,
rationale, boundary, or intentionally delegated choice would reopen a material
fork:

```markdown
### Grounded Decision Context
- Problem: [the concrete gap this work closes]
- Cause: [the verified mechanism producing the gap]
- Settled decisions:
  - [exact decision] — [why it follows from the grounded discussion]
- Boundaries:
  - In: [included surface and why]
  - Out: [adjacent surface excluded and why]
- Executor discretion:
  - [implementation choices intentionally left open]
```

Include only the entries that carry material meaning. Do not add empty fields.
`Executor discretion` is not an unresolved decision: it records choices that
the user deliberately left to implementation. A material choice that remains
unresolved returns the discussion to its earliest affected causal element.

## Preserve the discussion model

The contract must preserve the model created by the discussion, not merely its
last recommendation. Before drafting it, identify the material decision
artifacts in the conversation:

```text
discussion
├─ user intent and controlling criterion
├─ corrected premises that changed the model
├─ canonical vocabulary and distinctions
├─ ownership, mapping, dependency, state, or command flow
├─ approved ASCII structure
├─ rejected models that could plausibly recur
└─ executor discretion
          │
          ▼ lossless semantic projection
Execution Contract
```

Include only artifacts whose omission could make a capable executor reconstruct
a materially different model after inspecting the repository. This is not a
transcript dump. Ordinary exploration, superseded assistant suggestions,
non-decisive questions, and incidental implementation detail stay out.

Use these optional sections when the corresponding material exists:

```markdown
### Intent
- [the user's controlling intent or distinction]

### Corrected Premises
- Rejected premise: [the earlier interpretation]
- Correction: [the evidence or user correction]
- Consequence: [the model decision that follows]

### Rejected Models
- [plausible model] — [why the discussion rejected it]

### Executor Discretion
- [choice intentionally left for repository-guided implementation]
```

Do not add these headings when no material content exists. `Corrected Premises`
records only corrections that changed the contracted model. `Rejected Models`
records only alternatives likely to reappear from the code, convention, or a
future review; it is not a history of every considered idea.

Add these sections only when they prevent a real continuity risk:

````markdown
### Canonical Vocabulary
- [term]: [one stable meaning used across issues, code, and progress reports]

### Guardrails
- [boundary that is more precise than Don't]

### Smells
- [early observable sign that the approach is drifting or hiding failure]

### Replan Triggers
- [observation that invalidates an assumption and requires renewed discussion]

### Work Topology
- [single issue, phased single issue, independent issue graph, or decision map]

### Target Structure
```text
[exact approved hierarchy, ownership tree, or ordered composition]
```

### Canonical Mapping
- [approved source concept] = [approved target concept]

### Behavior Contract
- [trigger] -> [owner] -> [effect or observable state]
````

Prefer an ASCII artifact when the contract depends on relationships, flow,
hierarchy, mapping, state transitions, ownership boundaries, or before/after
structure. An ASCII artifact approved in discussion is semantic content:
preserve its names, directions, nesting, cardinality, states, and exclusions
verbatim or in a demonstrably lossless equivalent. Goal Anchor prose or a task
list cannot replace it. If a changed premise invalidates the diagram, redraw
and reconfirm the affected artifact rather than carrying it forward. Skip
diagrams for simple facts and lists.

Do not add empty headings, generic best practices, guessed metrics, or terms
that matter only inside one implementation file. Each item must trace to the
grounded causal model or FRT gate.

`Grounded Decision Context`, `Target Structure`, `Canonical Mapping`, and
`Behavior Contract` are optional only when no material decision of that kind
was settled. Once exact shape or rationale is part of the approved solution,
preserving it is mandatory. Do not replace it with a prose summary; exact
names, route or product surfaces, parent-child relations, one-to-one pairings,
dependency direction, command ownership, fallback policy, and included or
excluded boundaries are semantic contract content.

Broad verbs such as `separate`, `align`, `preserve`, `clean up`, or `handle`
do not carry a settled decision by themselves. When such wording controls
implementation, name the affected target, owner, boundary, artifact, behavior,
or evidence that gives it one material interpretation.

## Fresh Executor Test

Before presenting or projecting the contract, assume the executor has the
repository and durable issue but none of the discussion. If two reasonable
executors could choose materially different targets, owners, boundaries,
dependency directions, structures, behaviors, fallback policies, invariants,
or completion evidence, the contract is ambiguous. Restore the grounded
decision that closes the fork. If the discussion never closed it, reopen the
earliest affected causal element instead of guessing.

Also test semantic continuity in the other direction. Starting from the raw
discussion, point every material correction, canonical name, distinction,
mapping, ownership relation, approved ASCII artifact, recurring rejected model,
and delegated choice to its contract representation. A contract fails when it
retains the outcome but loses the model that made the outcome mean one thing.

The test does not freeze incidental implementation details. Local names,
equivalent internal representations, and other choices explicitly recorded as
executor discretion remain open.

## Separate stable meaning from run state

The contract is stable. Execution state is not part of it.

| Stable contract | Changing run state |
|---|---|
| Outcome, Done, Don't | current phase or frontier |
| agreed success evidence | observations collected so far |
| grounded decisions and executor discretion | active interpretation or proposed mechanism |
| canonical vocabulary | active hypothesis |
| guardrails and smells | blockers and unavailable checks |
| replan triggers | next verification |

Preserve the first contract as immutable history. A change to Outcome, Done,
or Don't requires explicit user approval and an append-only contract delta.
New observations may complete a condition or trigger replanning; they do not
silently rewrite its meaning.

## Choose the lightest topology

1. **Small and clear, with no additional material decisions**: one issue with
   Goal Anchor and Success Evidence. Add Grounded Decision Context or exact
   artifacts whenever omitting them would reopen a material fork.
2. **Phased but one causal objective and one PR**: one issue; put phases,
   dependencies, observations, and the next verification in the execution
   workflow's working-plan or progress comments.
3. **Independently ownable, deployable, or reviewable objectives**: split
   issues and state dependency edges. Give each issue its own contract.
4. **Multi-session work dominated by unresolved decisions**: create a
   Wayfinder-style decision map first. Decision nodes record questions,
   evidence, and unlock conditions; create implementation issues only after
   the relevant decisions converge.

Do not create a graph merely because work has several steps. Use an issue
graph only when independent ownership, delivery, or decision dependencies make
the edges operationally meaningful.

## Project into durable execution

- Prefer the issue body when creating a new issue from the contract.
- For an existing issue, use the repository's authoritative scope location or
  an explicit approved scope comment; do not overwrite unrelated issue text.
- Project the contract into the issue; do not reinterpret or improve it while
  writing the title, background, scope, completion conditions, or sequence.
- Repository issue templates are presentation containers. When their ordinary
  headings cannot preserve a material decision losslessly, include the relevant
  contract section explicitly instead of paraphrasing it into broader prose.
- Include every exact structural artifact from the contract verbatim or in a
  demonstrably lossless equivalent form. A fresh executor must not have to
  reconstruct component placement, ownership, mapping, or behavior from broad
  principles.
- Before creating or updating the issue, map every semantic issue item to the
  exact approved contract item or user statement that authorizes it. Repository
  metadata and verified current-state evidence may be added, but they must not
  create a new objective, deliverable, solution, acceptance condition, or
  non-goal.
- Treat examples, analogies, assistant proposals, rejected approaches, and
  review observations as non-authoritative unless the user explicitly adopted
  them into the contract. Omit unmatched items. If an unmatched item seems
  necessary, stop and request a contract delta instead of inserting it.
- Let repository-specific tooling add labels, assignees, project state,
  branches, and PR conventions without changing the contract's meaning.
- Let the execution workflow maintain run state and evidence in progress
  comments. On resume, reread the durable contract before summaries or plans.
- After drafting the issue, perform a reverse check: point each issue scope and
  completion item back to the contract, and point each contract item forward to
  an issue section. Do not create or update the issue while either direction has
  an unmatched material item.
- Run the Fresh Executor Test again against the durable issue. The issue fails
  when it forces an executor to reopen a material decision that the discussion
  and contract had already closed.
- If a smell or replan trigger is observed, stop expanding the current plan.
  Return to the earliest invalidated causal element and seek a contract delta
  only when the stable contract must change.
