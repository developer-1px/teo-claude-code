---
name: design-product-story-parity
description: 디자인 정본, 제품 UI, Story Page의 상태·TSX·CSS·동작을 일치시키고 fixture 경계를 판별한다. Story Page 구현·리팩토링, 디자인 import, pixel matching, Story 전용 TSX·designCase·fixture store smell, 디자인에는 있지만 제품 로직으로 도달할 수 없는 UI 상태를 다룰 때 사용한다.
---

# Design–Product–Story Parity

Story Page를 별도 전시 구현이 아니라 제품 UI를 만들고 검증하는 실행 가능한 디자인 명세로 취급한다.

## 불변 계약

다음 양방향 계약을 동시에 지킨다.

```text
디자인 정본에 있는 UI  → 반드시 제품 코드와 실제 상태 전이로 구현
디자인 정본에 없는 UI  → 제품에 자의적으로 추가하지 않음
```

- Story Page에서 검수한 제품 UI는 제품과 동일한 TSX, 그 TSX가 import하는 CSS, DOM, event, dispatch 경로를 사용한다.
- 제품 preview 렌더 트리에 Story 전용 Page·Widget·Feature·Dialog TSX를 두지 않는다.
- `.stories.tsx`와 fixture manifest는 제품 route, 외부 입력, viewport, readiness, interaction만 선언한다. 제품 UI를 조립하거나 보정하지 않는다.
- Story 전용 CSS, wrapper, `designCase`, `fixturePreview`, 가짜 store·dispatch로 제품 결과를 덮어쓰지 않는다.
- **상태라는 이유로 예외를 만들지 않는다.** `.stories.tsx`가 제품 Route·Page·Widget에 `fixture`, `preview`, `initialState`, `store` 같은 props를 전달해 렌더 상태를 선택하는 것도 최종 ViewModel 주입과 동일하게 금지한다. `fixturePreview={preview}` 같은 전달 경로를 만들지 않는다.
- 제품에서 불가능한 상태를 정상 제품 상태처럼 보이게 만들지 않는다.

Story Page 도구 자체의 selector·remote·frame 같은 devtools UI는 제품 preview 바깥이므로 이 금지 대상이 아니다.

## 먼저 일대일 원장을 만든다

수정 전에 요청된 route 또는 case family의 디자인 정본과 현재 제품 상태를
대조한다. 전체 전수를 요청한 경우에만 범위를 전체 정본으로 넓힌다.

먼저 해당 case와 가장 가까운 기존 제품 경로·사용례를 찾아 상태 입력과 렌더 소유자를 추적한다. 구현이 승인된 작업에서는 그 경로에 요청된 데이터·조작을 연결해 현재 결과를 확인한 뒤 누락을 판정한다. 기존 계약에서 불가능함이 명확하면 해당 입력·상태 전이의 근거로 판정하고 불필요한 시제품은 만들지 않는다. 실행할 수 없으면 미검증으로 남기며 로직 누락으로 단정하지 않는다. 정본 프레임·완성 블록이 있으면 그 TSX·CSS·동작을 함께 사용한다. 내부 버튼만 재사용하고 상위 프레임을 새로 만드는 것은 동일 경로 재사용이 아니다.

각 case와 제품 UI를 다음 중 하나로 분류한다.

| 분류 | 판정과 조치 |
|---|---|
| 제품에서 도달 가능 | 실제 URL, 외부 응답, runtime 상태, 사용자 interaction으로 재현한다. |
| 디자인에는 있으나 제품 로직 누락 | Story override를 만들지 말고 제품 state·event·business logic·TSX를 구현한다. |
| 제품에는 있으나 디자인 정본 누락 | 공유 디자인 계약이나 승인된 제품 요구사항을 확인한다. 근거가 없으면 불일치로 보고하고, 제거 또는 디자인 변경이 승인 범위를 넘는지 판별한다. |
| 양쪽에 있으나 결과 불일치 | 공용 제품 TSX·CSS 또는 제품 상태 판정을 정본에 맞춘다. |

현재 제품이 지원하지 않는다는 이유로 디자인 case를 Story에서 삭제하지 않는다. 반대로 검수 편의를 위해 디자인에 없는 loading, error, button, dialog를 발명하지 않는다. 운영상 새 UI가 필요하면 디자인 정본을 먼저 확정한다. 기존 공용 디자인 정본에 명시된 표면은 그 정본에 대응시킬 수 있다.

## Fixture는 실제 소유 경계에 둔다

fixture 기술을 먼저 고르지 말고 제품이 그 데이터를 어디에서 받는지 추적한다.

