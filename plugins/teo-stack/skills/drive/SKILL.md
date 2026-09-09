---
name: drive
description: "Carry an agreed software objective through bounded, sequential work units using the existing implementation and PR workflows. Use for $drive, 1시간 알아서, 다음 슬라이스까지, 하나씩 완성해, or scoped continuous execution. Not for a single routine implementation, a PR-only merge queue, strategy discussion alone, or cloud-drive operations."
---

# Drive

Finish one meaningful unit, then select the next within the user's agreed
scope. This skill coordinates existing workflows; it does not introduce a new
implementation harness, timer engine, or definition of done.

## Establish the existing execution envelope

Recover the objective, eligible work, priority, completion endpoint, limits,
and action authority from the current request and established conversation.
Reuse settled decisions and delegated choices; ask only for a missing choice
that would materially change the work.

Planning requests such as "다음 전략" remain read-only. An execution handoff
authorizes the agreed work, not every action that might help it. Keep
implementation/PR creation, merge, cleanup, and deployment authority distinct.
"알아서" and a time budget do not by themselves authorize the latter actions.
Carry forward valid existing approval for the exact work instead of asking
again at every workflow transition.

Use the user's selected workflow and applicable repository rules. Do not
invoke devx or devx-batch unless explicitly named in the current request.
Skill selection does not authorize subagents, new external coordination,
or work on someone else's active change.

## Choose a completion-sized unit

Select from the named issues or the work needed for the agreed objective.
Use current code, dependencies, risk, and the user's priority to choose a unit
that can reach its requested endpoint. Reuse valid work already in progress
before opening redundant branches or PRs.

Prefer one active completion unit at a time. Do not scatter half-finished work
across many slices merely to show activity. Follow repository issue and PR
boundaries; do not combine unrelated outcomes into a larger unit.

Priority is contextual: oldest-first, code reduction, smallest diff, and a
fixed worktree strategy are not permanent defaults. Do not absorb unrelated
findings, newly arriving issues, other authors' PRs, or a larger cleanup just
because time remains. A materially broader candidate set needs authorization.

## Complete the current unit, then reassess

Use the owner for the current phase, when available:

- [resume-work](../resume-work/SKILL.md) when interrupted state must first be
  reconstructed, not as a ritual before every unit.
- [teo-dev](../teo-dev/SKILL.md) for agreed implementation through a verified
  opened PR.
- [merge](../merge/SKILL.md) for existing-PR readiness or landing, only through
  the stage authorized for that unit.
- [main](../main/SKILL.md) only for requested cleanup or return-to-base.

If an owner skill is unavailable, follow the repository procedure within the
same authority. Do not duplicate its detailed checklist or force every unit
through every phase. For PR-only delivery, an opened and appropriately
verified PR is the endpoint; autonomous execution does not extend it to merge.

Reconcile the actual result before selecting the next unit. Reuse valid
verification and refresh evidence affected by a new revision or dependency.
Keep implemented, verified, PR-open, merged into the intended base, issue
complete, cleaned up, and deployed distinct. Do not close issues or declare
acceptance merely to improve throughput.

When a unit cannot progress, report the concrete dependency, unavailable
access, or missing decision. Continue independent authorized candidates when
possible, retaining the held unit and its reason. Revisit it when evidence
changes; do not repeatedly retry unchanged failures or silently abandon it.
Required pending checks or an explicitly requested wait remain monitoring,
not proof of failure or completion. Use the available wait/monitoring mechanism.

At meaningful boundaries, report the actual endpoint, material remaining work,
and why the next unit fits the agreed priority. Respect a requested reporting
channel without treating it as permission to publish unrelated artifacts.

## Respect limits and stop honestly

Use native goal, clock, and monitoring mechanisms when available and relevant.
Create a product goal only when the user explicitly requests one; a time-boxed
instruction alone is not such a request. Do not replace an unrelated goal or
invent a token budget.

Measure time limits against real elapsed time. Preserve the agreed start,
deadline, remaining budget, scope, and held work through compaction or handoff;
neither compaction nor a new session resets the limit. Apply explicit user
changes to the limit. If total versus additional time is materially ambiguous,
ask only about that distinction while preserving the existing limit. State
when a required timing mechanism or the original start cannot be established.

Stop when the objective is genuinely complete, the requested time/work limit
is reached, the user stops the work, or a blocker leaves no safe in-scope next
step. Do not idle to consume the budget or invent filler after completion.
A deadline ends the run, not the definition of done: avoid starting a unit
unlikely to fit, stop starting new units at the limit, and preserve a coherent
checkpoint for unfinished work. Do not continue waiting past the limit merely
to make the report look complete.

Report completed endpoints, unfinished or held work, and the reason for
stopping. Never mark a goal complete just because its budget expired or the
turn is ending; follow the goal mechanism's own lifecycle rules.
