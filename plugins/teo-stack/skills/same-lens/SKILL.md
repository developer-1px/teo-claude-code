---
name: same-lens
description: Reconstruct the defect lens behind a reported or recently fixed bug, exhaustively audit every applicable occurrence, classify the population MECE, and prepare evidence-backed issue packets plus recurrence-prevention candidates without changing files or registering issues. Use for $same-lens, "같은 렌즈로 전수 조사", "이 기준으로 전체 다 봐줘", horizontal bug sweeps, checking whether the same root cause exists elsewhere, or preparing follow-up issues after a localized bug fix.
---

# Same Lens

Turn one reported occurrence into a coverage-accountable audit of the underlying
defect class. Make the user explain the bug once: recover the lens from the
active issue, diff, code, tests, logs, documents, and conversation before asking
for information that those artifacts can answer.

Stop at investigation, classification, issue preparation, and prevention
assessment. Do not modify code, configuration, tests, or documentation, and do
not create or update issues. A later explicit workflow may consume the prepared
packets.

## Preserve these meanings

- **Lens**: the violated invariant, causal mechanism, and inclusion/exclusion
  predicate that distinguish the same defect from superficial resemblance.
- **Search horizon**: the repository, workspaces, generated surfaces, external
  components, or other boundaries inspected for candidates.
- **Candidate pool**: every possible match found before applicability is judged.
- **Audit universe**: every in-scope candidate to which the lens applies.
- **Candidate ledger**: one evidence-backed disposition for every candidate.
- **Exhaustive**: the universe is explicit, every member has a disposition, the
  counts reconcile, and no member is unverified.
- **Issue packet**: an evidence bundle ready for a repository-specific issue
  creation workflow; it is not a created issue.
- **Safety rule**: a structural, automated, or procedural guardrail proposed to
  prevent recurrence.

Do not use `exhaustive`, `전수`, `all`, or an equivalent completion claim when
the search horizon is unavailable, an applicable area is excluded, the
universe cannot be enumerated, or any member remains unverified. Report the
bounded coverage and the exact blind spot instead.

## 1. Reconstruct and freeze the lens

Inspect the active evidence before searching broadly. Record:

1. the observed bad state;
2. the expected invariant;
3. the mechanism that produced the gap;
4. a positive inclusion predicate for the same defect;
5. exclusions and known counterexamples; and
6. evidence that would falsify or split the lens.

Prefer the causal mechanism over the visible symptom. Two sites with the same
error text may have different causes; two sites with different syntax may
violate the same invariant.

If multiple mechanisms remain live, inspect the cheapest distinguishing
evidence. Ask one discriminating question only when the answer belongs to the
user or cannot be discovered. Do not merge unresolved mechanisms into one lens.

## 2. Define the search horizon and universe

Start with a cheap repository-wide inventory unless the active scope names a
larger boundary. Do not narrow to the first package, platform, or implementation
that matches. Identify canonical registries, sibling implementations, adapters,
callers, consumers, tests, configuration, generated sources, and documentation
that can enumerate the responsibility.

State:

- included roots, packages, platforms, artifact types, and runtime paths;
- excluded areas with evidence-based reasons;
- the enumeration source when a canonical registry or manifest exists; and
- unavailable areas and why they cannot be inspected.

Treat artifact applicability as part of the lens. Do not infer that production,
test, Story, example, generated, or migration code is included or excluded from
its filename alone. Anchor that boundary in the governing rule, behavior, or
owner decision. When the boundary is undiscoverable and would change a
disposition or issue packet, ask one discriminating question or keep the member
`unverified`.

A glob, text query, or list of search hits is a discovery signal, not the
universe by itself.

## 3. Discover candidates through independent signals

Choose signals that can fail independently:

- exact tokens, error text, types, functions, fields, or API calls;
- structural siblings such as routes, handlers, adapters, providers, platform
  variants, registry entries, state transitions, or persistence paths;
- callers, callees, producers, consumers, aliases, and data/control flow;
- tests, fixtures, contracts, schemas, configuration, and generated mappings;
- version history, blame, related issues, and prior fixes when they reveal
  renamed or displaced occurrences.

Use more than one independent signal unless a verified canonical enumerator
defines the complete universe. Continue until new signals add no candidates or
only produce already-classified candidates. Record which signals were used and
where each one is blind.

Never treat finding one implementation as search completion. Never infer that
an absent text match proves an absent semantic occurrence.

## 4. Classify the population MECE

Use this decision tree exactly:

