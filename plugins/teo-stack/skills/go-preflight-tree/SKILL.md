---
name: go-preflight-tree
description: Use for Go/Golang implementation, bug fix, refactor, test, or review-to-fix tasks where Codex should write a concise ASCII preflight tree before changing code. Trigger when the user mentions Go, Golang, .go files, Go tests, or explicitly asks to define Goal/Do/Don't before implementation. The skill makes Codex state GOAL, DO, and DON'T in an ASCII tree, then proceed with normal codebase inspection, implementation, and verification.
---

# Go Preflight Tree

## Overview

Use this skill to make the implementation intent explicit before editing Go code. First write a short ASCII tree with `GOAL`, `DO`, and `DON'T`; then inspect the codebase, implement, and verify using the repo's normal workflow.

## Workflow

1. Before any file edit, write a concise preflight tree in the conversation.
2. Keep the tree specific to the user's request and the codebase context already known.
3. If important context is unknown, say so in `DO` as an inspection step instead of guessing.
4. After the tree, continue with normal engineering work: read relevant files, make scoped edits, run focused tests or checks, and report the result.

## Preflight Tree Format

Use this ASCII shape:

```text
<task-name>
+-- GOAL
|   `-- <the concrete outcome the user needs>
+-- DO
|   +-- <inspection or implementation action>
|   +-- <test or verification action>
|   `-- <scope boundary that should be honored>
`-- DON'T
    +-- <unrelated refactor or behavior to avoid>
    +-- <risky assumption to avoid>
    `-- <repo/user changes that must not be overwritten>
```

## Writing Rules

- Make the tree no longer than needed; usually 1 `GOAL`, 2-4 `DO` items, and 2-4 `DON'T` items.
- Prefer concrete nouns from the user's request and repo over generic planning language.
- Include testing or verification in `DO` unless the request is purely explanatory.
- Include "do not overwrite unrelated user changes" in `DON'T` when editing files.
- If the request is not actually Go-related but the user explicitly invoked this skill, still use the tree and adapt the wording to the task.

## Constraints

- Do not use the tree as a substitute for reading code.
- Do not add broad architecture plans unless the user asked for design work.
- Do not ask the user to approve the tree before proceeding unless implementation would be risky or ambiguous.
- Do not create extra files or documentation for the tree itself; it is conversation output only.
