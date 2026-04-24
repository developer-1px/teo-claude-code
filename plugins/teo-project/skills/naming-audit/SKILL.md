---
description: 네이밍 일관성(consistency)과 적합성(aptness) 감사. 동의어 드리프트, 형식 불일치, 패턴 과적, 역할 분산을 감지한다. "/naming-audit", "이름 점검", "네이밍 확인" 등을 말할 때 사용. /go의 Verify phase에서 자동 호출된다.
---

# Naming Audit

Two axes: **consistency** (same concept = same word) and **aptness** (the word accurately describes what it does). Consistency catches drift between words. Aptness catches drift within a single word — one prefix doing too many jobs.

## The Audit Process

### Step 0: Check for dictionary cache

Check if `.claude/naming-dictionary.md` exists.

- **If exists**: Read it, extract `last_commit` from frontmatter. Run `git merge-base --is-ancestor {last_commit} HEAD` to verify it's still valid.
  - **If valid**: Go to **Step 1a (incremental mode)**.
  - **If invalid** (force push, rebase, etc.): Go to **Step 1b (full mode)**.
- **If not exists**: Go to **Step 1b (full mode)**.

### Step 1a: Incremental mode (dictionary exists)

1. Run `git diff {last_commit}..HEAD --name-only -- 'src/'` to get changed files.
2. If no src/ files changed → report "No naming changes since last audit" and **stop**.
3. Run `npx tsx scripts/collectDiffSymbols.ts {last_commit}` to collect all identifiers from changed files.
4. Compare new/modified/deleted identifiers against the dictionary.
5. Go to **Step 3** with scope limited to the delta.
6. After reporting, go to **Step 5** (update dictionary).

### Step 1b: Full mode (no dictionary)

Run `npx tsx scripts/namingReport.ts` to collect all exported identifiers and type orbit from `src/`.

### Step 2: Build the Key Pool

From the script output, group fragments into:

- **Verbs** (prefix position): `create`, `get`, `find`, `set`, `make`, `use`, ...
- **Nouns** (any position): `store`, `entity`, `command`, `node`, ...
- **Adjectives** (modifier position): `normalized`, `visible`, `editable`, ...
- **Postfixes** (suffix position): `Data`, `Options`, `Commands`, `Id`, ...

Build a frequency table: fragment → count → identifiers list.

### Step 3: Detect issues

Run both axes. Consistency first (mechanical), then aptness (judgment).

#### Axis 1: Consistency

**A. Synonym Drift** (different words, same concept)

Common synonym clusters:
- `create` / `build` / `make` / `new`
- `get` / `find` / `fetch` / `retrieve` / `query`
- `remove` / `delete` / `destroy` / `clear`
- `update` / `set` / `modify` / `change` / `patch`
- `children` / `items` / `nodes` / `entries`
- `callback` / `handler` / `listener` / `hook`
- `opts` / `options` / `config` / `settings` / `params`

If a synonym pair exists, check whether the distinction is intentional (different layers/roles) or accidental drift.

**B. Format Mismatch** (same words, different format in the same layer)

Cross-boundary conventions (file=kebab, export=Pascal) are normal — NOT an error.

#### Axis 2: Aptness

This axis catches patterns that are consistent but **semantically overloaded** — one word quietly doing multiple jobs.

**C. Pattern Overloading** (same prefix/postfix, different roles)

For every fragment with **count ≥ 5**, ask: "Do all these identifiers use this word to mean the same thing?"

Procedure for each high-frequency fragment:

1. List all identifiers using this fragment
2. For each identifier, determine its **role** — what kind of work does this function/type actually do?
3. Cluster by role. If 2+ distinct roles emerge, flag it.

Example — `get` (19 identifiers):

| Role | Identifiers | Description |
|------|-------------|-------------|
| lookup | `getEntity`, `getChildren`, `getParent` | id → record, O(1) |
| traverse | `getVisibleNodes`, `getRootAncestor` | walk tree, filter/collect |
| derive | `getNodeClassName`, `getSectionClassName` | compute string from inputs |
| extract | `getEditableFields`, `getRowMetadata` | pick subset from object |

4 roles under one verb → flag as overloaded. Recommend role-specific verbs.

**D. Return Type Variance** (mechanical signal for C)

This is the 초벌구이 — a mechanical heuristic that surfaces candidates for human judgment.

`npx tsx scripts/namingReport.ts` outputs a **Return Type Variance** section that groups exported functions by verb prefix and shows their return types. Use this data directly:

- **HIGH** (3+ distinct return types) → strong signal for role overloading. Investigate with C.
- **MEDIUM** (2 return types) → weak signal. Check if the difference is meaningful.
- **LOW** (1 return type) → uniform. No overloading concern.