```text
candidate pool
├─ out of scope — exclusion reason required
└─ audit universe
   ├─ conforming — invariant is satisfied
   ├─ same defect — invariant is violated by the same causal mechanism
   ├─ accepted exception — explicit authority and rationale required
   └─ unverified — missing evidence and next verification required
```

Assign every candidate to exactly one leaf. Do not use overlapping labels such
as `likely`, `partial`, or `related` in place of a disposition. Preserve such
nuance in the evidence column.

Reconcile both equations:

```text
candidate pool = out of scope + audit universe
audit universe = conforming + same defect + accepted exception + unverified
```

Keep every candidate individually traceable. Use individual rows for the audit
universe and for any defect-bearing or ambiguous candidate. Repetitive
out-of-scope candidates may share one grouped row only when the row pins every
member by an explicit list or reproducible inventory and every member has the
same exclusion predicate. Never replace the full group with samples.

For every individual or grouped ledger row, include the location or identifier,
disposition, evidence, and lens-specific rationale. An accepted exception
without an explicit contract, rule, owner decision, or equivalent authority is
a defect, not an exception.

## 5. Partition defects into issue packets

Put each `same defect` finding into exactly one proposed packet. Combine findings
only when they share:

- the root cause;
- the invariant that the remediation must establish;
- a compatible ownership and delivery boundary; and
- completion evidence that can be reviewed independently as one outcome.

Split packets when any of those differ. State dependency edges when packets must
land in order. Do not enlarge the current issue merely because it supplied the
lens, and do not split by file count alone.

Prepare each packet with:

```markdown
### [Proposed title]
- Source bug: [issue, diff, report, or observation]
- Lens: [violated invariant and same-defect predicate]
- Evidence: [exact affected locations and observations]
- Root cause: [mechanism]
- Scope: [included work]
- Exclusions: [explicit non-goals and why]
- Done: [observable completion conditions]
- Safety-rule candidate: [guardrail and current validation state]
- Dependencies: [none or explicit edges]
- Open evidence: [none or unresolved facts]
```

Keep proposals distinguishable from user-approved decisions. Do not invent a
solution merely to make a packet look complete. If unresolved evidence changes
the issue boundary, keep the packet `not ready` and name the blocking fact.

## 6. Assess recurrence prevention

Always assess a safety rule; do not always manufacture a new mechanism. Prefer
the strongest affordable control in this order:

```text
impossible by construction
→ type or API boundary
→ static analysis or contract gate
→ regression test
→ review check
→ documented rule
```

Check whether an existing guardrail should have caught the defect. If it missed,
record whether the gap is coverage, modeling, execution, ownership, or
enforcement.

Call a safety rule `validated` only when evidence shows that it catches a known
bad case and permits a known good case or authorized exception. Otherwise label
it `proposed-unverified` and state how to validate it. Do not present written
guidance as equivalent to an enforceable guardrail.

## 7. Report the audit

Lead with the strongest coverage judgment, then use this compact order:

1. **Lens** — invariant, mechanism, predicates, and falsifier.
2. **Coverage** — search horizon, discovery signals, exclusions, blind spots,
   and reconciled counts.
3. **Candidate ledger** — one traceable disposition per candidate; compress only
   homogeneous out-of-scope groups without dropping members.
4. **Issue packets** — ready and not-ready packets, with partition rationale.
5. **Recurrence prevention** — existing guardrail gap and ranked candidate.
6. **Residual uncertainty** — exact observations that block exhaustive or
   issue-ready claims.

When the audit is exhaustive, name the exact denominator in the verdict. If a
syntactic pool is complete but semantic variants remain uninspected, say
`exhaustive for <syntactic denominator>; bounded for <semantic horizon>`. Never
let completeness of a narrower denominator imply completeness of a wider one.
When the audit is not exhaustive, say `bounded audit` and never disguise
unavailable or unverified scope as success.

If the user later asks to register issues, hand the packets to the applicable
repository-specific issue skill or workflow. Let that workflow add labels,
assignees, duplicate checks, project fields, and repository conventions without
changing the lens, evidence, scope, or completion conditions.

## Reject these shortcuts

- Stopping after representative matches.
- Reusing the symptom as the causal lens.
- Counting search hits without defining the denominator.
- Treating uninspected areas as clean.
- Hiding unknowns inside `other` or `miscellaneous`.
- Combining findings with different causes or ownership into one issue.
- Turning every observation into a follow-up issue.
- Claiming recurrence prevention from an untested rule proposal.
- Modifying files or registering issues during this skill.
