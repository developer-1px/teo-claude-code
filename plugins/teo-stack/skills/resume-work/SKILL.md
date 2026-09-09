---
name: resume-work
description: "Recover an interrupted software task by reconciling its agreed intent with current repository, worktree, issue, and PR state. Use for $resume-work, 뭐 하던 거야?, 어디까지 했지?, 세션이 끊겼어, 현황 파악 후 재개, or continuing interrupted work. A status request stays read-only; ordinary progress reporting without lost context does not need this workflow."
---

# Resume Work

Recover what the user was trying to finish and what actually remains. Restore
continuity in the current conversation; do not restart completed work or make
workspace cleanup the objective.

## Recover the active intent

Use available conversation, relevant task history, and the owning artifacts to
recover the objective, completion criteria, settled decisions, exclusions, and
existing action authority. Retain exact names, mappings, and rejected choices
when losing them would change the work. Routine choices already delegated to
the agent do not need a new approval.

Apply later corrections, scope changes, pauses, and abandonment. A message
withdrawn as intended for another agent does not change this task; preserve
unaffected decisions. Historical permission does not override a newer stop or
a current request limited to status.

Search only the context needed to identify and restore this task. Do not scan
all personal history by default, copy private conversations into repository
artifacts, or require a particular history provider or storage path.

## Reconcile intent with actual state

Identify the exact repository, worktree, branch, issue, PR, and relevant session
from evidence. Do not select the latest session, first matching branch, or
default account as a substitute for unresolved ownership. If several tasks
remain plausible, report what can be established and ask only which target.

Inspect applicable repository rules and relevant current artifacts. Reconcile:

- The approved outcome and decisions with the actual implementation and diff.
- Local HEAD, staged/unstaged/untracked work, and unpublished commits with the
  remote PR head and its intended base.
- Required completion evidence with the revision and behavior it verifies.
- Remaining dependencies with open, queued, merged, or abandoned PRs and
  ongoing work owned by other agents.

Treat old summaries, assistant claims of completion, and check results as
evidence to reconcile, not proof of the current state. A merged predecessor or
child PR does not establish that a stacked change reached the target branch.
A merged PR does not account for later local commits or dirty work.

Preserve user files, unique commits, and other agents' work. Inspect ongoing
work without restarting processes, taking ownership, or deleting its workspace.
Reuse trustworthy evidence unless a relevant change invalidated it; recovering
status does not require a fresh full build or a repository-wide audit.

Separate confirmed facts, grounded inferences, and unavailable evidence.
Unavailable history or remote access is not evidence that work is absent,
clean, complete, or safe to discard. Continue with reliable local context
where possible and expose the specific gap.

## Match the requested action

"뭐 하고 있었어?", "어디까지 했지?", and status-only requests authorize
read-only reconstruction. Do not edit, publish comments, rerun remote jobs,
merge, or clean up, even if an earlier task had broader execution authority.

"하던 거 계속", "확인하고 재개", or an equivalent execution handoff authorizes
continuation of the recovered, agreed task within its action boundaries.
Do not request the same approval again when scope and authority are clear.
If a material target, product decision, or permission is genuinely missing,
ask for that specific choice without reopening settled decisions.

Choose only the current phase: [discuss](../discuss/SKILL.md) for an unresolved
material decision, [teo-dev](../teo-dev/SKILL.md) for remaining agreed
implementation, or [merge](../merge/SKILL.md) for existing-PR landing work with
the corresponding authority. Use [main](../main/SKILL.md) only when cleanup or
return-to-base was requested. If a skill is unavailable, use the repository's
procedure within the same scope. Do not run these as a mandatory sequence.

## Restore a usable working state

Give a compact account of the original objective and key decisions, what is
actually reflected now, and the remaining work with its evidence gaps.
Identify the smallest next step and whether it is inspection or authorized
execution. Include exact artifact links or revisions where they distinguish
the work; do not copy the entire history.

For a continuation request, carry this recovered state into that next step in
the same task. Do not require a new session, handoff document, product goal,
or fresh planning ritual merely to resume.
