---
name: cohesion
description: "Use when Codex should evaluate or propose cohesion-focused refactoring: understand responsibilities and reasons for change, find related code that should move together, and recommend independent folders or modules that increase cohesion. Triggers include $cohesion, /cohesion, Cohesion, 응집도, 응집도 기반 리팩토링, 같이 움직여야, 관련 코드 찾아, 폴더로 묶자, and requests to group code by shared responsibility rather than file size."
---

# Cohesion

## Overview

응집도 기반 리팩토링을 제안하라. 파일 크기나 줄 수보다 "같은 이유로 함께 바뀌는 코드"를 기준으로 관련 코드 군집을 찾고, 독립적인 폴더나 모듈 경계로 묶는 계획을 제시하라.

기본 동작은 읽기 중심 분석과 제안이다. 사용자가 현재 요청에서 명확히 구현을 승인한 경우에만 파일 이동, import 수정, 구조 변경을 수행하라.

## Workflow

### 1. 범위 확인

분석 대상이 명확하면 그 범위 안에서 시작하라. 대상이 모호하면 먼저 read-only 탐색으로 후보 영역을 좁히고, 수정 전에는 의도한 범위와 접근을 사용자에게 확인하라.

다음을 짧게 정리하라.

- 이해한 리팩토링 의도
- 관련 기존 패턴과 제약
- 살펴볼 파일, 폴더, 런타임 경로
- 제안 또는 구현 접근
- 검증 계획

### 2. 함께 움직이는 코드 찾기

`rg`, `rg --files`, import/export 검색, 테스트/스토리/문서 검색, 필요하면 git history를 사용하라. 다음 신호를 우선하라.

- 같은 사용자 흐름, 도메인 개념, 상태 생명주기를 다루는 코드
- 한 변경에서 같이 수정될 가능성이 높은 component, hook, util, style, test, story, docs
- 항상 함께 import/export 되거나 같은 public API 뒤에 숨어야 하는 코드
- 서로의 내부 세부사항을 많이 알고 있어 분리 비용보다 결합 비용이 큰 코드
- 이름만 비슷한 것이 아니라 책임과 변경 이유가 실제로 겹치는 코드

필요하면 `git log --name-only`, `git log --follow`, `git grep`류의 증거를 보조 자료로 사용하라. git history가 없거나 약하면 현재 구조와 호출 관계를 근거로 명시하라.

### 3. 군집 정의

각 후보 군집마다 다음을 판단하라.

- 책임: 이 군집이 독립적으로 맡는 일
- 구성: 현재 흩어져 있는 파일과 역할
- 근거: 왜 함께 이동해야 하는지
- 경계: 외부에 노출할 public entry와 숨겨야 할 내부 파일
- 의존성: 이동 후에도 남는 외부 의존과 순환 위험
- 검증: 어떤 테스트, 빌드, UI 확인이 필요한지

군집이 너무 넓거나, 이름만 비슷하거나, 이동 후 의존성이 더 복잡해지면 보류하라. 응집도를 높이는 이동은 가까이 둔 코드의 변경 이유를 더 선명하게 만들어야 한다.

### 4. 제안 형식

제안은 바로 적용 가능한 수준으로 구체화하되 과도하게 장황하게 쓰지 말라.

권장 형식:

```text
Intent
- 어떤 응집도 문제를 풀려는지

Current Signals
- 함께 움직인다고 판단한 근거

Candidate Groups
- 그룹명: 책임, 현재 파일, 제안 위치, 공개 경계

Move Plan
- 작은 단계로 나눈 파일 이동과 import 수정 순서

Risks
- 순환 의존, public API 변화, 테스트 공백, UI 영향

Verification
- 실행할 명령과 화면 확인 계획
```

사용자가 구현까지 요청하지 않았다면 여기서 멈추고 승인 여부를 확인하라.

### 5. 승인 후 구현

승인된 범위 안에서만 이동하라. 기존 아키텍처, 네이밍, barrel export, 테스트 배치, 스타일 배치 관례를 우선하라.

- 파일 이동은 작은 단위로 진행하라.
- 코드와 함께 테스트, 스토리, 스타일, 문서도 같은 책임이면 함께 이동하라.
- 기존 public API를 보존할 수 있으면 보존하라.
- 새 index, facade, abstraction은 기존 패턴이 있거나 복잡도를 실제로 낮출 때만 추가하라.
- unrelated cleanup, 포맷 churn, 새 의존성, generator 도입은 별도 승인 없이 하지 말라.

### 6. 검증과 보고

리팩토링 후에는 영향을 받은 영역에 맞는 검증을 실행하라. TypeScript, lint, unit test, build, UI preview 중 의미 있는 조합을 선택하고, UI 변화가 있으면 렌더링된 화면도 확인하라.

최종 응답에는 다음만 간결하게 포함하라.

- 묶은 응집도 단위와 이유
- 변경한 주요 파일 또는 제안한 이동 구조
- 실행한 검증과 결과
- 남은 리스크나 후속으로 보면 좋은 군집

## Heuristics

좋은 응집도 폴더는 내부 파일들이 같은 변경 이유를 공유하고, 외부에는 작고 안정적인 entry를 제공한다. 폴더 이름은 구현 방식보다 책임이나 사용자/도메인 개념을 드러내야 한다.

나쁜 이동은 단지 파일을 가까이 놓을 뿐 의존 방향을 흐리게 만든다. 공통 util, 전역 style, 범용 primitive, 여러 기능이 함께 쓰는 shared behavior는 특정 군집으로 성급히 끌어들이지 말라.
