---
name: go
description: 자율 실행 오케스트레이터. cast 편성표를 소비하여 TaskCreate + Agent 디스패치로 작업을 자율 완주한다. "/go", "실행해", "만들어줘" 등 구현 요청 시 사용.
---

## 역할

대화 컨텍스트(discussion, PRD, cast 편성표)를 바탕으로 **task를 만들고 에이전트를 디스패치**하여 자율 완주한다. 메인은 직접 코드를 쓰지 않고 오케스트레이션한다.

```
메인의 역할: 판단 + 디스패치 + 검증
에이전트의 역할: 실행 + mini-verify
```

## Step 0: 컨텍스트 탐색 → 상황 판단

대화에 이미 discussion/PRD/요청이 있으면 바로 상황 판단으로 넘어간다. **컨텍스트가 없으면**(새 세션에서 "/go"만 입력) 아래 순서로 탐색한다:

1. **활성 PRD** — `docs/1-projects/*/prds/*-prd.md` 또는 `docs/2-areas/*/prds/*-prd.md` 중 역PRD 열이 비어있는 PRD
   - 1개 → 해당 PRD 기반으로 자동 진행
   - 여러 개 → 날짜 순서대로 처리
2. **백로그** — `/backlog list`로 처리 가능한 항목
3. **uncommitted 변경** — `git status`에 작업 중인 변경
4. **모두 없으면** → 사용자에게 "뭘 할까요?" 질문

### 상황 판단

```
판단: [규모] — Phase: [선택된 phase 나열]
```

| 신호 | Phase 선택 |
|------|-----------|
| 새 파일 3개+ 또는 새 모듈/아키텍처 | Plan → Cast → Execute → Verify |
| 기존 파일 수정, 범위 명확 | Cast → Execute → Verify |
| discussion/PRD에서 이미 plan 수준 상세도 | Cast → Execute → Verify |
| PRD 없는 단순 요청 | Cast → Execute → Verify |
| 파일 1~2개, 긴장 없음 | Execute (메인 실행 + 평가 에이전트) → Verify |
| 버그 수정, 디버깅 | Debug → Verify |

## Phase: Plan

복잡한 작업일 때만 실행. `superpowers:writing-plans` 스킬을 호출한다.

## Phase: Cast

`/cast` 스킬로 편성표를 산출한다. cast가 분석하는 것:
1. **긴장 분석** — 페르소나 편성 (대립 관점이 있을 때)
2. **병렬성 분석** — 배치 분할 (독립 작업 식별)
3. **실행 모드** — 메인 단독 / 병렬 에이전트 / 실행+평가 / 대화 루프

대화에 이미 편성표가 있으면 그대로 사용한다.

## Phase: Execute

### Step 1: Task 생성

cast 편성표의 배치를 TaskCreate로 변환한다:

- **배치 편성표가 있으면** → 배치당 1 task
- **페르소나 편성표가 있으면** → 실행 단위당 1 task
- **메인 단독이면** → 전체 1 task

```
배치 B1 → TaskCreate("B1: [설명]")
배치 B2 → TaskCreate("B2: [설명]")
```

### Step 2: Agent 디스패치

task를 Agent tool로 디스패치한다.

#### 병렬 배치의 경우

독립 배치들을 **하나의 메시지에서 동시에** Agent tool을 호출한다:

```
Agent(B1 프롬프트, worktree)  ← 동시
Agent(B2 프롬프트, worktree)  ← 동시
```

#### 순차 배치의 경우

의존 관계가 있는 배치는 이전 배치 완료 후 디스패치한다.

#### 에이전트 프롬프트 필수 포함 사항

1. **작업 목록** — 구체적으로 어떤 파일의 어떤 변경
2. **패턴 예시** — 이미 완료된 파일의 before/after 코드 (있으면)
3. **프로젝트 규칙** — CLAUDE.md에서 관련 규칙 발췌
4. **mini-verify 지시** — "작업 완료 후 `pnpm typecheck` 실행하여 에러 0 확인. 에러가 있으면 수정 후 결과 보고."

#### worktree 격리

- 병렬 에이전트는 **반드시 `isolation: "worktree"`** 사용
- 단일 에이전트는 worktree 선택적

### Step 3: 결과 수집