**Known false positives to skip:**
- `use` (React hooks) — each hook returns its own type by design. HIGH variance is expected.
- `create` (factories) — each factory creates a different thing. HIGH variance is expected.
- `make` (fixtures) — demo data factories always return the same data type. LOW is expected.

Focus on verbs where HIGH variance is **surprising** — e.g., `get` returning Entity, string, string[], object means it's doing fundamentally different work under one name.

**E. Postfix Role Confusion**

For high-frequency postfixes (`Options`, `Data`, `Config`, `Props`), check whether the postfix has a consistent meaning:

- `Options` → all fields optional? Or does it include required fields?
- `Data` → does removing the suffix change the meaning? If not, it's noise.
- `Config` → set once and immutable? Or mutated at runtime?

If a postfix spans two meanings, recommend a rule to disambiguate.

### Step 4: Report

```
## Naming Audit Report

### Mode
{Incremental (N files changed since {last_commit}) | Full scan}

### Key Pool Summary
- Verbs: N unique (top 5 by frequency: ...)
- Nouns: N unique (top 5: ...)
- Postfixes: N unique (top 5: ...)
- Total identifiers scanned: N

### Axis 1: Consistency

#### Synonym Drift
1. **create vs build** — `createStore` (core), `buildChart` (ui) — recommend: standardize on `create`

#### Format Mismatch
(none found — or list)

### Axis 2: Aptness

#### Pattern Overloading
1. **get** (19 identifiers, 4 roles) — lookup / traverse / derive / extract
   - lookup: getEntity, getChildren, getParent ✓ (keep as `get`)
   - traverse: getVisibleNodes, getRootAncestor → consider `find` or `resolve`
   - derive: getNodeClassName → consider keeping (React convention) or `derive`
   - extract: getEditableFields → consider `extract` or keep as `get`

#### Return Type Variance
1. **get** — returns Entity, string, Entity[], boolean → high variance (confirms overloading above)

#### Postfix Role Confusion
1. **Options** — BehaviorContextOptions (all optional ✓) vs UseAriaOptions (has required `data` field ✗)
   - Recommend: required fields present → use `Props`; all optional → use `Options`

### Verdict
{Consistency: CLEAN/N issues | Aptness: N patterns flagged for review}
```

### Step 5: Update dictionary

Update `.claude/naming-dictionary.md` with the enhanced format:

```markdown
---
last_commit: {HEAD hash}
last_updated: {YYYY-MM-DD}
---

## Verbs
| fragment | count | roles | identifiers |
|----------|-------|-------|-------------|
| create | 15 | factory | createStore, createCommandEngine, ... |
| get | 19 | lookup: getEntity, getChildren; traverse: getVisibleNodes; derive: getNodeClassName; extract: getEditableFields |

## Nouns
| fragment | count | identifiers |
|----------|-------|-------------|
| store | 13 | createStore, NormalizedData, ... |

## Postfixes
| fragment | count | rule | identifiers |
|----------|-------|------|-------------|
| Commands | 12 | Record<string, CommandFactory> | focusCommands, selectionCommands, ... |
| Options | 12 | all-optional config | BehaviorContextOptions, ... |
| Data | 42 | fixture suffix OK, type suffix = noise | makeTreeGridData (OK), NormalizedData (noise) |

## Synonym Map
| canonical | known synonyms | notes |
|-----------|---------------|-------|
| create | — | sole factory verb |
| make | — | fixture/demo data only |
| get | find (search context) | get=lookup, find=search/traverse — boundary defined |

## Role Map
| fragment | role | verb | examples |
|----------|------|------|----------|
| get | lookup (id → record) | get | getEntity, getChildren |
| get | traverse (walk + filter) | find | getVisibleNodes → findVisibleNodes |
| get | derive (compute string) | get (React convention) | getNodeClassName |
| get | extract (pick subset) | get or extract | getEditableFields |
```

## Guidelines

- **Standard terminology wins.** ARIA roles, DOM API, React API names are never flagged.
- **Cross-boundary conventions are normal.** Files=kebab, exports=PascalCase/camelCase, constants=SCREAMING_SNAKE.
- **Focus on the delta.** In incremental mode, only report issues in changed identifiers.
- **Threshold for aptness: count ≥ 5.** Below that, a pattern hasn't repeated enough to warrant role analysis.
- **Return type variance is a signal, not a verdict.** Always verify with role analysis before recommending changes.
- **Don't over-flag.** A healthy codebase has a few overloaded patterns — flag only when the overloading actively causes confusion (e.g., new contributors would choose the wrong verb).
