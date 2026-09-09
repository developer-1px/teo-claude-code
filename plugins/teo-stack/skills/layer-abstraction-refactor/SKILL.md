---
name: layer-abstraction-refactor
description: 이름뿐인 중간 계층과 실제 추상화 벽을 구분한다. REST·runtime·host operation 분류, 정본 client 교체, facade·provider·port·entrypoint 존속 여부, layer skipping을 판단할 때 사용한다.
---

# 레이어 추상화 리팩터링

## 저장소의 정본 경로를 먼저 확인한다

아래는 이 역할을 표현하는 C* 구성의 예시다. 현재 저장소의 문서, exports,
호출 경로로 실제 정본을 확인하고 적용한다. 다른 프로젝트에 이 라이브러리나
폴더 구성을 도입하라는 지시가 아니다.

| operation | 예시 경로 |
|---|---|
| REST resource | TanStack -> Orval operation/model -> 공통 HTTP mutator -> BE |
| runtime execution | AG-UI public interface -> Cstar transport adapter -> WS/SSE |
| host capability | 실제 browser·desktop capability adapter |

- REST를 runtime provider나 port로 감싸지 않는다.
- 정본 contract를 rename·forward만 하는 Entity API wrapper, provider port, runtime-client facade, 별도 DTO·동일 구조 mapper는 layer가 아니다.
- target architecture에 없는 폴더 이름은 layer로 취급하지 않는다.

## 교체와 내부 분리를 구분한다

- **정본 교체:** 새 정본으로 소비자를 옮기고 밀려난 내부 client·facade·provider·DTO·test·mock을 같은 변경에서 제거한다.
- **내부 분리:** 검증된 외부 public surface는 유지하고 그 뒤의 구현 책임만 나눈다.

승인된 정본 교체에서는 중복 책임을 그대로 남기는 facade를 추가하지 않는다.
실제 외부 계약을 보호하는 호환층은 전환 조건을 명시해 유지할 수 있다.
동작·정책이 있는 adapter와 단순 전달 계층을 먼저 구분한다.

## 실제 경계의 기준

중간 계층은 다음 중 하나를 관측 가능하게 수행할 때만 경계다.

- 값을 변환하거나 검증한다.
- 실패 상태를 새로 분류한다.
- 인증·소유권·routing policy를 결정한다.
- 복수의 실제 구현 중 하나를 선택한다.
- 삭제하면 caller가 새로 알아야 하는 사실이 생긴다.

해당하지 않으면 정본 contract로 직접 연결한다. 모든 cross-layer import를 entrypoint로 보내는 checker를 만들지 않고, 입증된 target layer graph만 검사한다.

`layer entrypoint`는 구현 배치를 감추고 `variability seam`은 복수 구현을 교체한다. 캡슐화와 교체 가능성을 같은 존재 이유로 취급하지 않는다.
