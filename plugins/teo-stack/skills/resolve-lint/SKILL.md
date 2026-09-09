---
name: resolve-lint
description: Reduce lint, static-analysis, guard, warning, and code-smell findings without optimizing mechanically for a clean count. Use when the user asks to resolve, fix, clean up, reduce, or make progress on lint findings (including "lint 해결", "lint 고쳐", "warning 정리", "가드 위반 수정", or threshold smells such as file length or complexity), especially when findings require judgment about responsibility, ownership, structure, or behavior rather than a deterministic syntax fix.
---

# Resolve Lint

Reduce lint findings by removing their underlying causes. A lower finding count is progress evidence, never sufficient proof of code quality.

## Keep the loop active

Work in small causal batches. Do not review every finding up front and do not create a separate ledger or report file unless the user requests one.

For a multi-batch task, keep the following working facts in an available plan
or concise progress update. Refresh them when the selected cause or approach
changes; a small mechanical fix does not need a six-field preamble.

```text
Lint command and baseline:
Selected causal batch:
Risk hypothesis:
Expected responsibility or behavior change:
Detector-gaming failure mode:
Verification:
```

The anchor is working state, not documentation. Keep each field to one or two sentences.

## Run the causal batch loop

### 1. Establish the real baseline

- Discover the repository's authoritative lint command, scoped instructions, and rule documentation before editing.
- Run the command and preserve its exit status and counts grouped by rule or finding kind.
- Separate pre-existing findings from findings introduced by the current work when the evidence permits it. Do not claim unrelated debt as part of the task.
- Classify only enough to select the first batch:
  - `contract`: the code demonstrably violates an invariant.
  - `mechanical`: a canonical, semantics-preserving correction is known.
  - `smell`: the detector identifies risk but cannot prescribe the correct structure.
  - `detector-defect`: the rule, scope, or message is inconsistent with its intended contract.
- Do not turn this classification into a full-repository review phase.

### 2. Select one causal batch

- Group findings only when the same root cause, owner, and correction boundary explain all of them.
- Prefer the smallest batch that can prove or falsify one risk hypothesis.
- Do not group findings merely because they share a rule ID or threshold.
- For a smell, inspect actual responsibilities, change reasons, consumers, data flow, and dependency direction before choosing a destination or abstraction.
- If an available specialized skill exactly matches the diagnosis, use it for the selected batch while retaining this loop as the completion contract.

### 3. State what would constitute a real fix

Before a structural correction, establish:

- the risk the finding is evidence for;
- the observable responsibility or behavior change expected from a valid fix;
- the cheapest tempting change that would merely silence or evade the detector; and
- the lint, test, typecheck, or focused inspection that will distinguish the two.

If no concrete risk hypothesis survives inspection, do not improvise a refactor. Treat the finding as retained evidence or a detector defect and continue only when another batch has a grounded cause.

### 4. Make the smallest causal change

- Change the owner, dependency, behavior, or responsibility implicated by the hypothesis.
- Preserve locality. Do not create a new file, abstraction, wrapper, facade, type, or option unless it carries a distinct responsibility required by the fix.
- Apply autofix only to a scoped mechanical batch. Inspect its diff before accepting it.
- Keep unrelated user changes intact.

For threshold findings such as physical lines, complexity, parameter count, or consumer count:

- Treat the threshold as a search trigger, not a target value.
- Split or extract only when independent reasons to change exist and the new boundary improves locality.
- A result just below the threshold is not evidence of success.

### 5. Perform the disappearance audit

After each batch:

1. Rerun the focused lint and relevant behavior verification.
2. Inspect the diff, not only command output.
3. Explain which original risk is now absent or better contained and what code evidence proves it.
4. Check whether the finding was displaced to another file, hidden behind indirection, or moved outside the scan scope.
5. Assign one batch result:
   - `resolved`: the cause changed and verification supports it.
   - `retained`: the signal remains because changing it would not improve the code; keep it visible.
   - `detector-defect`: the implementation contract and detector disagree; fix the detector only when that is in scope.
   - `blocked`: the cause cannot be resolved safely with available evidence or verification.

If the count decreased but the causal explanation fails, mark the batch `detector-evasion`, undo only the batch's own misguided changes safely, and replan. Never count it as progress.

### 6. Continue or stop deliberately

- Carry forward the latest evidence when selecting the next batch.
- Continue while another coherent in-scope batch can be resolved and verified.
- Skip or report a batch requiring guessed ownership, semantic expansion, or
  missing authority, and continue independent in-scope batches when possible.
  Distinguish required validation from optional checks; unavailable optional
  tooling alone does not prevent an otherwise evidenced fix.
- Do not keep making easy cosmetic edits merely because harder findings remain.

## Never hide the signal

Do not do any of the following merely to reduce the count:

- add or widen an ignore, suppression, allowlist, baseline, or generated-file marker;
- weaken severity, thresholds, test assertions, scan roots, or CI wiring;
- delete the rule, test, or evidence-producing code;
- move code outside the analyzed path;
- split files mechanically, rename symbols, add pass-through wrappers, or introduce aliases without changing responsibility;
- convert a visible failure into fallback, default, empty, or success behavior.

Such changes require an independently grounded reason and explicit user authority when they weaken observability or enforcement.

## Report completion

Lead with whether underlying causes were resolved, not whether the command is green. Report only:

- lint command and before/after counts;
- causal batches resolved and the responsibility or behavior evidence for each;
- focused tests or checks run;
- retained, detector-defect, blocked, unavailable, or unrelated findings still visible.

Do not claim completion when the lint is green but behavior verification failed, was unavailable, or the disappearance audit cannot explain why the original risk is gone.