에이전트가 돌아오면:
1. TaskUpdate로 해당 task를 completed로 변경
2. 에이전트가 보고한 변경 사항 확인
3. worktree 변경이 있으면 메인 브랜치에 병합

### Step 4: 통합 (병렬 배치일 때)

여러 worktree의 변경을 메인에 병합한다:
- 충돌이 없으면 순차 merge
- 충돌이 있으면 메인이 해결

### Step 5: Evaluate 루프 (최대 5회)

실행 에이전트 완료 후, **별도 평가 에이전트**를 디스패치하여 결과를 채점한다. 평가→수정을 최대 5라운드 반복한다.

```
round = 0
while round < 5:
  평가 에이전트 디스패치(PRD/task.md + git diff)
  if 합격:
    break
  실행 에이전트에 불합격 피드백 전달 → 재실행
  round += 1
```

#### 평가 에이전트 프롬프트 필수 포함 사항

1. **평가 기준** — PRD 또는 task.md의 체크리스트
2. **git diff** — 실행 에이전트가 변경한 내용
3. **4가지 실패 모드 탐지 지시**:
   - 했다고 거짓말 — 만들었다 하고 실제로 안 됨
   - 컨텍스트 누락 — PRD 항목 중 구현 안 된 것
   - 부정 케이스 누락 — 되면 안 되는 것이 되는 경우
   - 디자인 부재 — 기능은 되는데 시각적으로 안 함
4. **검증 방법은 자율** — 브라우저 확인, diff 대조, 스크린샷 등 에이전트가 판단
5. **합격/불합격 + 불합격 사유** 형식으로 결과 반환 지시

#### 평가 에이전트 원칙

- **코드베이스를 주지 않는다** — diff만 준다. 코드를 읽으면 관대해진다
- **cast 편성표의 평가 페르소나를 프롬프트에 반영**한다
- 합격 시 → Phase: Verify로 진행
- 5회 불합격 시 → 불합격 사유를 사용자에게 보고하고 판단을 구한다

---

PRD 없는 작업은 Execute 시작 전에 해당 서비스/레이어의 `prds/{이름}-task.md`를 작성한다.

### PRD 양방향 링크 주석

PRD가 있는 사이클에서 에이전트에게 양방향 추적 주석을 지시한다:

- **코드**: `// ② PRD파일명`
- **테스트**: `// V{n}: PRD파일명`

## Phase: Debug

버그/디버깅 작업일 때. `superpowers:systematic-debugging` 또는 `reproduce-first-debugging` 호출.

## Phase: Verify

**항상 실행.** 에이전트가 mini-verify(typecheck)를 통과했으므로, 메인은 **full verify**를 수행한다.

### Step 1: 기본 검증
- `pnpm typecheck` — TypeScript 에러 0
- `eslint` — lint 에러 0
- `vitest run` — 테스트 전체 통과
- `pnpm check:deps` — 레이어 의존 위반 0

하나라도 실패하면 → 수정 후 재검증

### Step 2: /naming-audit (1회)
- CLEAN이면 → Step 3
- 불일치 → 수정 후 Step 1 재검증

### Step 3: /simplify (1회)
- 수정 없으면 → Step 4
- 수정 발생 → Step 1 재검증

### Step 4: /screen-test (1회)
- 핵심 user journey에 대한 화면 테스트 확인/작성

### Step 5: Code Review (1회)
- `superpowers:requesting-code-review` 호출 (서브에이전트)

### Step 6: PROGRESS.md 업데이트 (있으면)

### Step 7: 커밋

## Phase: Retrospect (PRD가 있을 때만)

`/retrospect` 스킬을 호출한다:

1. **Blind 역PRD** — fresh 서브에이전트가 git diff만 보고 역PRD 생성
2. **PRD diff** — 원본과 비교, 증거 링크 기입
3. **5계층 분류** — L1~L5
4. **보고서 생성**
5. **L1 백로그 처리** — 코드 갭은 자율 수정 → Step 1 재검증
6. **L2~L5 제안**

## 종료 조건

Verify + Retrospect(해당 시) 모두 통과하면 완료.

## 절대 규칙

- Verify phase는 반드시 실행한다
- 검증 통과 후 즉시 완료 — 불필요한 이터레이션 금지
- **메인은 오케스트레이터** — 코드 작성은 에이전트에 위임 (메인 단독 모드 제외)
