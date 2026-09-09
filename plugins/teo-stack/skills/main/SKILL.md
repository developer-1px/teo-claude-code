---
name: main
description: "Return a repository to its current main or configured base branch and clean up proven merged or redundant local work. Use for $main, /main, or an explicit return-to-main request."
---

# Main

Leave the repository on its current base branch when possible, preserving
unique commits and user files. Report any state that prevents updating or
cleanup.

## Resolve current state

Identify the repository, current branch, configured base and remote, worktrees,
and staged, unstaged, untracked, and submodule changes. Prefer repository
configuration; use origin/main only when it exists and no different base is
specified.

Fetch the relevant remote. If it is unavailable, do not claim the base is current
or clean up based on stale remote state. Classify network, authorization,
missing refs, or unsupported PR lookup explicitly.

Separate source, docs, config, lockfiles, migrations, and canonical assets from
proven reproducible output. Do not stash, reset, or delete user work merely to
make checkout succeed.

## Prove redundancy before cleanup

For each in-scope branch or worktree, inspect the actual local tip and its
commits against the fetched base. Useful evidence includes ancestry, patch
equivalence, and a merged PR whose identity and merged head match this branch.

A PR with state MERGED is not sufficient by itself: the local branch may have
new commits added after that merge. Verify the current tip and account for all
local-only commits, including merge commits, before deletion. An empty
git cherry result alone does not prove redundancy.

Keep open-PR branches, unique commits, unavailable evidence, and dirty
worktrees. A clean feature branch can be kept while returning to the base.
Do not clean unrelated active work merely because it appears in the worktree
list.

## Update and remove proven disposable state

Fast-forward the configured base only. If it has local commits or has diverged,
preserve it and report the conflict. If the base is checked out elsewhere,
use that worktree when it is safe and report its path rather than forcing a
second checkout.

Remove a clean, proven merged or redundant linked worktree with
git worktree remove, then delete its local branch with git branch -d.
If safe deletion refuses a squash-merged or patch-equivalent branch, force
deletion is allowed only after the exact tip's redundancy is established.

For a worktree containing submodules, inspect their working files and local
commits too. If ordinary removal fails solely because submodules are present
and all contained work is proven disposable, git worktree remove -f is
permitted. Never use that exception to discard dirty or unaccounted submodule
work.

Only remove generated files when their paths and reproducibility are verified
and cleanup is within the request. Prefer recoverable removal where practical.
Do not delete remote branches or merge PRs as part of returning to main.

Prune stale worktree metadata after inspection. Verify the final branch,
tracking state, dirty state, and remaining worktrees. Reuse the fetched base
evidence unless a later event requires refreshing it; no second identical pull
is needed merely to finish the checklist.

## Report

State the final branch and update result, cleaned branches or worktrees/files,
kept work and why, and any actual blocker. Include the evidence for a forced
local deletion or the submodule removal exception.
