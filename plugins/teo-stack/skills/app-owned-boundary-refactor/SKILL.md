---
name: app-owned-boundary-refactor
description: 프런트엔드 코드의 책임 종류와 배치 위치를 서로 다른 축으로 판별한다. app-owned와 reusable 배치, Page-local/global 승격, route/page/widget 위치, 명목상 FSD layer 제거를 검토할 때 사용한다.
---

# 앱 소유 경계 리팩터링

현재 저장소의 역할 정의와 배치 계약에 적용한다. 아래 FSD 역할명은 책임을
설명하는 어휘이며 동일한 폴더 구조를 새로 도입하라는 요구가 아니다.
검토 요청이면 판정을 보고하고, 구현 요청이나 기존 승인이 있으면 해당 범위에서
경계를 정리한다.

## 서로 다른 두 축

- Feature·Entity·Widget 여부는 책임이 결정한다.
- Page-local·app-global·package 여부는 production residency가 결정한다.
- 한 Page에서만 쓰는 product command도 Page-local Feature다.
- 소비자가 하나라는 이유로 component나 hook이 product command를 직접 소유하게 하지 않는다.

## Residency

- re-export barrel은 production consumer로 세지 않는다. 실제 runtime owner까지 따라간다.
- 예상 재사용은 global 배치의 근거가 아니다.
- 서로 독립된 production owner가 실제로 공유할 때만 global로 승격한다.
- 외부 package consumer와 같은 app 안의 독립 owner를 구분한다. 후자는 global 배치의 근거일 수 있지만 package public API의 근거는 아니다.

## 경계

- FSD 이름은 목표 구조가 아니라 역할 이름의 예시다.
- layer 방향은 이름 붙은 모든 폴더를 순서대로 통과하라는 뜻이 아니다.
- policy·불변식·translation을 추가하지 않는 중간 owner는 경계가 아니다.
- Page는 Page-local Widget·Feature·Entity UI를 모두 직접 import하고, 주요 화면 영역과 순서를 드러내는 최종 composition root다. 화면 전체를 그대로 감추는 wrapper를 Page 아래에 만들지 않는다.
- Widget은 해당 영역을 통째로 show/hide해도 나머지 Page의 정체성·필수 흐름·배치가 어색하지 않은 독립 surface일 때만 만든다. 보이는 section이거나 여러 Entity를 import한다는 사실만으로는 Widget이 아니다.
- Widget은 다른 Widget을 직접 import하지 않는다. 여러 Widget의 배치·순서·동시 노출은 Page가 조합한다. Widget 안의 시각적 위치에 다른 Widget이 필요하면 Page가 둘 다 import한 뒤 명시적 structural slot으로 자식 Widget을 전달할 수 있다. slot은 배치만 표현하고 자식 Widget의 command·store를 중계하지 않는다. 두 영역이 항상 함께 숨겨져야 한다면 하나의 Widget인지 다시 판별한다.
- 정본 client나 protocol을 도입하면 대체된 내부 facade·provider·adapter를 같은 변경에서 제거한다.
