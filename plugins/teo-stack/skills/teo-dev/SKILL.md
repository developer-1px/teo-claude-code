---
name: teo-dev
description: "Personal software-delivery workflow for an explicit handoff from discussion to execution. Use after discussing a code change when the user says 진행해, 그렇게 하자, 해봐, 알아서 진행, 이슈 따고 진행, or otherwise asks Codex to autonomously take the agreed scope through issue setup, implementation, verification, progress comments, commits, push, and PR. Also use for an explicit follow-up request to address review or CI, merge, and clean the worktree. Do not use while discussion is still provisional, for read-only diagnosis or status, or when the user explicitly chooses another workflow."
---

# Teo Dev

Take an agreed software change to an opened PR with lightweight, evidence-driven execution. Treat merge and cleanup as a separate, explicitly authorized follow-up.

## Preserve the handoff boundary

- Treat discussion, diagnosis, and proposals as provisional until the user explicitly says to proceed.
- Interpret `진행해`, `그렇게 하자`, `해봐`, `알아서 진행`, and equivalent approval after a software discussion as the execution handoff.
- Use the preceding conversation as the scope source. Do not ask the user to repeat context already available in the thread, repository, issue, or docs.
- Reconstruct the objective, observable acceptance, in-scope and out-of-scope surfaces, constraints, and supporting evidence before mutation.
- Investigate an uncertainty before asking. Ask one question only when the answer cannot be discovered and would materially change the result.
- Do not create a product goal unless the user explicitly asks for one.
- Do not invoke `devx` from this workflow unless the user explicitly overrides this rule in the current request.

The execution handoff authorizes normal in-scope lifecycle actions through PR: issue creation or updates, project status updates, branch or worktree creation, implementation, verification, commits, push, and PR creation. It does not authorize merge by default and never broadens the agreed scope. A `mergeable` state, green check, approval, or "merge possible" verdict describes capability only; it is not an instruction, authorization, or obligation to merge.

## Lock and carry the Goal Anchor

Carry one scope contract unchanged from discussion through issue, implementation, review, and PR:

```markdown
### Goal Anchor
- Outcome: [the one user-visible or operational result]
- Done: [observable evidence that closes the original gap]
- Don't: [non-goals and invariants that must remain unchanged]
```

- Reuse the confirmed Goal Anchor from `discuss` when present. Otherwise derive it from the user's request and verified evidence before implementation.
- Treat the first locked anchor as immutable history. Only an explicit user-approved `contract delta` may change it.
- Record an approved delta as an append-only before/after note with its reason and authorization. Do not rewrite the original issue text or comment so the expansion disappears.
- Keep only user-approved deferred objectives visible and outside Done.

### Recover after context loss

- Treat context compaction, session resumption, handoff, or uncertainty about the original objective as a recovery boundary.
- Before any further mutation, reread the current working issue title and body, user-approved scope comments or contract deltas, and the current branch diff and PR state.
- Reconstruct the Goal Anchor from those authoritative sources and map the existing diff and remaining work back to it.
- Treat compacted summaries, previous plans, progress reports, and review comments as navigation aids, never as scope authority.
- If the current diff or plan does not map to the reconstructed Goal Anchor, stop and report the mismatch instead of continuing.

Map every proposed task, code change, and review finding before acting:

```text
proposal or finding
├─ directly closes Done or repairs a regression introduced by this diff
│  └─ current issue / PR
├─ is causally required to close Done or preserve Don't
│  └─ current issue / PR, with the causal chain stated
├─ changes Outcome, adds Done, or relaxes Don't
│  └─ STOP: propose a contract delta and obtain explicit user approval
└─ otherwise
   └─ leave as an observation; do not modify the current PR or create follow-up work without an explicit user request
```

Severity, reviewer preference, or a generic best practice never authorizes scope expansion by itself. A reviewer may expose a risk; they do not replace the user's scope authority. If an out-of-scope risk prevents safe merge or a required check from passing, use `blocked` or `stopped` until the user approves a contract delta or follow-up strategy.

Treat review as a lens for discovering possible smells or leaks, not as an issue, acceptance condition, or work queue. Independently reproduce and map a finding before acting. If it becomes work, do that work because verified evidence shows a Done gap, a Don't violation, or a regression introduced by the current diff—not because a reviewer requested it.

