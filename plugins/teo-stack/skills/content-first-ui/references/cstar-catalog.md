# C* 기존 디자인으로 콘텐츠를 표현하는 법

먼저 콘텐츠를 결정한 다음 읽는다. 아래 자료는 부품 목록에 더해 실제 데이터와 컴포넌트 조합을 제공한다. 특정 업무 앱을 만들거나 A2UI를 출력하라는 뜻이 아니다.

## 동적 도구가 있는 빌더

1. `cstar_agent_builder_catalog(action="patterns")`로 데이터 특성별 기존 조합을 찾는다. 반복 목록, 동일 필드의 레코드, 대상 비교, 시간순 일정, 수치와 추이, 사실과 해석 등으로 탐색한다.
2. 후보의 `presetIds` 중 관련 있는 1~3개를 `action="read"`로 조회한다. 원본의 데이터 필드, nodes, children 순서, 텍스트 위계와 그룹을 확인한다. 목차의 요약만 읽고 임의 조합을 만들지 않는다.
3. 해당 특성에 맞는 사례가 목차에 없으면 `action="list"`로 전체 카탈로그를 탐색한다. 목차는 대표적인 탐색 출발점이며 전체 표현의 허용 목록이 아니다.
4. 현재 작성 도구의 실제 허용 목록을 별도로 확인한다. React는 `react_screen(action="catalog")`와 `action="inspect"`가 정본이다. 디자인 사례에 등장한다는 이유로 등록되지 않은 React 이름을 출력하지 않는다. `react_screen(action="reference", presetId="...")`는 원본의 정확한 `designCase`·`designNode` 선택자를 제공한다. 해당 유닛에 선택자를 연결하면 원래 배치·시각 설정을 가져오며 직접 gap·width·CSS 값을 고르지 않는다. 원본 구조와 콘텐츠 역할이 맞는 조합을 선택한다. 현재 빌더의 `Design*` 이름은 에이전트 디자인 정본의 유닛을 가리키며 원본 `A2uiSurface` React 렌더러가 DOM·CSS를 소유한다. 이름이 비슷한 일반 제품 `DataTable`·`Card`·`TextField`로 대체하지 않는다. 기존 컴포넌트라는 사실만으로 같은 디자인이라고 판단하지 말고 실제 import·렌더러·CSS 소유자를 대조한다.

`patterns`가 없는 이전 도구라면 아래 원본 파일을 직접 확인한다. 도구가 지원하지 않은 조회를 성공했다고 말하지 않는다.

## 저장소에서 직접 확인

현재 작업 checkout을 기준으로 읽는다. 다른 worktree의 디자인·등록 목록을 현재 버전의 지원 범위로 간주하지 않는다.

| 목적 | 실제 소스 |
|---|---|
| 데이터 특성 → 기존 조합 → 원본 사례 ID | `apps/clients/web/src/ui/pages/agent-builder/model/agentBuilderContentPatterns.ts` |
| 유닛의 의미, props, variant, 사용 주의점 | `apps/clients/web/src/a2ui/design/upstream/src/pages/dashboardUiGallery/a2ui/a2uiCatalog.ts` |
| 일반 기능 아이콘의 실제 등록 키와 자산 | `apps/clients/web/src/a2ui/design/upstream/src/shared/ui/Icon/iconSvgMap.ts` |
| 콘텐츠용 3D 아이콘의 별도 의미 매핑 | 위 `a2ui/` 디렉터리의 `A2uiSurface.tsx` 내 `SEMICON_ICON`; 이름만으로 일반 기능 아이콘과 같다고 보지 않는다. |
| 서비스 출처 아이콘과 사용 경계 | `apps/clients/web/src/a2ui/design/upstream/src/shared/assets/worksAssets.ts` |
| 완성된 디자인의 데이터·노드·그룹·섹션 순서 | 위 디렉터리의 `fixtures/*.json` 및 `product/*.json` |
| 빌더가 읽는 고정된 디자인 snapshot | `apps/clients/web/src/a2ui/design/runtime/cases.js`의 사례 ID 키. 도구의 `sourcePath`·`sourceKey`로 확인한다. |
| 빌더의 전체 참고 목록과 원본 조회 | `apps/clients/web/src/ui/pages/agent-builder/model/agentBuilderPresetCatalog.ts` |
| 제품 A2UI 작성 계약 | `apps/clients/web/src/a2ui/catalog/model/a2uiComposerCatalog.ts` |
| 에이전트 디자인 유닛 → React JSX 이름·내용 props·자식 경계 | `apps/clients/web/src/ui/pages/agent-builder/model/agentBuilderDesignCatalog.ts` |
| 실제 JSX → 정본 디자인 렌더러 연결과 기존 화면 프레임 | `apps/clients/web/src/ui/pages/agent-builder/ui/AgentBuilderDesignPreview.tsx` |
| 빌더 React 작성 가능 범위 | `apps/clients/web/src/ui/pages/agent-builder/model/agentBuilderReactCatalog.ts`의 `builderReactAuthoringProps` |

