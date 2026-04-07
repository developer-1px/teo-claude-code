---
name: go
description: 자율 실행 오케스트레이터. 상황 판단하여 Plan → Execute → Verify를 자율 완주한다. "/go", "실행해", "만들어줘" 등 구현 요청 시 사용. discussion/prd 이후뿐 아니라 단독으로도 호출 가능.
---

## 역할

대화 컨텍스트(discussion 이해도 테이블, PRD, 사용자 요청)를 바탕으로, 필요한 superpowers phase를 판단하여 자율 완주한다. 사람 개입 없이 끝까지.

## Step 0: 컨텍스트 탐색 → 상황 판단

대화에 이미 discussion/PRD/요청이 있으면 바로 상황 판단으로 넘어간다. **컨텍스트가 없으면**(새 세션에서 "/go"만 입력) 아래 순서로 탐색한다:

1. **활성 PRD** — `docs/superpowers/prds/*-prd.md` 중 역PRD 열이 비어있는(= 아직 구현/retro 안 된) PRD를 찾는다. 역PRD가 채워져 있으면 이미 완료된 것이므로 제외.
   - 1개 → 해당 PRD 기반으로 자동 진행
   - 여러 개 → 날짜 순서대로 처리 (가장 오래된 것 먼저)
2. **백로그** — `/backlog list`로 처리 가능한 항목이 있는지
3. **uncommitted 변경** — `git status`에 작업 중인 변경이 있는지
4. **모두 없으면** → 사용자에게 "뭘 할까요?" 질문

탐색 결과를 컨텍스트로 삼아 상황 판단으로 넘어간다.

### 상황 판단

컨텍스트에서 작업 규모를 판단하고, 필요한 phase를 선택한다.

| 신호 | Phase 선택 |
|------|-----------|
| 새 파일 3개+ 또는 새 모듈/아키텍처 | Plan → Execute → Verify |
| 기존 파일 수정, 범위 명확, 단일 task | Execute → Verify |
| discussion/PRD에서 이미 plan 수준 상세도 나옴 | Execute → Verify (plan 스킵) |
| PRD 없는 단순 요청 (리팩토링, 설정 변경 등) | Execute → Verify |
| 버그 수정, 디버깅 | Debug → Verify |

판단 결과를 한 줄로 선언한다:

```
판단: [규모] — Phase: [선택된 phase 나열]
```

## Phase: Plan

복잡한 작업일 때만 실행. `superpowers:writing-plans` 스킬을 호출한다.

- 산출물: plan 파일 (프로젝트 설정에 따라 경로 결정)
- 이 파일이 Execute phase의 입력

## Phase: Cast (Execute 진입 전)

Execute에 들어가기 전에 `/cast` 스킬로 편성표를 산출한다. cast는 과제의 이해관계 축을 분석하여:

1. **페르소나 편성표** — 역할, 관점, 평가 기준, 긴장 축
2. **실행 모드** — 메인 단독 / 실행+평가 에이전트 / 서브에이전트 오케스트레이션 / 대화 루프

대화에 이미 편성표가 있으면 (사용자가 `/cast`를 먼저 실행한 경우) 그대로 사용한다.

## Phase: Execute

편성표의 실행 모드에 따라 분기한다.

### 모드 1: 메인 단독

편성표의 평가 관점을 순차 적용하며 메인이 직접 실행한다. `/do` 스킬을 호출한다.

### 모드 2: 실행 에이전트 + 메인 평가

실행을 서브에이전트에 위임하고, 메인이 편성표의 평가 기준으로 결과를 검증한다.

### 모드 3: 서브에이전트 오케스트레이션

편성표의 모든 페르소나를 서브에이전트로 띄운다. 실행 에이전트가 초안을 만들고, 평가 에이전트들이 **병렬로** 피드백한다. 메인은 오케스트레이터로서 피드백을 종합하고 수정을 지시한다.

### 모드 4: 대화 루프

서브에이전트 간 점진적 개선 루프. 실행 → 평가 → 수정 → 재평가를 반복한다. 종료 조건: 모든 평가자 통과 또는 N라운드 상한 (편성표에 명시).

---