Security and privacy findings are the hard exception. Investigate every available review finding that plausibly alleges a security or privacy problem, including secret exposure, authorization or ownership bypass, cross-user or cross-tenant data exposure, and mishandling of personal data. Resolve it before merge by either closing it as a false positive with concrete evidence or removing, redesigning, or fixing the risk and verifying the result. Never defer a valid security or privacy finding until after merge. If resolving it requires a contract delta, stop for explicit user approval and keep the PR unmerged.

Each execution phase must reduce the unresolved Done conditions. If it adds an unrelated surface, acceptance condition, or migration, stop and classify it before continuing.

## Load the local contract first

1. Read every applicable `AGENTS.md`, repository instruction, architecture SSOT, and contribution rule.
2. Let repository-local rules override this personal workflow.
3. Inspect the repository, branch, remotes, dirty state, worktrees, related issues, linked branches, open PRs, labels, assignees, and visible work by other agents.
4. Preserve unrelated user or agent changes. Do not take over a foreign, stale, or ambiguous worktree by guessing.
5. Use repository-provided issue, branch, commit, PR, and cleanup skills when they apply.

Classify unavailable or conflicting state explicitly. Do not turn failed lookups into guessed ownership, a default issue, the latest branch, or a successful verification.

## Phase 1: Deliver to PR

### 1. Establish one working issue

- Reuse the agreed issue when one already owns the work.
- When landing work has no issue, create one using the repository's issue-creation rules and available tools.
- Keep one causal objective and one PR in one issue. Put dependent phase tasks in comments instead of inflating the tracker with tiny issues.
- Split work only when objectives, owners, deployability, or PRs are genuinely independent.
- Mark the issue in progress using the repository's project workflow when supported.
- Do not implement an ambiguously owned or concurrently active issue. Record the ownership conflict and stop or choose another authorized item.

Before broad implementation, add a concise working-plan comment containing:

- the exact Goal Anchor;
- scope and explicit exclusions;
- a phase tree;
- planned verification;
- known risks, dependencies, blockers, and deferred objectives.

### 2. Create the correct workspace

- Follow the repository's branch and worktree policy exactly.
- Prefer an issue-linked branch when the repository requires one.
- Check current branches and worktrees before creating another copy.
- Bootstrap dependencies from the current worktree's own lockfiles. Never borrow another checkout's dependency tree.

### 3. Implement from cause to effect

- Trace the current behavior and producing mechanism before editing.
- Choose the smallest applicable personal or repository skill for a technical concern. Use specialized refactoring, naming, cohesion, doubt, design-import, browser, or document skills only when their trigger is present; do not run them as a ritual checklist.
- Treat a terse correction as evidence of an underlying rule. Check the same defect class in nearby in-scope locations instead of patching only the named line.
- Keep regression expansion inside the agreed objective. Record independent hardening or cleanup as follow-up work.
- Map each work unit to a Done condition, a Don't invariant, or an explicit necessary dependency before editing. Do not implement an unmapped unit.
- Challenge unnecessary concepts, files, flags, props, adapters, and fallback paths before adding new structure.
- Reuse an existing component or abstraction when responsibility and behavior match, not merely because the appearance is similar.
- Preserve explicit state and ownership boundaries. Make fallback, degraded, missing, stale, and unavailable states observable.
- Keep the harness lightweight: do not require fixed agent roles, a fixed step count, or local workflow artifact directories.

### 4. Keep progress externally legible

Update the issue at meaningful boundaries:

- after the initial plan is grounded;
- after a phase changes the observable state;
- when scope, ownership, or a blocker changes;
- when a non-obvious technical decision is worth retaining;
- when the PR is opened.

Do not comment on every edit. For a meaningful structural change, prefer a compact ASCII before/after tree. Put durable, non-obvious learning in a distinct note rather than burying it in a generic progress log.

Report progress using completed acceptance cases, routes, variants, scenarios, or verified behavior. Always distinguish:

- completed and evidenced;
- remaining;
- blocked or unavailable;
- deferred outside the current issue;
- approved contract deltas, normally none.

