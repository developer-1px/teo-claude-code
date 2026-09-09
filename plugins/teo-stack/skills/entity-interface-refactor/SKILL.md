---
name: entity-interface-refactor
description: 프런트엔드의 UI event와 product command를 인과관계로 구분하고 Feature·Entity·Widget의 capability 경계를 판별한다. FSD 경계, command 소유권, Entity·Widget callback·dispatch·store 누출을 검토할 때 사용한다.
---

# Entity 인터페이스 리팩터링

아래 역할을 사용하는 저장소의 명시적 계약에 적용한다. 일반 React callback이나
라이브러리의 Store 명칭을 이 개인 경계 규칙만으로 위반 처리하지 않는다.
리뷰 요청은 분석으로, 이미 승인된 리팩터링은 구현과 검증으로 마무리한다.

## 인과관계

```text
사실·관측 -> projection -> render = Query
사용자·시스템 의도 -> 판단 -> effect = Command
```

`setState`, `dispatch`, mutation hook, `onClick` 같은 문법으로 분류하지 않는다. event가 mutation·navigation·storage·runtime effect를 선택하면 product command다. 이미지 `onError`처럼 관측 결과를 표시하는 lifecycle callback은 command가 아니다.

## 소유권

- product command는 Feature에서 시작한다.
- 한 Page에서만 쓰는 command도 Page-local Feature다. 재사용 여부는 Feature 여부가 아니라 Feature의 위치를 결정한다.
- Entity의 public UI interface는 query-only다.
- Widget은 DOM event와 표시 상태를 소유할 수 있지만 product command capability를 public interface로 중계하지 않는다.
- Page는 Page-local Widget·Feature·Entity UI를 직접 import하는 composition root다. Widget은 다른 Widget을 직접 import하지 않고, Widget 간 배치와 조합은 Page가 드러낸다. 시각적 중첩이 필요하면 Page가 둘 다 import해 명시적 structural slot으로 자식 Widget을 전달할 수 있다.
- Entity API는 CRUD client, query·mutation hook, cache 정합성 로직을 소유할 수 있다. 데이터 접근 API의 mutation과 UI command 소유권을 혼동하지 않는다.
- Feature는 repository가 정한 정본 operation contract를 직접 사용한다. 단순 전달 provider·port·facade를 요구하지 않는다.

## Capability 누출

Entity와 Widget의 public interface에는 다음을 두지 않는다.

- `onSave`, `onDelete`, `onNavigate` 같은 product command callback
- `Action`, `Dispatch`, state+dispatch tuple
- router, clipboard, notification, storage, runtime command 객체
- action menu나 control row처럼 command capability를 숨긴 `ReactNode` slot
- 위 capability를 감춘 generic callback

Widget은 self-contained Feature component를 렌더링할 수 있지만 Feature command의 운반층이 될 수 없다. 또한 다른 Widget을 직접 import해 Page의 화면 지도를 감추지 않는다. Page가 제공하는 structural slot은 자식 배치만 표현해야 하며 product command callback·dispatch·store를 감추는 capability slot으로 사용하지 않는다.

## 이름

- `dispatch`는 action union에만 쓴다. 단일 command는 동사로 이름 짓는다.
- UI command family에서 `Store`는 state+dispatch tuple에만 쓴다.
- 둘을 구분해야 할 때 내부 UI transition은 `Action`, 외부 capability 요청은 `Command`로 부른다.
- 문법적 냄새는 위반이 아니다. 실제 위반은 product command가 Feature 밖에서 해석되거나 Entity·Widget interface로 전달되는 경우다.

## 선택적 후보 탐색

큰 hook의 연결되지 않은 계산을 살펴볼 때만
`scripts/find-disconnected-hooks.mjs <검증된 소스 경로> [--json]`을 사용한다.
현재 프로젝트에서 TypeScript를 읽는다. 결과는 lexical 연결성 후보이며
command 소유권이나 책임 분리 판정이 아니다. 실제 lifecycle과 caller를 확인한다.