PRD 없는 작업(discussion에서 바로 /go, 단순 요청 등)은 Execute 시작 전에 `docs/superpowers/tasks/{날짜}-{이름}-task.md`를 작성한다. 내용은 액션 플랜 수준 — 무엇을, 어떤 순서로, 어떤 파일을. plan보다 가볍고, 없으면 작업 추적이 안 되므로 필수.

### PRD 양방향 링크 주석

PRD가 있는 사이클에서 코드/테스트를 작성할 때, 양방향 추적을 위한 주석을 단다:

- **코드**: PRD ② 산출물에 명시된 export 위에 `// ② PRD파일명` 주석
- **테스트**: PRD ⑧ V-행에 대응하는 it 블록 위에 `// V{n}: PRD파일명` 주석
- PRD 파일명은 날짜+이름(예: `2026-03-24-tab-axis-prd.md`)으로 유일하므로 경로 생략

이 주석은 retrospect에서 역PRD 열의 증거 링크와 양방향 매핑된다. 모든 export/it에 다는 게 아니라, **PRD에 명시된 산출물/검증 행에 대응하는 것만** 단다.

## Phase: Debug

버그/디버깅 작업일 때. `superpowers:systematic-debugging` 또는 `reproduce-first-debugging` 호출.

## Phase: Verify

**항상 실행.** 아래 단계를 순서대로 수행한다. **각 Step은 1회만 실행** — 수정 후 Step 1 재검증은 하되, 같은 Step을 다시 진입하지 않는다.

### Step 1: 기본 검증
- `pnpm typecheck` — TypeScript 에러 0
- `eslint` — lint 에러 0
- `vitest run` — 테스트 전체 통과
- `pnpm check:deps` — 레이어 의존 위반 0 (dependency-cruiser)

하나라도 실패하면 → 수정 후 재검증

### Step 2: /naming-audit (1회)
- CLEAN이면 → Step 3으로
- 불일치 발견 → 수정 후 Step 1 재검증 → Step 3으로 (Step 2 재진입 안 함)

### Step 3: /simplify (1회)
- 수정 사항 없으면 → Step 4로
- 수정 발생 → Step 1 재검증 → Step 4로 (Step 3 재진입 안 함)

### Step 4: /screen-test — 제품 통합 테스트 승격 (1회)
- 이번 변경이 영향 주는 **핵심 user journey**를 식별한다
- 해당 journey에 대한 화면 수준 테스트(`route-*.screen.test.tsx`)가 있는지 확인한다
- 없으면 → `/screen-test` 스킬로 작성 (user input → 화면 변화 검증, 코드 구조 무관)
- 있으면 → 이번 변경으로 기존 테스트가 커버하는지 확인
- 개발 중 TDD(메커니즘 검증)와 별개 단계 — 여기서 만드는 건 요구사항 검증
- 테스트 추가 시 → Step 1 재검증

### Step 5: Code Review (1회)
- `superpowers:requesting-code-review` 호출 (서브에이전트)
- 피드백 있으면 반영 후 Step 1 재검증
- 남은 이슈가 있으면 커밋 메시지에 기록

### Step 6: PROGRESS.md 업데이트 (있으면)
- `docs/PROGRESS.md`가 존재하면 완료 항목 반영. 없으면 스킵.

### Step 7: 커밋
- 변경사항 커밋

## Phase: Retrospect (PRD가 있을 때만)

**조건:** PRD가 이번 사이클에서 사용되었으면 실행. PRD 없는 작업(단순 버그 수정, 디버깅, 리팩토링)은 스킵.

`/retrospect` 스킬을 호출한다:

1. **Blind 역PRD** — fresh 서브에이전트가 git diff만 보고 역PRD 생성 (원본 PRD 미제공)
2. **PRD diff** — 원본 PRD와 항목별 비교, 증거 링크 기입
3. **5계층 분류** — L1(코드), L2(PRD 스킬), L3(스킬), L4(지식), L5(사용자 피드백)
4. **보고서 생성**
5. **L1 백로그 처리** — 코드 갭은 자율 수정 → Verify Step 1 재검증
6. **L2~L5 제안** — 보고서에 기록, 커밋 메시지에 요약

## 종료 조건

Verify phase + Retrospect phase(해당 시)를 모두 통과하면 완료.

## 절대 규칙

- "할 일이 없다"고 판단되어도 Verify phase는 반드시 실행한다
- 검증 통과 후에는 즉시 완료한다 — 불필요한 이터레이션을 돌지 않는다