파일이 없는 버전이면 `rg --files`로 현행 위치를 찾는다. 디자인 원본과 현재 제품에서 사용 가능한 구현을 구분하고, 이름만으로 동일한 API라고 추측하지 않는다. 원본의 CSS를 복제해 빈틈을 메우지 않는다.

## 사례를 읽을 때의 판단

- `26b_agent-minutes-briefing`, `26c_agent-minutes-decisions`, `26h_agent-minutes-topicflow`: 제목·조회 범위와 반복 행을 주제·상태별로 묶는 방식. 회의 데이터에만 쓰는 구조라고 한정하지 않는다.
- `31_incremental-dashboard`, `18_utility-usage`: 요약 수치, 변화 추이, 동일 필드의 상세 레코드를 구분하는 방식. 모든 데이터를 지표 카드로 만들지 않는다.
- `24_agent-realestate`: 같은 기준으로 대상을 비교하는 지표·차트·비교표 관계. 부동산이라는 분야명을 다른 데이터에 붙이지 않는다.
- `03_calendar-day`: 날짜·시간축과 개별 일정 행의 관계. 영화 관련 요청도 영화 소개인지 상영 시간표인지에 따라 다른 조합을 찾는다.
- `10_notification-permission`: 제목·설명 묶음과 상태를 바꾸는 입력의 관계. 표시용 배지와 조작용 스위치를 구분한다.
- `34c_agent-disclosure-push`: 원문 사실과 에이전트 해석을 분리하는 방식. 업무 경고·금융 문구를 일반 결과 화면에 옮기지 않는다.

이것들은 실제 원본으로 들어가는 예시이며 필수 화면 목록이 아니다. 전체 데이터 특성별 목차는 저장소의 `agentBuilderContentPatterns.ts`가 관리한다.

선택한 조합에 대해 콘텐츠 필드 → 정보 역할 → 원본의 컴포넌트/입력 → 그룹 → 출처를 연결해 확인한다. 짧은 작업은 별도 문서 없이 판단해도 된다. 선택 기록을 사용자가 보는 UI에 기술 정보로 노출하지 않는다.

아이콘을 고를 때는 도메인·대상·사용자 과업에서 필요한 의미를 먼저 정하고 위 자산과 실제 사용례를 확인한다. 일반 기능 아이콘, 콘텐츠용 3D 아이콘, 서비스 출처 자산은 서로 다른 역할이다. `worksAssets`는 해당 서비스에서 온 데이터를 구분하는 용도이며 우리 기능을 나타내는 아이콘으로 사용하지 않는다. 등록되지 않은 이름의 fallback이나 기본 브랜드 로고를 의도한 의미의 표현으로 인정하지 않는다.

원본의 `description`에 더미·기획 미정·미지원이라고 명시된 사례는 승인된 제품 패턴으로 취급하지 않는다. 참고 사례의 버튼·입력·업무 흐름은 실제 기능 구현의 증거가 아니다. UI 전용 요청에 업무 로직을 덧붙이지 않는다.