Express progress as distance remaining to the Goal Anchor, not elapsed time, file count, effort, or a guessed percentage.

### 5. Verify the real outcome

- Derive checks from acceptance and the changed dependency surface.
- Run targeted tests, typecheck, build, lint, smoke, or integration checks required by the repository and risk.
- For frontend behavior, run the actual application when feasible and inspect the real route and interaction in a browser.
- Compare screenshots, layout, route variants, data states, and interaction behavior with the design SSOT when one exists.
- Do not treat stories, fixtures, snapshots, or a green typecheck as proof of the product path when the live path can be exercised.
- Make regression fixtures reproduce the observed production-shaped event or input path. A synthetic happy-path fixture that bypasses the reported data shape does not prove Done.
- If the user demonstrates the original symptom after the work was reported complete, treat it as a failed acceptance of the same Goal Anchor until evidence proves it is a different cause or scope. Reopen or correct the owning issue instead of presenting the symptom as a new request.
- Keep previously verified design and product contracts active through follow-up diagnosis. Do not replace an exact SSOT requirement with a newly generalized proposal that obscures whether the original acceptance passed.
- If a required environment or dependency is unavailable, record the attempted command and classify verification as `unavailable`; do not substitute an easier check as success.
- Before PR, inspect the full diff, search for omissions and the same regression class, and confirm that unrelated changes are absent.
- Audit every changed file and behavior against the Goal Anchor or a stated necessary dependency. Remove only this workflow's orphaned edits; preserve unrelated pre-existing user or agent work.

### 6. Commit, push, and open the PR

- Split commits by meaningful change and follow the repository's commit-message rules.
- Before push, inspect base divergence, remote branch state, conflicts, required lock freshness, and relevant checks.
- Do not force-push shared history or bypass required checks.
- Create the PR using the repository's assignee and body conventions.
- Link the owning issue and include executed and unavailable verification.
- Add a final issue comment with the PR, completed acceptance, remaining risks, and follow-up items.

The default terminal state is `pr-open`. Stop after confirming that the PR exists and report:

- issue and project status;
- branch or worktree;
- commits and PR;
- verification evidence;
- remaining or blocked items.

Do not merge merely because the user said `진행해`, because a reviewer says the PR is mergeable, or because all checks are green. If the initial request explicitly includes merge, treat that as Phase 2 authorization.

## Phase 2: Land and clean

Enter this phase only when the user explicitly asks to merge, land, finish, or clean after PR.

1. Apply the context-recovery gate first when context was compacted, resumed, handed off, or became uncertain.
2. Refresh the PR, repository-required landing gates, base, conflicts, and formal blocking review state. Determine what is required from the local repository contract; a signal's CI, bot, or human delivery channel does not grant authority.
3. Wait only for required landing gates. Do not wait for non-required review, analysis, or advisory checks.
4. Read and address general review output only when the user explicitly requests review response or repository rules make it a blocking condition. If non-required review output is already available, do not turn it into a work queue; inspect any security or privacy allegation under the hard exception above.
5. Before editing for a finding, record its evidence and Goal Anchor mapping. Address only verified Done gaps, Don't violations, regressions introduced by the current diff, and security or privacy risks. Leave other findings as observations; do not create follow-up work unless the user asks.
6. For a contract delta, stop until the user explicitly approves it. A required subjective gate may prevent landing, but it cannot authorize scope expansion.
7. Merge only when the user has explicitly authorized merge and repository rules and required gates permit it. Mergeability is a capability, not a command. Never use an administrative bypass without explicit authority.
8. Confirm the merged state and update the issue or project status according to repository rules.
9. Use the personal `main` skill when available to remove only worktrees and branches proven merged or redundant and to fast-forward the base branch.

Finish in one explicit terminal state:

- `landed-clean`: merged, cleanup verified, base branch current;
- `pr-open`: PR exists but merge was not authorized or is still pending;
- `blocked`: an external or ownership condition prevents safe progress;
- `stopped`: scope or intent requires a user decision;
- `no-change`: the requested outcome already exists or implementation is unnecessary.

Never describe a fallback or partial terminal state as normal completion.
