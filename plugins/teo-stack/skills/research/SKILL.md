---
name: research
description: Research external standards, best practices, de-facto adoption, and frontier experiments by reading sources and synthesizing either the direction an ecosystem is converging or how a local option compares with external reference points. Use for research, 리서치, 조사, 생태계 수렴, 수렴 방향, 어디로 가고 있어, 요즘 흐름, standard, best practice, de facto, frontier, reference, 레퍼런스, 비교 사례, /research, or /reference. Use convergence mode when the user wants direction only; do not turn it into a recommendation or solution unless they ask for local comparison or adoption judgment.
---

# Research

Read external sources for the user and turn them into a calibrated view of the
field. Do not return a search log or a naked link list.

## Choose one output mode

Select the narrowest mode from the user's wording and decision need.

### Convergence mode

Use when the user asks where an ecosystem is heading, what independently
evolved approaches are becoming alike, or whether a direction is stable.

Answer only:

- the direction of movement;
- the selection pressures producing it;
- the independent signals that support it;
- whether it is `stable`, `emerging`, `contested`, or `absent`;
- counter-signals and what would falsify the synthesis; and
- important unknowns.

Do not compare against the local project, recommend adoption, create an
objective, or propose a solution unless the user asks. A direction is evidence,
not a command.

### Reference mode

Use when the user asks how a local design, API, workflow, or proposal compares
with external reference points or wants an adoption judgment.

In addition to the external evidence:

- inspect the local target and its constraints before searching;
- identify its implementation form and closest peer set;
- compare its problem, constraints, and solution shape with those peers;
- describe proximity as `close`, `adjacent`, `different`, or `unknown`; and
- separate alignment, deliberate departure, and unresolved difference.

Recommendations belong only in this mode and remain subordinate to confirmed
user intent and local rules.

If the request mixes both modes, present convergence first, then a clearly
separated local comparison. Do not silently turn the first into the second.

## Lock the right peer set

Compare the same form before the same topic. A skill's primary peers are other
skills and reusable agent instructions, not every article about its subject. A
library API's primary peers are comparable APIs and official migration guides,
not general architecture essays.

Before searching, state the narrow research question and identify:

- the target form;
- the primary peer set;
- adjacent peers used only when primary evidence is weak; and
- broad background that must not carry the central claim.

For reference mode, discover these from the local artifact instead of asking
the user when files, docs, history, or code can settle them.

## Separate evidence layers

Keep these labels distinct throughout the synthesis:

| Layer | Meaning | Strong sources |
|---|---|---|
| `standard` | normative contract or specification | standards bodies, specifications, official API contracts |
| `bp` | maintained recommended practice | official guides, maintainers, reference implementations |
| `de-facto` | repeated ecosystem adoption | several independent major implementations, migration patterns |
| `frontier` | plausible but unsettled movement | proposals, experiments, recent issue discussions |

One vendor statement cannot establish de-facto convergence. Several sources
repeating each other are not independent signals. Recency alone does not make
an experiment a frontier direction.

Prefer primary and official sources. Use secondary sources to discover primary
material or to establish broad adoption when primary evidence cannot show it.
For current or unstable claims, search the web and include dates where they
change the interpretation.

## Read sources, not snippets

For each source used in a central claim, extract:

- what it actually establishes;
- which evidence layer it belongs to;
- how independent it is from the other signals; and
- its limitation, selection bias, or incompatible context.

Do not cite a source you did not read. Keep quotations short; normally
paraphrase and link the source next to the supported claim.

## Synthesize a direction

Do not call a collection of alternatives convergence. A direction exists only
when independently evolved approaches become more alike under identifiable
selection pressures.

Classify the result:

- `stable`: standards, maintained guidance, and repeated adoption reinforce the
  same direction over time;
- `emerging`: independent experiments are moving together but the durable form
  is not settled;
- `contested`: credible approaches optimize for incompatible pressures and no
  dominant direction survives context changes;
- `absent`: evidence shows variety, isolated proposals, or too little movement
  to infer a direction.

Any classification is a valid result. Do not prolong research to manufacture a
trend.

## Present what the user needs to judge

Lead with a one-sentence synthesis. Then explain the movement and why it is
happening in short prose. Use a compact table or diagram only when it clarifies
several exact comparisons or causal relationships.

For convergence mode, use this semantic shape without forcing fixed headings:

```text
direction
├─ selection pressures
├─ independent stable signals
├─ moving or frontier signals
├─ counter-signals
└─ stability and falsifier
```

For reference mode, add:

```text
local target
├─ closest reference point and proximity
├─ shared problem and constraints
├─ meaningful differences
└─ adoption judgment or deliberate departure
```

Give enough source interpretation that the user does not need to open every
link to understand the judgment. Still provide direct links so they can verify
it.

## Relation to discuss

`research` supplies external evidence to `discuss`.

- Findings from either mode may ground External evidence.
- Convergence mode may ground Ecosystem convergence.
- Convergence mode must not fill Objective or Solution by itself.
- Reference-mode recommendations may inform a Solution only after the local
  Problem, Cause, and Constraints are grounded.

## Stop conditions

Stop and report bounded uncertainty when:

- primary peers cannot be identified;
- sources do not establish independent signals;
- current claims cannot be verified;
- evidence belongs to incompatible contexts; or
- the field is genuinely contested or absent.

Do not hide these states behind a confident recommendation.