```text
제품 정적 정본              → 실제 제품 데이터를 그대로 사용
HTTP API                    → MSW wire response
runtime·host·WebSocket port → 해당 runtime mock adapter
route-owned UI state        → 실제 pathname/search params
사용자 조작 상태            → 실제 click/type/submit/focus interaction
Query cache 자체가 정본인 projection·hydration → 제한적 TanStack Query seed
```

TanStack Query가 단순 캐시일 때 `setQueryData`로 fixture를 넣지 않는다. 그러면 query function, transport, parser, adapter, loading/error 처리를 우회한다. MSW도 HTTP가 아닌 정적 catalog나 runtime 데이터를 위해 가짜 API를 만드는 용도로 사용하지 않는다.

backend가 아직 없어 디자인 상태를 만들 수 없다면 제품이 사용할 명시적 port와 제품 business logic을 먼저 둔 뒤 Story runtime mock이 그 port의 외부 세계를 제공하게 한다. mock adapter는 허용되지만 Story 전용 TSX와 Story 전용 business logic은 허용되지 않는다.

## 도달 불가능한 디자인 상태 처리

디자인 정본의 상태는 제품 요구사항이다. 제품 로직으로 만들 수 없다면 다음 순서로 원인을 찾는다.

1. 공유 가능한 화면 상태인지 확인하고 제품 URL 계약으로 표현한다.
2. 순차 조작 상태이면 실제 제품 interaction으로 도달한다.
3. 성공·빈 값·실패·지연 같은 외부 상태이면 실제 transport/runtime mock으로 발생시킨다.
4. 제품 state machine이나 정책 판정이 없으면 제품 코드에 구현한다.
5. 외부 계약 자체가 없으면 제품 port를 설계하고 production adapter와 mock adapter가 같은 계약을 구현하게 한다.

fixture prop으로 마지막 렌더 결과를 직접 선택하는 것은 해결책이 아니다.

구현 전에 Story export에서 제품 route까지의 호출 체인을 먼저 확인한다. 제품 route 컴포넌트의 인자가 제품 runtime에도 자연스럽게 필요한 입력이 아니라 Story case 선택용이라면 추가하지 않는다. 이미 `fixturePreview` 타입이나 hook 입력이 남아 있더라도 그것은 재사용 허가가 아니라 제거할 smell 후보다.

다음 형태가 생기면 작업을 중단하고 외부 경계 또는 실제 interaction으로 다시 설계한다.

```tsx
<ProductRoute fixturePreview={preview} />
<ProductPage initialState={storyState} />
<Widget store={fixtureStore} />
```

## Smell 판정

다음이 발견되면 제품과 Story가 갈라졌다고 본다.

- `*RouteStoryScreen.tsx`, `FixturePage*.tsx`처럼 preview 안에서만 쓰는 제품 화면
- Story가 catalog/detail surface를 직접 선택하거나 제품 Page를 재조립함
- `mode="fixture"`가 DOM, copy, layout, command 또는 상태 판정을 바꿈
- Story fixture가 API DTO가 아니라 최종 ViewModel·section 배열을 Page에 주입함
- 동일한 제품 TSX를 쓰지만 Story에서만 전달되는 prop이 DOM이나 CSS 상태를 바꿈
- filled/error/loading 상태를 실제 interaction·transport 없이 초기 store로 꽂음
- Story 전용 CSS가 pixel mismatch를 가림

파일 이름만으로 확정하지 말고 실제 preview import와 렌더 트리를 추적한다. 테스트 전용 harness가 제품 preview에 들어가지 않더라도, 제품 UI의 별도 구현을 유지하는지 별도로 판정한다.

## 검증

pixel matching은 실제 제품 경로를 검증해야 한다.

- 같은 route와 case를 Story Page와 제품에서 각각 연다.
- viewport, locale, font readiness, animation 안정화 조건을 고정한다.
- 제품 query/hook이 실제 외부 mock 경계를 통과했는지 확인한다.
- 디자인 정본과 screenshot을 비교한다.
- 클릭, 상세 이동, dialog, 입력, validation, empty, error를 실제 제품 interaction으로 확인한다.
- Story와 제품의 TSX·CSS import 및 렌더 경로가 동일하다는 구조적 증거도 함께 남긴다.

Story screenshot이 일치해도 제품 경로가 다르면 완료가 아니다. 제품 screenshot이 디자인과 다르면 Story fixture로 보정하지 말고 일대일 원장의 누락 또는 불일치로 되돌린다.

## 작업 경계

판단·감사 요청은 분석으로 마무리한다. 파일 수정, 이슈 변경, PR 생성 범위는
사용자의 요청과 기존 승인에서 판단한다. 승인된 변경은 추가 의례적 확인 없이
진행하되, 디자인 해석이 갈리거나 새로운 제품 요구사항이 필요하면 그 결정만 묻는다.
