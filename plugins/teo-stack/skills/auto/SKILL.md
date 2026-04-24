---
name: auto
description: 자율 파이프라인 트리거. /discuss로 문제를 구조화하고 /team으로 편성한 뒤 자율 실행한다. "/auto", "끝까지 알아서", "파이프라인 자동", "무인 실행" 등을 말할 때 사용.
---

## 역할

`/auto`는 **문제 구조화 → 팀 편성 → 자율 실행**의 3단 오케스트레이터다. `/discuss`와 `/team`을 재료로 삼아 완주한다.

```
Step 1. /discuss — 이해도 12요소를 채워 FRT 게이트 통과
Step 2. /team    — 필수 3역할 + 페르소나 + 커뮤니케이션 프로토콜 편성
Step 3. 자율 실행 — TaskCreate + Agent 디스패치로 완주
```

## 판단 원칙

- **Best Practice가 있으면 그대로 따른다.**
- **사실상 표준(de facto)이 있으면 그대로 따른다.**
- **모르겠으면 `/conflict` 를 호출한다.** 사용자에게 묻지 않는다.

## Step 1. /discuss

사용자 요청을 받아 `/discuss`를 호출한다. 12요소 이해도가 충분히 🟢이 되고 FRT 게이트를 통과할 때까지 진행.

- 이미 대화에 discuss 산출물이 있으면 skip, 부족하면 이어서 채운다
- 전제·제약·기각 대안이 드러나야 다음으로

## Step 2. /team

해결책이 잡히면 `/team`을 호출하여 편성한다.

- 필수 3역할(계획/실행/평가) + 과제 특화 페르소나
- 팀 내 커뮤니케이션 프로토콜까지 정의

## Step 3. 자율 실행

편성표를 TaskCreate로 올리고 Agent 디스패치로 완주한다. 각 에이전트는 Best Practice·de facto를 따른다.

- 구현 중 모호해지면 `/conflict` 로 돌파, 사용자 질문 금지
- verify(typecheck/lint/test) 통과 후에만 commit/push
- PR 생성까지 자율, merge는 사용자 승인

## 재귀 가드

같은 iteration이 8회를 넘거나 `/conflict` 가 2회 이상 연속 등장하면 멈추고 사용자에게 현재 상태를 보고한다.

## 제약

- 사용자가 명시적으로 `/auto` 를 호출할 때만 진입. AI가 자율 판단으로 먼저 띄우지 않는다
- 파괴적 작업(main force-push, admin merge 등)은 명시 승인 필요
