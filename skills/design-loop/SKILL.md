---
name: design-loop
description: Reference-driven 2-에이전트 디자인 수렴 루프. Critic(스샷+ref만 봄, 코드 모름)이 갭을 자연어로 도출하고 Prescriber(갭+ax 카탈로그)가 코드 diff로 번역. 메인은 적용만. /improve의 추측 1칸 이동 한계를 reference 좌표 + 처방 분리로 해소. "디자인 수렴", "finder 수준으로", "/design-loop" 등을 말할 때 사용.
---

# design-loop — Reference-driven Critic/Prescriber 사이클

## 왜 이 스킬이 필요한가

`/improve`(=improve-design)의 한계: 탐지자(에이전트) + 수정자(메인) 구조에서 reference가 없고 메인이 직접 수정 → 비평의 모호함이 검증 없이 처방의 추측으로 흐름 → 사이클당 1~3 변경의 *방향 없는 1칸 이동*만 누적.

이 스킬: reference 좌표를 명시 + Prescriber 에이전트로 처방 분리 → 사이클당 갭 N개를 모두 ax diff로 한 번에 번역 → *방향 있는 N칸 점프*.

외부 근거: Anthropic Evaluator-Optimizer 패턴 + Percy baseline diff + design-lint 토큰 강제.

## 전제

- Reference 스샷이 `docs/2-areas/styles/refs/{ref}/` + `INDEX.md` 존재
- dev server 실행 중 (localhost:5173)
- claude-in-chrome MCP 연결

## ARGUMENTS

| 인자 | 필수 | 기본 | 예시 |
|------|------|------|------|
| target | O | — | `/viewer` |
| ref | O | — | `finder` |
| max_cycles | X | 3 | `5` |

## 파이프라인

```
Step 1: 현재 스샷 (claude-in-chrome)
  ↓
Step 2: Critic 디스패치 → 갭 표
  ↓
Step 3: Prescriber 디스패치 → diff 표 + 반려 표
  ↓ (반려 1+ → Step 2로)
Step 4: 메인 diff 일괄 적용 (Edit)
  ↓
Step 5: 회귀 스샷 = 다음 baseline
  ↓ (잔여 갭 0 or max_cycles → 종료)
Step 6: 보고
```

### Step 1: 현재 스샷

claude-in-chrome MCP로 `target` 라우트로 navigate → 전체 캡처 + zone별 zoom 3~5장 (sidebar, toolbar, treegrid 영역, preview 등).

저장: 임시 경로. 경로 목록을 `current_paths`로 보관.

### Step 2: Critic 에이전트 디스패치

```
Agent({
  subagent_type: "general-purpose",
  description: "Critic — design gap detector",
  prompt: <critic.md 내용 + 변수 채움>
})
```

변수:
- `{ref_paths}` = `docs/2-areas/styles/refs/{ref}/*.png` 전체
- `{index_path}` = `docs/2-areas/styles/refs/{ref}/INDEX.md`
- `{current_paths}` = Step 1 결과
- `{baseline_paths}` = 직전 사이클의 회귀 스샷 (1사이클 차에는 비움)

산출: 갭 표 + (있으면) 회귀 갭 표.

### Step 3: Prescriber 에이전트 디스패치

```
Agent({
  subagent_type: "general-purpose",
  description: "Prescriber — gap to ax diff",
  prompt: <prescriber.md 내용 + 변수 채움>
})
```

변수:
- `{gaps_markdown}` = Step 2 갭 표 그대로
- `{current_paths}` = Step 1 결과
- `{file_paths}` = 갭이 가리키는 zone에 해당하는 파일 목록 (메인이 Critic 갭에서 zone 추출 → INDEX.md zone×ax 매핑 → 파일 경로 도출)

산출: diff 표 + (있으면) 반려 표.

**반려 1건 이상 → Step 2로 복귀** (Critic에게 모호 갭만 재제시).

### Step 4: 메인이 diff 일괄 적용

Edit 도구로 diff 표의 각 행을 적용. 직관 추측 0. 변경 후 typecheck + screen-test 회귀 검증.

ax 외 값(hex/px)이 1건이라도 diff에 있으면 → Prescriber 재실행 요청 (그 행만 빼고 다시).

### Step 5: 회귀 스샷

claude-in-chrome으로 같은 zone들 재캡처. 새 스샷 = 다음 사이클의 baseline.

### Step 6: 종료 조건

- Critic 갭 0개 (Step 2에서 빈 표) → 수렴
- max_cycles 도달 → 잔여 갭 사용자 보고
- 반려 갭이 두 사이클 연속 모호 → 사용자 보고

## 보고 형식

```markdown
## design-loop 결과 — {target} ← {ref}

| 사이클 | Critic 갭 | Prescriber diff | 반려 | 적용 후 잔여 |
|------|---------|--------------|------|---------|
| 1 | 12 | 9 (반려 3) | 3 | 5 |
| 2 | 5 | 5 | 0 | 0 |

### 회귀 발생
- 없음 / [목록]

### 미해결 (있을 때만)
- ...

### Commit
- {hash} {message}
```

## 절대 규칙

- **메인은 적용만 한다.** 직관으로 ax 값 추측 금지. Prescriber diff 외 변경 금지
- **Critic은 코드를 보지 않는다.** 코드 경로·ax 축 언급 시 Critic 재실행
- **Prescriber는 ax 외 값을 출력하지 않는다.** 위반 시 그 행만 빼고 재실행
- **반려 갭은 다음 사이클까지 잔존한다.** 무시·자체 추측 처리 금지

## 첫 사이클 디버깅 팁

- Critic이 "갭 0"으로 끝나면 reference가 너무 추상적일 수 있음 → INDEX.md zone 매핑 보강
- Prescriber 반려가 80%+ → Critic 프롬프트가 너무 모호함 → heuristic 분류 강제
- diff 적용 후 회귀 → guardOsPatterns 위반 가능 → Prescriber rule 4번 참조
