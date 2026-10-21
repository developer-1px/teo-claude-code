---
name: canonical-module-audit
description: "Audit or refactor duplicate responsibilities, consumer-local bypasses, and missing capabilities toward one canonical owner. Use for 정본 모듈 감사 or 같은 역할·같은 책임·같은 모듈; ordinary textual duplication alone is not an ownership audit."
---

# Canonical Module Audit

Make responsibility, not syntax, location, or consumer count, determine the
canonical module. Detect implementations that bypass, duplicate, or substitute
for their responsibility's owner and produce an evidence-backed migration to
one canonical API.

By default, investigate and report without changing files or registering
issues. Refactor only when the user explicitly authorizes implementation; that
authorization does not include merge.

For authorized refactors, apply the [code reduction criteria](../doubt/SKILL.md#code-reduction). Count owner and consumer changes together; introducing a canonical API does not justify leaving duplicate or forwarding code behind.

## Invariant

Apply this rule without a single-consumer exception:

```text
same role + same responsibility
              |
              v
       canonical module exists? ---- no ---> verify absence before proposing one
              |
             yes
              |
              v
       API supports the case? ------- no ---> extend the canonical API
              |
             yes
              |
              v
        consume the canonical API
```

A responsibility is independently identifiable when it has its own knowledge,
decision, invariant, lifecycle, external translation, or reason to change. One
current consumer does not make that responsibility Host-local.

Host and Demo code may own composition, execution order, product policy values,
permissions, copy, fixtures, layout, and concrete external-instance injection.
They must not independently own document models, schemas, commands, Intents,
selection, history, interaction lifecycles, platform translation,
serialization, projections, or reusable UI behavior.

## 1. Load the governing contract

Read applicable `AGENTS.md` and the architecture or API contract for the
responsibility under review. Load naming or other documentation only when it
affects the decision. Record the rule establishing an existing canonical owner.

## 2. Define a coverage-accountable horizon

Identify a canonical enumerator when one exists: route registry, workspace
manifest, package exports, adapter registry, plugin catalog, or generated route
tree. Include the runtime implementation closure, not just entry files.

Inspect independent signals that can reveal semantically equivalent code:

- package exports and imports;
- local functions, hooks, state machines, models, schemas, and event handlers;
- sibling routes, Hosts, Demos, adapters, connectors, and platform variants;
- callers, callees, types, tests, fixtures, documentation Usage, and source
  registration;
- history or issues when they explain an intentional prototype or displaced
  owner.

A text match is a candidate signal, not proof of equal responsibility. Do not
claim an exhaustive scan unless the denominator is explicit and every member
has a disposition. State excluded and unavailable areas.

## 3. Build responsibility passports

For each distinct responsibility, establish the following facts. Equivalent
occurrences can share this analysis while retaining individual dispositions;
do not copy the same eight-field passport for every identical caller.

| Field | Question |
|---|---|
| Role | What capability does it provide? |
| Knowledge | What model, protocol, platform, or policy does it know? |
| Decision | What choice or invariant does it own? |
| Change reason | What independent event would require it to change? |
| State/lifecycle | What state transition or lifecycle does it control? |
| Inputs/outputs | What contract crosses its boundary? |
| Current owner | Which package, app module, Host, or route contains it? |
| Canonical evidence | Which export, contract, standard, or owner decision establishes the owner? |

Compare passports, not names. Different syntax or frameworks can implement the
same role; similar-looking code can have different responsibilities. Split a
candidate when one file contains multiple passports.

## 4. Classify every candidate MECE

Use exactly one disposition per responsibility occurrence:

- **canonical consumer** — delegates the responsibility to its canonical API;
- **Host composition** — contains only an allowed Host decision or wiring;
- **duplicate implementation** — reimplements a responsibility already owned
  by a canonical module;
- **canonical API gap** — the correct module exists but lacks the capability,
  causing a local bypass;
- **missing canonical module** — an independently named responsibility has no
  ecosystem owner;
- **mislocated module** — a named module exists, but its responsibility belongs
  at another ecosystem position;
- **out of scope** — the responsibility does not meet the audit predicate, with
  a reason;
- **unverified** — evidence is insufficient, with the exact next check.

Do not accept `utils`, `helpers`, `common`, `misc`, `Etc`, anonymous route-local
code, or site-shared glue as a final owner for an identifiable package-level or
platform-level responsibility. Do not use “only used here,” “Demo code,” or
“Host-specific” as ownership evidence.

Reconcile the counts and keep every in-scope occurrence traceable to a file,
symbol, route, or registry entry. A mostly conforming Demo is still affected
when one behavioral responsibility bypasses the ecosystem; preserve that
nuance in the evidence.

## 5. Determine the canonical move

For every nonconforming occurrence, decide in this order:

1. Use an existing public API unchanged.
2. Extend the existing canonical module because its responsibility already
   covers the case.
3. Create a new named module because no existing owner has that responsibility.
4. Keep only composition or genuine product policy in the Host.

Ground the choice in the owner's contract and an actual consumer when available.
Map the requested input and behavior to that API before declaring a capability
gap. A name-search miss is not evidence of a missing owner; use the coverage
horizon and responsibility passports. An audit inspects and reports this mapping
without modifying code. In an authorized refactor, first exercise direct use in
the affected consumer unless the contract already proves it unsuitable. Extend
or create only for the specific uncovered responsibility, and preserve existing
behavior. Do not force reuse of an implementation that violates the governing
contract or create a forwarding wrapper merely to claim canonical consumption.

Choose the ecosystem position from knowledge and reason to change. Framework
lifecycle belongs to its framework integration; platform events belong to the
platform adapter; input-independent interaction meaning belongs to affordance;
domain state and commands belong to the domain/editor owner. Do not introduce a
facade that adds no invariant, translation, or policy.

Consumer count can justify migration priority, but never ownership or whether a
module exists.

## 6. Close the actual ownership contract

For an authorized refactor, completion requires one owner, the needed API, migrated in-scope consumers,
removal of displaced implementations, and verification of owner behavior and
the actual consumer path.

For a published API, update its existing documentation and compatibility
contract. Add site Usage and source registration when the repository's
ecosystem has and requires them; do not invent a documentation site or registry
for an app-internal move. A Usage with critical local reimplementation is not
evidence of canonical consumption.

Add or extend a regression guard when it catches a demonstrated recurrence
mechanism at reasonable cost. Do not create a new guard merely to complete a
checklist. Follow the repository's documentation ownership rules.

## 7. Report or refactor

For an audit, report in this order:

1. verdict with the exact denominator;
2. frozen invariant and search horizon;
3. responsibility ledger with one disposition per occurrence;
4. canonical-owner map and dependency edges;
5. issue-ready packets grouped by root responsibility and compatible owner;
6. closure checklist and recurrence guard;
7. residual uncertainty.

An issue-ready packet includes affected occurrences, current and intended
owner, root cause, scope, exclusions, completion evidence, dependencies, and
open evidence. Do not create issues during an audit unless explicitly asked.

For an authorized refactor, work from owner to consumers:

```text
canonical model/API
  -> owner tests
  -> applicable API documentation and usage
  -> consumer migration
  -> duplicate deletion
  -> affected verification and justified recurrence guard
```

Preserve behavior while changing ownership. Verify the actual consumer path in
addition to package tests. Do not declare completion while any audited
occurrence remains `unverified` or still uses displaced code.

## Relationship to neighboring skills

- Use this skill without a source bug when the question is whether
  responsibilities have one canonical owner.
- `same-lens` starts from a known defect mechanism and audits its occurrences;
  it may consume this skill's ownership invariant as its lens.
- `cohesion` decides which code changes together inside or between candidate
  modules; it does not establish ecosystem canonicality by itself.
- `naming` checks whether the chosen owner and API names reveal responsibility
  and position after the ownership decision is grounded.
