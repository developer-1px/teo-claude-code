# Execution Contract

Use this reference for a handoff whose meaning must survive issue creation,
context compaction, or another executor. The contract records decisions; it
does not introduce a separate approval workflow.

## What to preserve

State the result, completion evidence, and scope boundaries. A small task can
express these in a paragraph or a few bullets:

- Outcome: the user-visible or operational result.
- Done: observable evidence that closes the original gap.
- Don't: relevant exclusions and invariants.

Add the problem, cause, rationale, exact names, ownership, dependency direction,
mapping, structure, state transitions, or fallback policy when they determine
the solution. Preserve approved diagrams and concrete artifacts in a
meaning-equivalent form. Record material corrected premises or rejected models
when a fresh executor could otherwise repeat the rejected interpretation.

Keep deliberately delegated implementation choices open. Distinguish them from
unresolved product or scope choices that could change the result. Do not invent
headings, metrics, guardrails, deferred work, or a decision graph to fill a
template.

## Check meaning in both directions

Before handing off, check:

- Every material agreed decision has a representation in the contract.
- Every commitment in the contract traces to user intent, an adopted decision,
  or a necessary dependency of the agreed result.

A capable executor with the repository and handoff should recover the same
outcome, boundaries, owners, behavior, and completion evidence. Restore omitted
decisions; remove invented commitments. Different equivalent implementation
details are acceptable when the user left them to judgment.

Examples, analogies, assistant suggestions, and review findings do not become
scope merely because they appeared in the discussion.

## Authorization and changes

An explicit request to proceed authorizes the already agreed scope even when
the conversation did not name a Goal Anchor or produce this document.
Record the handoff and proceed; do not ask the user to approve it again unless
the reconstruction exposes a material unresolved choice or adds scope.

Preserve material scope changes with their reason and the user's authorization.
A natural-language correction or approval can supply that authorization; no
special phrase such as "contract delta" is required. Retain enough before/after
context to make the change traceable without freezing presentation errors or
forcing an append-only copy of every wording edit.

## Stable decisions and current progress

Keep stable meaning distinct from current phase, observations, active
hypotheses, blockers, and next checks. Reuse the contract after compaction or
handoff and reconcile the actual diff with it. New evidence can disprove a
mechanism without changing the authorized outcome; replan within scope when
possible and ask only when the result or constraints must change.

Use one issue for one causal objective and one PR when the repository follows
that convention. Dependent phases can stay in one issue. Split only for
independently owned or delivered outcomes; use a decision map only when real
unresolved dependencies justify it.

## Project into an issue

When issue creation is authorized, place the contract in the repository's
authoritative scope location. Follow its template without losing material
decisions, exact artifacts, or exclusions. Preserve unrelated issue content.

Check the drafted issue against the contract in both directions. After writing,
read back the stored issue and confirm that scope, links, and material artifacts
survived serialization. Correct formatting or omission within the existing
authorization; ask only when resolving the mismatch changes scope.

Repository tooling owns labels, assignees, project state, branches, and PR
mechanics. The execution workflow owns changing progress and verification.
