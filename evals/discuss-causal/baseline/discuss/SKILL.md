---
name: discuss
description: Align hidden intent, scope, and strategy before execution by investigating first and asking only evidence-backed gap questions. Use for /discuss, $discuss, ambiguous goals, why-before-how conversations, or deciding between project-local and personal-tool work. Do not combine with grilling; an explicit grill request uses grilling instead.
---

# Discuss

Use a judgment-first conversation to turn an ambiguous request into an executable plan. Investigate available context, state the strongest interpretation and its evidence, then ask only for information that cannot be discovered safely.

`discuss` is not an interview protocol. If the user explicitly asks to be grilled or stress-tested through questions, use `grilling` instead. Never run both protocols in one conversation phase.

## Keep discussion separate from execution

Until the user explicitly says to modify, run, create, apply, or proceed, keep every artifact provisional.

Allowed during discussion:

- read-only code, document, history, diff, and configuration inspection
- causal analysis, alternatives, drafts, and execution-plan proposals
- external verification when current or authoritative facts matter

Not allowed without explicit execution approval:

- file or configuration changes
- commits, issue publication, external messages, or goal creation
- treating agreement with an interpretation as approval to implement it

## Resolve scope before loading rules

Infer the narrowest likely scope, inspect evidence inside it, and correct the scope when evidence disagrees.

| Scope | Read first | Avoid |
|---|---|---|
| project-local | repository instructions, architecture SSOT, related code/docs/history | unrelated global conventions |
| personal/global tool | the target skill, tool, config, and its authoritative format | current repository rules outside the target |
| conversation-only | the conversation and supplied artifacts | local or external searches without need |
| external/domain | official or primary sources required for the decision | unverified best-practice claims |

Repository-local rules outrank generic advice inside that repository. Treat changing those rules as a separate decision.

## Build the causal model

Track these elements in order. Later evidence may be recorded early, but do not treat a downstream solution as settled while an upstream element remains ambiguous.

| # | Element | Decision it must support |
|---:|---|---|
| 1 | Intent | Why the user wants this |
| 2 | Background | What event or pattern triggered it |
| 3 | Ideal result | Observable done state |
| 4 | Current reality | Verified present state |
| 5 | Problem | Gap between ideal and current |
| 6 | Cause | Mechanism producing the gap |
| 7 | Constraints | Conditions that cannot change |
| 8 | Assets | Existing code, docs, tools, and skills |
| 9 | External evidence | Facts that must be verified outside the scope |
| 10 | Objective | Changeable leverage point |
| 11 | Solution | Concrete future reality |
| 12 | Side effects | New costs or risks created by the solution |
| 13 | Obstacles | Preconditions blocking execution |

Use an evidence gate, not conversational confidence:

- Green: anchored to user confirmation, explicit delegation, repository rules, code, documents, or authoritative standards; one actionable interpretation remains.
- Yellow: direction exists but evidence, terminology, or a decision branch is missing.
- Red: empty, abstract, or supported only by preference.

Do not promote an element on generic words such as “improve,” “clean up,” “flexible,” or “better.” Translate them into observable input, output, ownership, cost, or verification.

## Lock the Goal Anchor

Once intent, ideal result, and constraints are grounded, condense them into one stable contract:

```markdown
### Goal Anchor
- Outcome: [the one user-visible or operational result]
- Done: [observable evidence that closes the original gap]
- Don't: [non-goals and invariants that must remain unchanged]
```

Draft the anchor from the user's first goal and strongest evidence, then ask for confirmation only when a material branch remains. Lock it before settling downstream solutions. Later implementation ideas, review findings, severity labels, and generic best practices do not silently rewrite it.

Classify every new proposal or discovery against the anchor:

| Class | Test | Action |
|---|---|---|
| clarification | makes the existing Outcome, Done, or Don't more precise without changing meaning | refine the wording |
| necessary consequence | has a direct causal chain to Done or preserves a Don't invariant | keep it in the current plan and state the chain |
| separate objective | is useful but not required to close Done | defer it outside the current plan |
| contract delta | changes Outcome, adds a Done condition, or relaxes a Don't invariant | stop, show the before/after delta, and require explicit user approval |

Severity alone never converts a separate objective into current scope. If a newly discovered risk blocks safe completion but does not fit the anchor, report the work as blocked or propose a contract delta; do not absorb the risk remediation invisibly.

When the conversation starts optimizing a downstream idea while the original gap remains open, restate the Goal Anchor, name the remaining distance to Done, and return to the earliest unresolved cause. Keep deferred ideas visible without turning them into current acceptance criteria.

## Work one unresolved element at a time

For the first unresolved element:

1. Extract anchors from the user's words and supplied artifacts.
2. Inspect accessible evidence in the inferred scope.
3. Form two or three interpretations only when a real branch remains.
4. State the recommended interpretation, strongest evidence, and what would falsify it.
5. Ask one gap question only if evidence cannot close the branch. Include the recommendation.

If several elements become grounded in one pass, present at most three new conclusions for confirmation. Keep later conclusions provisional rather than inventing a queueing taxonomy.

Use this compact response shape:

```markdown
제 판단: [recommended interpretation].
근거: [strongest anchor].
이 판단이 바뀌는 조건: [falsifier].

| 요소 | 현재 판단 | 상태 |
|---|---|---|
| 목적 | ... | 🟢/🟡/🔴 |

확인 질문: [one remaining branch, with recommendation]
```

Do not ask the user for facts available in the codebase, repository instructions, history, or supplied documents.

## Rank evidence

Use this order and do not let a lower source overwrite a higher one:

1. confirmed user intent
2. explicit delegation of judgment
3. scoped repository or tool rules
4. official standards and specifications
5. strong de-facto standards
6. general design principles
7. preference or inference

When a standard conflicts with a confirmed constraint, expose the conflict instead of silently choosing either side.

## Test the solution before proposing execution

Once elements 1–11 are grounded, run this future-reality test:

| Check | Pass condition |
|---|---|
| solution removes problem | it directly closes the ideal/current gap |
| solution removes cause | it changes the producing mechanism, not only the symptom |
| constraints hold | no fixed condition is violated |
| assets were considered | existing mechanisms were evaluated before new concepts |
| side effects are acceptable | costs are explicit and smaller than the problem |
| an alternative was rejected | at least one plausible alternative has a concrete rejection reason |

Each claim needs evidence and a falsifier. If a row fails, revise the solution rather than lowering the gate.

## Close with an executable plan

When the causal model and future-reality test pass, produce:

```markdown
## Execution plan

### Goal Anchor
- Outcome: [one observable objective]
- Done: [checkable evidence]
- Don't: [explicit non-goals and invariants]

### Scope
- Include: ...
- Exclude: ...

### Constraints
- ...

### Plan
1. ...

### Verification
- ...

### Risks
- ...
```

Ask for execution only when the user has not already approved it. Create a goal only after an explicit goal request or explicit acceptance of the goal handoff.

Before handoff, show deferred objectives separately and confirm that they are not part of Done. The discussion is complete when another agent can execute the plan without reconstructing intent, no unresolved upstream element can materially change the chosen solution, and every planned step maps to the locked Goal Anchor.
