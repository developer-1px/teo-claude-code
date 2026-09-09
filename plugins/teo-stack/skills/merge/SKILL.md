---
name: merge
description: "Assess or prepare existing PRs for landing, resolve in-scope CI, review, and conflict blockers, and merge when authorized. Use for $merge, merge 가능?, merge 준비, CI 대응 후 merge, or a scoped PR merge queue. Not for ordinary local branch integration or new implementation."
---

# Merge

Take an existing PR through the requested landing stage. Reuse its scope and
verification; do not restart the implementation workflow.

## Requested endpoint and authority

Interpret the whole request and established conversation, not the word
"merge" in isolation.

| Request | Authorized endpoint |
|---|---|
| "merge 가능한지", status, or diagnosis only | Read-only assessment; no edits, comments, reruns, or merge |
| "merge 준비", CI or review response | In-scope repair, verification, commit/push, and review response; stop ready unless merge was also authorized |
| "merge", "$merge", or "CI 대응 후 merge" for an identified PR | Resolve ordinary in-scope landing blockers and complete the authorized merge |

Preserve narrower limits, explicit review waits, and stop conditions. An
existing merge authorization remains valid for that target; do not request it
again after each check or routine repair. Green checks, review approval, and
skill selection alone are not authorization. If the target or action remains
materially ambiguous, ask only for that missing decision.

## Resolve ownership and current state

Use the PR URL, conversation, issue, and current repository rules to identify
the exact host/repository, PR, head, target base, and authorized responsibility.
For "my PRs", apply the requested selector and current ownership constraints;
an assignee label or a remembered path restriction is not sufficient authority
over another person's work.

Read applicable AGENTS.md and landing, verification, and collaboration rules.
Inspect the current diff, issue acceptance, reviews, checks, dependencies, and
relevant local worktrees. Distinguish the remote PR head from unpublished local
changes. Preserve dirty files, unique commits, and other agents' active work;
coordinate overlapping changes rather than overwriting them.

## Decide what actually blocks landing

- Identify repository-required checks and reviews, explicit user conditions,
  conflicts, and credible acceptance or safety gaps. Mergeability is not proof
  that these are satisfied.
- Associate results with the current head and relevant base. After changes,
  re-evaluate invalidated evidence; do not reuse a green result for another
  revision or rerun unaffected verification merely as a ritual.
- Separate actionable failures, pending work, infrastructure failures, and
  unavailable evidence. Missing checks or denied access do not mean success.
  Use repository rules or another authoritative source if gate discovery fails;
  do not silently assume that no requirements exist.
- Assess review findings against the code. Repair verified in-scope defects;
  explain false positives or already-addressed findings with evidence.
  Advisory suggestions are not an automatic expansion of the PR.
- A non-required check or low-severity review can still reveal a real
  regression, security, or privacy risk. Investigate credible findings before
  landing; hold the PR when a valid risk needs an out-of-scope decision.

Wait for required checks or reviews and waits the user explicitly requested.
Use the available monitoring/wait mechanism and report meaningful changes.
For optional delayed automation, decide from repository rules, risk, and
available verification whether self-review is sufficient; disclose the missing
review. Do not replace a required review or an explicit wait just because it is
slow, and do not keep a ready PR open solely for unrelated advisory work.

## Repair and reverify within scope

For an execution request, complete ordinary repairs rather than stopping at
the diagnosis: regenerate stale outputs, fix demonstrated regressions, or
resolve conflicts that preserve both changes' intended behavior. Use repository
commands, guards, and commit/push conventions. Validate the changed behavior
and affected dependencies; use browser verification when the repair requires it.

Do not weaken checks, suppress failures, discard the other side of a conflict,
or mark unresolved findings addressed to manufacture a passing state.
Ask for a specific scope decision when conflict resolution would change agreed
product meaning or ownership, or require unrelated or out-of-scope work.
Reapplying the same behavior to an established new location is not by itself
a new scope decision.

Continue through repair, push, and refreshed verification while safe in-scope
progress remains. Retry transient failures only when evidence supports a retry;
do not loop unchanged failures or rewrite CI to avoid them. When access, an
external decision, or a scope limit prevents progress, preserve the work and
report the concrete blocker and what would unblock it. Pending work under an
authorized monitoring request remains monitoring, not a completed merge.

## Multiple PRs

Operate on the requested PR set, not every open PR or newly arriving work.
Inspect dependencies and overlapping changes; merge sequentially and refresh
affected candidates after each landing. A blocked or ambiguous PR can be held
with its reason while independent authorized PRs proceed.

Respect each PR's intended base. Do not silently retarget a stacked PR, absorb
another author's work, or merge an unapproved prerequisite. Revisit a held PR
when a dependency or other material evidence changes.

## Merge the verified revision

Immediately before merging, refresh the PR head, base, checks, and blocking
reviews. If the head changed, reconcile the new diff and evidence first.
Use the repository's merge method and an expected-head guard when supported.
Merge authorization does not permit force-push, admin bypass, or bypassing
required checks.

Confirm the provider's actual merged state, merge commit, and target branch.
An accepted command, auto-merge setting, or queue entry is not a completed
merge. If queued, follow through when the requested endpoint is actual merge.
A child PR merged into a feature branch is not yet landed on main; report that
distinction and any remaining dependency.

## Close the loop

Read back linked issue and project state. Make required lifecycle updates only
where the actual linkage and completed scope support them; do not close an
umbrella, mirrored issue, or unrelated work merely because a PR merged.
Report unavailable permissions separately from the successful merge.

When cleanup or return-to-base is authorized, use [main](../main/SKILL.md) when
available, otherwise the repository's cleanup procedure. Prove the exact local
tip is redundant and preserve dirty or continuing work. Merge alone does not
authorize worktree, branch, or server cleanup, nor deployment.

Report the PR, actual endpoint and target, merge commit when landed, and
material remaining work. Keep PR merge, main integration, issue completion,
local cleanup, and deployment distinct without claiming unperformed stages.
