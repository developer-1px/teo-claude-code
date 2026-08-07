# FRT Gate

Run this gate before proposing the transition from discussion to execution.
The gate is structural: a claim does not pass because it sounds plausible; it
passes because its evidence is anchored and its falsification condition is
stated.

## Claims to verify

For each claim below, state the evidence anchor (file path, rule name,
concrete code or value, or quoted user statement) and the observation that
would prove the claim wrong. Present them in natural prose or a compact list —
a fixed table format is not required.

1. The solution directly removes the Problem.
2. The Cause is removed, not routed around.
3. Every Constraint is respected.
4. Existing Assets are reused; anything built new is justified against them.
5. The Solution follows, adapts, or deliberately departs from the grounded
   Ecosystem convergence direction, and the choice is explained.
6. Side effects are named and smaller than the original problem.
7. At least one alternative was considered and rejected for a stated reason.

## Automatic failures

- Evidence phrased with `적절히`, `필요시`, `가능한`, `없음`, `확인 필요`,
  `나중에`, `TBD`, `대충`, or an equivalent hedge does not count as evidence.
- A claim without a falsification condition fails.
- Zero side effects fails: every real change costs something.
- Zero rejected alternatives fails: an unexamined solution is not converged.

## Decision

- All claims pass: present the Outcome/Done/Don't anchor, your judgment of the
  next action with its strongest ground (project rule, standard, ecosystem
  convergence, or design principle), and propose proceeding.
- A claim is blocked only on the user: ask the one question that resolves it.
  User confirmation or explicit delegation passes the claim only when the
  remaining assumption is named.
- A claim fails on evidence: do not propose. Return to that claim as the
  earliest open element and investigate.
