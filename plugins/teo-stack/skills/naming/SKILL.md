---
name: naming
description: Evaluate and improve names in code, APIs, files, folders, UI semantics, domain models, and documentation. Use when the user asks for naming review, rename/refactor naming, standard/de-facto terminology such as W3C ARIA/RFC/HTTP/HTML/CSS/DOM names, consistency rules, ambiguous names, responsibility-aligned names, concept reduction, 같은 이름 다른 의미, 다른 이름 같은 의미, 이름 기준표, or 이름 변경.
---

# Naming

Use objective naming evidence before proposing renames. Prefer names that are stable, standard, responsibility-aligned, and reduce the number of concepts a reader must carry.

## Priority

Apply this order. Do not prefer a lower rule over a higher rule without explaining why.

1. **Normative standard name**: Use exact terms from stable standards when the code models that concept: W3C ARIA roles/states/properties, RFC terms, HTTP methods/status/header names, HTML/CSS/DOM/Web API names, ISO/IANA names, language/runtime official terms.
2. **Stable platform or framework name**: Use official names from the platform, framework, or library already used by the repo.
3. **De-facto domain name**: Use the term most practitioners would recognize when no formal standard exists.
4. **Local ubiquitous language**: Use the repo's existing domain vocabulary when it is consistent and not misleading.
5. **Responsibility name**: Name by what the thing owns or decides, not by incidental implementation details.
6. **Short descriptive name**: Use only when no standard, de-facto, or local domain term exists.

When standards or de-facto terms are uncertain, verify against official specifications or primary docs before making a rename recommendation.

## Evaluation Table

Before renaming, produce a table. Keep it compact.

| Item | Current name | Responsibility | Standard/de-facto match | Evidence | Stability | Consistency | Ambiguity | Concept reduction | Decision | Proposed name |
|---|---|---|---|---|---|---|---|---|---|---|
| File/class/function/prop | Existing name | What it actually owns/does | Exact/near/none + source term | Spec/doc/local usage/source line | High/medium/low | Fits/breaks local rule | None/same-name-different-meaning/different-name-same-meaning | Reduces/neutral/increases | Keep/rename/split/merge | New name |

Use the columns as checks:

- **Responsibility**: The name must match the reason the thing changes. If one name covers multiple responsibilities, propose split names or a smaller concept.
- **Standard/de-facto match**: Prefer exact spelling and casing conventions of the source vocabulary when practical. Do not invent synonyms for established names.
- **Evidence**: Cite the strongest available basis: normative spec section, official docs, framework docs, de-facto ecosystem usage, local domain docs, or concrete repo references. Use `none` when the recommendation is judgment-based.
- **Stability**: Prefer names unlikely to change because they come from standards, protocols, public APIs, or durable domain facts.
- **Consistency**: Check sibling names, folder patterns, exported API style, boolean prefixes, event names, command names, and nouns vs verbs.
- **Ambiguity**: Flag same name with different meanings and different names with the same meaning. Resolve by merging vocabulary or adding precise qualifiers.
- **Concept reduction**: Prefer a rename that lets multiple local concepts collapse into one standard or domain concept. Reject names that add another synonym.

## Rename Rules

- Rename only when the table shows a concrete gain: standard alignment, reduced ambiguity, clearer responsibility, or fewer concepts.
- Preserve public API names unless the user asked for a breaking rename or a migration path is provided.
- Keep casing and grammar consistent with the target ecosystem: `aria-*`, HTTP header casing conventions, TypeScript camelCase/PascalCase, React prop conventions, CLI kebab-case, database snake_case, etc.
- Use verbs for commands and side-effecting functions. Use nouns for values, entities, components, and data structures.
- Use boolean names that read as predicates: `is`, `has`, `can`, `should`, unless the repo has a stronger existing convention.
- Avoid vague containers such as `data`, `info`, `manager`, `helper`, `util`, `common`, `misc`, unless they are the established term for the responsibility.
- If the better name reveals two responsibilities, prefer splitting over finding a broader name.

## Output

For review-only requests:

1. Show the evaluation table.
2. List the concrete rename plan.
3. Note any public API or migration risk.

For implementation requests:

1. Build the evaluation table first.
2. Apply the selected renames with the smallest safe scope.
3. Update tests, docs, imports, and references.
4. Run focused verification.
