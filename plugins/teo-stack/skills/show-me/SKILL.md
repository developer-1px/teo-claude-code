---
name: show-me
description: Open and verify frontend work from the current repository or worktree. Use for `$show-me`, “보여줘”, “확인할게”, “띄워줘”, “URL 줘”, “어디서 봐?”, before opening a local app for visual verification, or when handing off frontend work. Discover and use the repository's own preview contract, prove URL ownership, walk the changed flow in a controllable browser, and leave the result open for the user. Do not use for production deployment links or backend-only changes.
---

# Show Me

Serve the frontend from the exact worktree containing the change, prove the
local URL belongs to that worktree, inspect the changed flow, and leave the
best screen open for the user.

The skill owns discovery and verification, not a project's server lifecycle.
Never encode a named project's commands, ports, environment variables,
directory layout, or process policy in this skill. When a repository needs a
specialized launcher, discover and invoke the launcher supplied by that
repository.

## Outcome states

- `verified`: Opened the exact local app in a controllable browser, exercised
  the changed flow, and confirmed its expected outcome.
- `shown-unverified`: Opened the exact URL visibly, but the acceptance flow
  was not verified. State whether control was unavailable or an observed
  interaction failed, and what remains to inspect.
- `not-shown`: No candidate server became ready or the product route could not
  be identified after discovery or one focused user question.

## Recover task evidence

Start in the worktree containing the frontend change. Resolve its repository
root, branch, HEAD, and worktree membership. Before rediscovering anything,
reuse trustworthy evidence already produced in the current task:

- a dev server command already exercised;
- a still-running process or session owned by this worktree;
- a URL opened during browser or end-to-end verification;
- an explicit test-server command, base URL, port, or route;
- a user-provided command or URL.

Recheck that reused evidence still belongs to the current worktree and HEAD.

## Discover the preview contract

Prefer repository-owned evidence in this order:

1. Applicable `AGENTS.md` files and linked local-run guidance.
2. README, contributing, or development documentation.
3. A verified recipe in `.git/codex/show-me-recipes.json` in the Git common
   directory. Treat this as a cache, never as authority.
4. Root and changed-app manifests such as `package.json`, workspace manifests,
   `Makefile`, `justfile`, `Taskfile`, compose files, and framework config.
5. Browser-test configuration such as Playwright `webServer` or Cypress base
   URL and route tests.

Prefer the command for the app actually changed. In a monorepo, use changed
paths, route definitions, package dependencies, and test ownership instead of
starting every frontend.

Use the repository's documented launcher even when it wraps the underlying
framework. Do not bypass its setup or safety policy merely because a lower-level
command looks simpler. Do not install a new framework, invent a package script,
or edit product code just to obtain a preview.

If one candidate fails, record the concrete reason and continue discovery when
another repository-native path exists. Ask one concise question only when
multiple plausible apps remain or no safe launch contract can be discovered.

## Start or reuse the server

Use this precedence:

1. A running, worktree-owned server already verified in this task.
2. A repository-declared preview or show command.
3. A documented native root or changed-workspace development command.
4. One focused user question.

Start a new command in a persistent execution session from the exact worktree.
Follow the repository's dependency-install and worktree policy. Retain the
session so the user can keep inspecting the app.

Use the server's emitted URL. When it emits none, derive a candidate only from
verified configuration and listener state. Never assume a framework's default
port is free, kill a foreign listener, or silently attach to a server whose
worktree ownership is unknown. Use a repository-supported port override when
available; otherwise ask the user rather than changing project policy.

## Prove the URL

Before opening a browser, establish that:

- the retained session or listener process points to the current worktree;
- the HTTP server responds;
- the intended product route renders rather than only `/` or a fallback shell;
- when handing off a PR, local `HEAD` equals the remote PR head.

Use the exact proven URL, including its base path and route. Recheck ownership
before reusing a URL from an earlier turn.

## Open and verify the changed flow

Use the user's existing Chrome connection, signed-in profile, and appropriate
tab when available, following applicable browser tool or skill instructions.
A missing optional Browser or Chrome skill does not block an available tool.
If the existing connection is unavailable, report that before using a fresh
profile; do not reset login state, copy credentials, or restart the user's
browser without permission. Keep the handoff tab open.

Verify the behavior changed in the task, not merely page availability. Reuse
the acceptance scenario, tests, route, and changed controls. Inspect fresh DOM
state after interactions, use a screenshot when visual judgment matters, and
check browser errors introduced by the change.

If the flow fails, diagnose it. Correct and recheck when the active task already
authorizes the fix; a request only to show the page does not authorize product
changes. Do not call a partially working page `verified`. If browser control
is unavailable after its documented troubleshooting, open the URL visibly in
the system browser and classify the result as `shown-unverified`; do not use a
headless browser as the visible fallback.

End on the state the user should inspect and mark that tab as the deliverable.

## Retain reusable launch facts

Reuse successful browser verification from this task when HEAD, served files,
route, and runtime conditions are still the same. Recheck changed or uncertain
evidence rather than automatically repeating the entire interaction.

After a successful native launch, optionally update
`<git-common-dir>/codex/show-me-recipes.json` with only stable,
repository-relative facts such as the working directory, command, URL pattern,
route, and evidence source. Verify cached facts every time.

Do not store credentials, tokens, cookies, process IDs, user data, or a
temporary port as though it were stable. When the launch contract should be
shared with contributors, propose documenting it in the repository; modify
tracked documentation only when the task authorizes that change.

## Hand off

Lead with the outcome, exact URL, branch, and short HEAD. Then state the flow
actually verified and anything that still requires the user's visual or product
judgment.

For `shown-unverified`, distinguish unavailable browser control from a flow
that was exercised but failed or remained incomplete. State the actual gap
and shortest remaining manual path; do not describe an observed failure as
merely missing control. For `not-shown`, report the attempted commands, the
concrete blocker, and the single missing fact needed from the user.
