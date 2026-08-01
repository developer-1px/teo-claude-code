# FRT Gate

Use this reference when a `discuss` conversation is close to execution. The gate is structural: rows with weak evidence do not pass because they sound plausible.

## Side-Effect Questioning

Before the gate, question each proposed solution:

1. Blast radius: Which modules, features, or workflows does it touch?
2. Hidden assumptions: What must remain true for the solution to work?
3. Rollback cost: What happens if the solution is wrong?

## Obstacle Questioning

List prerequisites before execution:

1. Prior work that must happen first.
2. Technical APIs, libraries, infrastructure, or permissions required.
3. Knowledge gaps still blocking implementation.

## Required Gate Table

```markdown
| # | 검증 | 주장 | 증거 (파일·라인·규약명·코드) | 반증 조건 | 판정 |
|---|---|---|---|---|---|
| 1 | ⑪→⑤ 해소 | 해결이 문제를 직접 제거한다 | ... | ...가 관찰되면 틀림 | ⬜ |
| 2 | ⑪→⑥ 원인 제거 | 근본 원인이 제거된다 | ... | ... | ⬜ |
| 3 | ⑪→⑦ 제약 준수 | 제약 전체를 지킨다 | 제약 1 ✓, 제약 2 ✓ | 제약 위반 1건 이상 | ⬜ |
| 4 | ⑪→⑧ 자산 활용 | 보유 자산을 재사용한다 | 재사용: ... / 신규: ... (이유: ...) | 기존 자산 검토 없이 신규 생성 | ⬜ |
| 5 | ⑪→⑫ 부작용 수용 | 부작용이 원문제보다 작다 | 부작용 A, B / 비교: ... | 부작용이 원문제보다 커짐 | ⬜ |
| 6 | ⑨ 기각 대안 | 다른 길이 검토됐다 | 기각: ... (이유: ...) | 기각 대안이 현재 제약을 더 잘 만족 | ⬜ |
```

## Automatic Failure Rules

- Evidence containing `적절히`, `필요시`, `가능한`, `없음`, `확인 필요`, `나중에`, `TBD`, or `대충` is yellow.
- Missing falsification condition is red.
- Evidence without a file path, project rule name, concrete code, concrete value, or quoted user statement is yellow.
- Zero side effects is red.
- Zero rejected alternatives is red.

## Decision

- All rows green: transition may be proposed.
- Any yellow: stop and ask the question needed to resolve the yellow row. User confirmation or explicit delegation may turn the row green only when the remaining assumption is named.
- Any red: do not transition; return to the failed row and rework.

Use this transition format:

```markdown
핵심 요소 전부 🟢, FRT 전부 🟢

FRT 게이트:

| # | 검증 | 주장 | 증거 | 반증 조건 | 판정 |
|---|---|---|---|---|---|
| 1 | ⑪→⑤ | ... | ... | ... | 🟢 |

제 판단: [다음 행동]. 이유: [프로젝트 규약 / 정석 / 표준 / de facto / 설계 원리].
진행할까요?
```
