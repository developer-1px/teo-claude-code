---
name: main
description: "Use when the user invokes `$main` or asks Codex to safely return a git repository to the latest main branch. Classify dirty files, local commits, tracking branches, and PR state first; clean up only merged, redundant, or explicitly disposable work; then fast-forward main from its remote."
---

# `$main`

Goal: leave the current git repository on an up-to-date `main` branch and clean up everything that can be proven disposable without hiding data loss. Dirty files, local-only commits, open PRs, missing PRs, and unavailable remotes are states to report, not things to silently paper over.

## Principles

- Prefer the current repository's configured remote and base branch. Default to `origin` and `main` only when the repo does not say otherwise.
- Do not merge PRs. This skill only returns to main and cleans up work already merged or proven redundant.
- Do not use `git reset --hard`, `git clean -fd`, force branch deletion, or remote branch deletion without evidence.
- Do not use `stash` just to force checkout. If preservation is needed, ask or make the stash purpose explicit.
- Do not convert failed PR/remote lookups into "current", "latest", or any guessed state. Report `missing`, `unavailable`, `unauthorized`, or `unsupported`.
- Do not discard source, documentation, config, lockfile, migration, or canonical asset changes unless the user explicitly asks.
- "Clean" includes removing clean linked worktrees and local branches for work that is already merged, an ancestor of remote main, or patch-equivalent to remote main. It does not mean sweeping unrelated open worktrees or branches.
- Use `git worktree remove <path>` only after inspecting that linked worktree and proving it is clean or contains only explicitly disposable generated output. Do not use `git worktree remove --force` by default.
- Exception: if a worktree is proven clean and merged/redundant, but non-forced `git worktree remove` fails only because Git refuses to remove worktrees containing submodules, `git worktree remove -f <path>` is allowed. Record the evidence in the final response.
- Run `git worktree prune` to remove stale worktree metadata after fetch/status checks. This prunes Git metadata for missing worktree paths; it does not delete existing source directories.
- Final response must report final branch, update result, deleted local branches/files, and any state intentionally kept.

## Workflow

1. Identify the repo, branch, remotes, and dirty state.

```bash
git rev-parse --show-toplevel
git status --short --branch
git branch --show-current
git remote -v
git symbolic-ref --quiet --short refs/remotes/origin/HEAD
git worktree list --porcelain
```

If the default remote HEAD is unavailable, use `origin/main` when it exists. If neither exists, stop and report `missing-main`.

2. Fetch remote state.

```bash
git fetch --all --prune
```

If fetch fails, classify remote state as `unavailable` or `unauthorized` and stop cleanup decisions that depend on remote truth.

3. Classify local changes and commits.

```bash
git status --porcelain=v1
git diff --stat
git diff --cached --stat
git log --oneline --decorate --max-count=20
git worktree list --porcelain
```

Use these states:

- `clean`: no staged, unstaged, or untracked changes
- `dirty-generated`: only reproducible build output, cache, logs, or test output
- `dirty-source`: source, docs, config, lockfiles, migrations, or canonical assets changed
- `main-local-commit`: `main` has commits not in its remote tracking branch
- `feature-local-commit`: current non-main branch has commits not in remote main
- `linked-worktree-clean`: a local branch is checked out in another worktree and that worktree has no staged, unstaged, or untracked changes
- `linked-worktree-dirty-generated`: a linked worktree has only reproducible build output, cache, logs, or test output
- `linked-worktree-dirty-source`: a linked worktree has source, docs, config, lockfiles, migrations, or canonical assets changed

4. If already on main, fast-forward only.

```bash
git log --oneline <remote-main>..main
git pull --ff-only <remote> main
git status --short --branch
```

If main has local-only commits or fast-forward fails, do not merge, rebase, or reset. Report the blocker.

5. If on another branch, or if a branch checked out in a linked worktree blocks branch deletion, check PR and redundancy evidence.

```bash
gh pr view <current-branch> --json number,state,mergedAt,url,baseRefName,headRefName,headRepositoryOwner,mergeCommit
git cherry -v <remote-main> HEAD
git merge-base --is-ancestor HEAD <remote-main>
git log --oneline <remote-main>..HEAD
git -C <linked-worktree-path> status --short --branch
```

If `gh pr view` is unavailable or the repo is not GitHub-backed, keep PR state as `unsupported` or `unavailable`; rely only on git ancestry/patch evidence.

6. Decide cleanup.

| State | Action |
|---|---|
| PR is `MERGED` and worktree is clean | switch to main, fast-forward, delete local branch |
| PR is `MERGED` and branch is checked out in a clean linked worktree | remove the linked worktree, then delete the local branch |
| `HEAD` is ancestor of remote main | switch to main, fast-forward, `git branch -d <branch>` |
| linked worktree `HEAD` is ancestor of remote main and linked worktree is clean | remove the linked worktree, then `git branch -d <branch>` |
| `git cherry` shows all commits as `-` | switch to main, fast-forward, delete local branch; force-delete only if safe deletion fails and patch-equivalence is clear |
| linked worktree `git cherry` shows all commits as `-` and linked worktree is clean | remove the linked worktree, then delete local branch; force-delete only if safe deletion fails and patch-equivalence is clear |
| PR is `OPEN` | keep branch; if clean, switch to main and fast-forward only |
| no PR and unique commits exist | keep branch |
| `dirty-source` exists | keep files and report them |
| only `dirty-generated` exists | report files; clean only clearly reproducible outputs |
| linked worktree has `dirty-source` | keep linked worktree and branch; report blocking paths |
| linked worktree has only `dirty-generated` | clean only clearly reproducible outputs; if the linked worktree then becomes clean and work is merged/redundant, remove it |

Prefer safe local branch deletion first:

```bash
git branch -d <branch>
```

Use force deletion only after merged or patch-equivalent evidence:

```bash
git branch -D <branch>
```

For linked worktrees, prefer non-forced removal after the branch is proven merged or redundant:

```bash
git worktree remove <linked-worktree-path>
git branch -d <branch>
git worktree prune
```

If `git worktree remove` fails because files are dirty, do not force it. Reclassify the dirty files and either clean only clearly reproducible generated output or report the blocker.

If `git worktree remove` fails because the worktree contains submodules, first verify:

```bash
git -C <linked-worktree-path> status --short --branch
git merge-base --is-ancestor <branch> <remote-main>
git log --oneline <remote-main>..<branch>
```

Only when the linked worktree is clean and the branch is merged/redundant may you use:

```bash
git worktree remove -f <linked-worktree-path>
git branch -d <branch>
git worktree prune
```

Do not delete arbitrary local branches just because they are not `main`. Cleanup scope is the current branch, branches whose deletion is necessary to complete this `$main` return, and branches/worktrees proven merged or redundant during this run.

7. Finish on main and verify no disposable state was left behind.

```bash
git switch main
git pull --ff-only <remote> main
git status --short --branch
git worktree list --porcelain
```

If switching to main is blocked by dirty files, do not restore, reset, or stash around it. Report the blocking paths.

## Response

Keep the final response short:

- `branch`: final branch and tracking status
- `updated`: fast-forward or already up to date
- `cleaned`: deleted local branch or generated files
- `kept`: branch, commits, or dirty files left in place and why
- `blocked`: network, auth, PR lookup, fast-forward, or checkout blockers
