---
description: 세션 중간 이탈 시 완료분 정리 + 미완료분을 다음 세션으로 구조화 전달. 사용자가 "/handoff"를 명시적으로 입력했을 때만 실행한다. AI가 자율 판단으로 발동하지 않는다.
---

## 역할

세션 **중간 이탈의 오케스트레이터**. close가 "사이클 완료 후 닫기"라면, handoff는 "미완료 상태에서 바톤 터치".

핵심 차이:

| | /close | /handoff |
|--|--------|----------|
| 시점 | 완료 후 | 중간 이탈 |
| 초점 | 회고 + 누적 | 컨텍스트 전달 |
| 무게 | retrospect 필수 | 경량 |
| 산출물 | area, PROGRESS | handoff 문서 |

## 파이프라인 위치

```
작업 중 → "여기까지" → /handoff → [세션 종료]
                                        ↓
                          [다음 세션] → /go → handoff 파일 자동 탐지 → 이어서
```

## Step 0: 미소비 handoff 탐지

`docs/0-inbox/handoff-*.md`를 ls로 확인한다. 존재하면 사용자에게 먼저 보고:

- "미소비 handoff N건: [목록]. 이어서 처리할까요, 새 handoff 생성할까요?"
- 이어서 처리 → 해당 파일을 읽고 컨텍스트 복원, 처리 완료 시 파일 삭제
- 새 handoff 생성 → Step 1로 진행

없으면 바로 Step 1.

## Step 1: /simplify

커밋 전에 `/simplify`를 실행한다. CLAUDE.md 규칙: "커밋 전: `/simplify` 필수".

## Step 2: 커밋

uncommitted 변경이 있으면 커밋한다.

- `git status`로 확인
- 변경 있으면 → 적절한 커밋 메시지로 커밋
- 변경 없으면 → 건너뛴다

## Step 3: 세션 요약 생성

이 세션에서 한 일을 구조화한다.

1. **세션 커밋 추출** — 세션 시작 시점(대화 첫 메시지의 gitStatus)의 HEAD부터 현재 HEAD까지 `git log --oneline` 추출
2. **변경 요약** — 각 커밋의 핵심을 한 줄로
3. **관련 PRD** — 이 세션에서 참조/생성한 PRD 파일 경로

## Step 4: 남은 것 식별

미완료 작업을 구조화한다.

1. **대화에서 추출** — "남은 것", "다음에", "TODO", "아직" 등 미완료 시그널
2. **활성 PRD** — 역PRD 열이 비어있는 항목 = 미구현
3. **사용자의 명시적 언급** — "다음에 visual UI 작업" 같은 직접 지시
4. 각 항목에 **우선순위/순서 힌트** 부여 (대화 맥락에서 판단)

## Step 5: handoff 문서 생성

`docs/0-inbox/handoff-{YYYY-MM-DD}-{slug}.md` 파일을 생성한다.

### 템플릿

```markdown
# Handoff: {제목}

> {날짜} 세션에서 {한 줄 요약}

## 완료

| 커밋 | 내용 |
|------|------|
| `abc1234` | 설명 |

## 남은 것

### 즉시 (다음 세션 첫 작업)
1. [구체적 작업] — [관련 파일/PRD]

### 이후
- [항목] — [맥락]

## 컨텍스트

- **PRD**: `docs/2-areas/.../xxx-prd.md`
- **관련 memory**: [있으면]
- **주의**: [다음 세션이 알아야 할 것]

## 다음 행동 제안

`/go`로 시작하면 이 handoff를 자동으로 픽업한다.
구체적으로: [첫 번째로 해야 할 일]
```

## Step 6: memory 저장

handoff 문서의 핵심을 memory에도 저장한다 (project 타입). 다음 세션의 memory 로드 시 handoff 존재를 인지할 수 있도록.

## 수신 (새 세션에서)

SessionStart 훅(`detectHandoff.mjs`)이 미소비 handoff를 자동 탐지한다.

### 흐름

1. **훅이 미소비 handoff 목록을 출력**한다 (consumed_by frontmatter 없는 파일)
2. AI가 사용자에게 물어본다: "이 handoff를 이어할까요, 새로 시작할까요?"
3. 사용자가 선택하면 → 해당 파일의 frontmatter에 `consumed_by`와 `consumed_at`을 추가한다
4. 사용자가 새로 시작하면 → 무시하고 진행

### 소비 표기

선택된 handoff 파일의 frontmatter 맨 아래에 추가:

```yaml
consumed_by: {session_id}
consumed_at: {YYYY-MM-DD}
```

이미 `consumed_by`가 있는 파일은 훅이 필터링하므로 다른 세션에서 중복 표시되지 않는다.

### 삭제

삭제는 자동화하지 않는다. 사용자가 직접 삭제하거나 /inbox 정리 등 별도 흐름에서 처리한다.

## /go 연동

`/go`의 Step 0에서도 `docs/0-inbox/handoff-*.md` 파일을 탐지한다:

- consumed_by 없는 파일만 대상
- 1개 → 해당 handoff 기반으로 자동 진행
- 여러 개 → 날짜 순서대로 최신 우선

## 절대 규칙

- handoff 문서는 **다음 세션의 AI가 읽는 문서**다. 사람이 아니라 AI가 소비자. 구체적 파일 경로, 커밋 해시, PRD 위치를 명시한다.
- retrospect를 하지 않는다 — handoff는 경량이어야 한다.
- 대화 컨텍스트에서 추출할 수 없는 "남은 것"이 있으면 사용자에게 확인한다.
