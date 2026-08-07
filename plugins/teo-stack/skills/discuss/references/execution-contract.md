# Execution Contract

Use this reference only when a grounded discussion is ready to cross into
execution. The contract preserves meaning across issue creation, context
compaction, session resume, agent handoff, implementation, and review. It is a
handoff schema, not another user-invoked step.

## Stable contract

Produce the smallest contract that lets a fresh executor recover the agreed
direction without reconstructing the conversation:

```markdown
### Goal Anchor
- Outcome: [one user-visible or operational result]
- Done: [observable evidence that closes the original gap]
- Don't: [non-goals and invariants that must remain unchanged]

### Success Evidence
- [observation, acceptance case, test, state, or artifact that proves Done]
```

Add these sections only when they prevent a real continuity risk:

```markdown
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
```

Do not add empty headings, generic best practices, guessed metrics, or terms
that matter only inside one implementation file. Each item must trace to the
grounded causal model or FRT gate.

## Separate stable meaning from run state

The contract is stable. Execution state is not part of it.

| Stable contract | Changing run state |
|---|---|
| Outcome, Done, Don't | current phase or frontier |
| agreed success evidence | observations collected so far |
| canonical vocabulary | active hypothesis |
| guardrails and smells | blockers and unavailable checks |
| replan triggers | next verification |

Preserve the first contract as immutable history. A change to Outcome, Done,
or Don't requires explicit user approval and an append-only contract delta.
New observations may complete a condition or trigger replanning; they do not
silently rewrite its meaning.

## Choose the lightest topology

1. **Small and clear**: one issue with Goal Anchor and Success Evidence.
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
- Let repository-specific tooling add labels, assignees, project state,
  branches, and PR conventions without changing the contract's meaning.
- Let the execution workflow maintain run state and evidence in progress
  comments. On resume, reread the durable contract before summaries or plans.
- If a smell or replan trigger is observed, stop expanding the current plan.
  Return to the earliest invalidated causal element and seek a contract delta
  only when the stable contract must change.
