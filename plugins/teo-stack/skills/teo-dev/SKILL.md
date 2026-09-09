---
name: teo-dev
description: "Take an agreed software change through issue setup, implementation, verification, commit, push, and PR after an explicit execution handoff such as 진행해 or 이슈 따고 진행. Excludes provisional discussion, read-only status, existing-PR landing follow-ups handled by merge, and a different workflow chosen by the user."
---

# Teo Dev

Deliver the agreed change to a verified, opened PR. Merge and cleanup require
authorization for those actions, which may already be present in the request.

## Scope and authority

Use the conversation, owning issue, and applicable repository rules to recover
the outcome, completion evidence, boundaries, and settled decisions. Do not ask
the user to repeat available context.

An explicit "진행해" or equivalent handoff authorizes normal in-scope issue and
project updates, linked branch or worktree creation, implementation,
verification, progress comments, commits, push, and PR creation. A missing
Goal Anchor or named Execution Contract does not require reapproval. Record
the agreed scope and continue.

Discussion agreement alone is not execution authorization. Green checks,
review approval, and mergeability do not authorize merge. A merge request
already given in the session remains valid; do not ask again.

Respect the user's chosen workflow. Do not invoke repository-local devx or
devx-batch unless the user explicitly names that skill in the current request.
Create a product goal only when explicitly requested.

## Carry the agreed decisions

Keep a compact Outcome / Done / Don't anchor, with exact structure, vocabulary,
ownership, mappings, behavior, and approved diagrams when these carry material
decisions. Preserve relevant corrections, rejected models, and intentionally
delegated choices. Reuse an existing discussion contract; do not invent
optional sections. Scope a retraction to what the user actually withdrew.
For a misrouted instruction, reconcile only its affected decisions and
dependent edits while the original task remains authorized. If the user
cancels the original objective, stop and follow their instructions for
existing edits. Preserve unrelated work.

Before issue or PR publication, check both that all material decisions are
represented and that no new outcome, deliverable, or boundary relaxation has
been introduced. Routine implementation choices and necessary regression
repairs within scope do not require a separate "contract delta."

When the outcome or scope must change, describe the specific change and seek
only the missing authorization. Record material approved changes and their
reason where the repository keeps scope. Do not turn review suggestions into
new objectives or register unrelated follow-up issues without a request.

After compaction or handoff, recover the authoritative issue and scope changes,
then reconcile the current diff and remaining work. Read PR state when it is
relevant. Preserve completed work and unaffected decisions.

## Establish the issue and workspace

Read applicable AGENTS.md and the repository's issue, branch, verification, and
contribution procedures. Load architecture documentation for the affected
responsibility, not every document in the repository.

Inspect branch, remotes, worktrees, dirty state, and the owning issue or PR.
Preserve unrelated user and agent work. Resolve ownership from evidence;
failed lookups do not justify guessing a branch, account, or issue.

Reuse the issue that owns the agreed objective, or create one using repository
rules. Use one causal objective per issue and PR unless the repository specifies
otherwise. Split only genuinely independent outcomes. Record the scope and
planned validation in the issue; add a separate working-plan comment only when
it contributes information beyond the body.

Read back a created or changed issue to verify the stored scope and links.
Repair serialization loss before implementing dependent work.

Create the required linked branch or worktree from the authoritative base.
Fetch the relevant remote immediately before creation and verify the actual
starting commit. A clean isolated worktree can start from the fetched remote
tip without checking out or pulling a dirty local base. Preserve that dirty
checkout. If repository rules require a local base update, follow them and
report any actual conflict; do not merge or reset someone else's base.

Use the current worktree's lockfiles and repository bootstrap procedure.

## Implement and verify

Trace the producing mechanism, then make changes that close Done or preserve
the agreed invariants. Use a specialized skill only when its actual capability
helps this task. Do not run a ritual sequence of audits.

Before adding a module, wrapper, or local implementation, locate the existing
owner and API for that responsibility. Consume it directly or extend that
owner when its responsibility covers the case. Introduce a new ownership
boundary only when no appropriate owner exists, not merely to rename or forward
an API. Internal decomposition by change reason can retain the existing owner
and public contract. Similar-looking code with different responsibilities need
not share an owner.

Keep the solution proportional to the problem. Preserve responsibility and
ownership boundaries, and make degraded or unavailable states observable.
Inspect nearby occurrences of the same regression inside the agreed scope;
a local fix does not authorize a repository-wide cleanup.

Derive validation from acceptance, risk, and the changed dependency surface.
Complete repository-required checks and targeted behavior verification.
Add a regression test when it demonstrates the defect or protects a meaningful
invariant. Do not add tests that merely mirror a low-impact edit, repeat passed
checks without new evidence, or broaden testing after the completion bar is met.

For frontend changes, exercise the actual route and interaction using the
repository's preview contract and the user's browser preferences. Compare
against design SSOT when applicable. A Story, screenshot, or typecheck alone
does not establish that the product path works.

If a required check is unavailable, record the reason and the best available
evidence without relabeling it as a pass. If the user reproduces the original
symptom, treat acceptance as failed until evidence establishes a different
cause or scope.

Inspect the final diff for omissions, introduced regressions, and unrelated
changes. Remove only this task's unjustified edits.

## Progress and PR

Comment at meaningful milestones: a changed plan or blocker, verified behavior,
a material decision, and PR creation. Keep stable scope in its authoritative
location; report current evidence and remaining work without copying the whole
contract each time. Follow repository language and artifact conventions.

Before commit and push, use the repository's preflight and commit-message rules.
Inspect remote state, divergence, conflicts, and required checks. Do not bypass
guards or force-push shared history without authority.

Open the PR with the owning issue link, the actual resulting behavior, and
executed or unavailable verification. Read back its stored body, issue linkage,
diff, and relevant check state. Confirm that each acceptance condition has
implementation or evidence, and that each changed surface belongs to scope.

For frontend work, use show-me when available and applicable. Verify that the
local worktree HEAD matches the PR head. Put the PR URL and verified or
shown-unverified local URL together in the user handoff. The ephemeral local
preview does not belong in shared GitHub artifacts.

The default endpoint is pr-open. Report the issue, PR, branch or worktree,
verification, preview when relevant, and material remaining work.

## Handoff after PR creation

For existing-PR readiness, CI or review response, and authorized landing, use
[merge](../merge/SKILL.md) when available. Carry forward the exact PR, agreed
scope, verified revision, evidence, and existing authorization. If merge is
already authorized for this change, continue through that handoff in the same task;
otherwise pr-open remains the endpoint.

Use [main](../main/SKILL.md) when cleanup or return-to-base is requested. If either
skill is unavailable, follow the repository's procedure within the same
authorization. Report the actual outcome and any unavailable stage explicitly.
