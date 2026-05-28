---
name: blueprint
description: 앱 레이아웃을 FlatLayout definePage로 설계한다. 요구사항이나 레퍼런스 앱 이름을 받아 기능 전수 열거 → 레이아웃 구조 분석 → definePage 설계 → widget × ui/ 부품 매칭 → Coverage 검증 → GAP 발견까지 수행한다. "레이아웃 설계", "앱 만들어봐", "화면 구조", "blueprint", "definePage로 설계", "~처럼 만들면", "Gmail 레이아웃" 등을 말할 때 사용. 코드를 편집하지 않고 preview만 출력한다. /go 전에 청사진을 먼저 잡고 싶을 때 사용.
---

## 왜 이 스킬이 필요한가

LLM이 앱 레이아웃을 설계할 때 가장 큰 문제는 **기능 누락**이다. 머릿속 인상으로 "Gmail은 사이드바 + 메일 목록 + 읽기 창"이라고 떠올리지만, 스누즈/라벨 관리/다중 선택 일괄 작업/검색 필터 같은 것을 빠뜨린다. blueprint는 **먼저 기능을 전수 열거**하고, 레이아웃이 모든 기능을 커버하는지 검증한다.

## 입력

다음 중 하나:
- 레퍼런스 앱 이름 (예: "Gmail", "Notion", "Linear", "Figma")
- 요구사항 텍스트 (예: "3-pane 파일 탐색기 + 미리보기")
- 스크린샷 (이미지 파일 경로)

## 파이프라인: 7 Phase

### Phase 0: Feature Decomposition (기능 전수 열거)

레이아웃을 그리기 **전에** 7축으로 기능을 빠짐없이 열거한다. 이 단계를 건너뛰면 나중에 "이것도 있었는데" 하고 후회한다.

**7축 강제 열거:**

| 축 | 질문 | 채우기 |
|---|------|--------|
| **Entity** | 어떤 데이터를 다루나? | 모든 데이터 타입 나열 |
| **CRUD** | 각 entity에 어떤 조작? | entity별 생성/읽기/수정/삭제 + 도메인 액션 |
| **Navigation** | 어떤 경로로 이동? | 화면 전환, 드릴다운, 뒤로가기 |
| **View** | 같은 데이터를 다르게 보는 방법? | 목록/그리드/캘린더, compact/comfortable, 탭 분류 |
| **Bulk** | 여러 항목에 동시에 하는 것? | 다중 선택, 일괄 삭제/이동/라벨 |
| **Filter/Sort** | 어떻게 걸러보나? | 검색, 필터 칩, 정렬 기준 |
| **Setting** | 사용자가 바꿀 수 있는 것? | 테마, 표시 밀도, 알림, 개인 설정 |

**출력:** 기능 목록 (Feature List). 각 항목에 ID를 부여한다.

```
F1. Mail: read
F2. Mail: archive
F3. Mail: delete
F4. Mail: star/unstar
F5. Mail: snooze
F6. Mail: label 추가/제거
F7. Draft: create
F8. Draft: edit
F9. Draft: send
F10. Draft: discard
F11. Navigation: Inbox→Thread
F12. Navigation: Sidebar→Label
F13. Navigation: Search→Results
F14. View: 목록 (compact/comfortable/default)
F15. View: 분할 보기 (reading pane)
F16. View: 탭 (Primary/Social/Promotions)
F17. Bulk: 다중 선택→삭제/이동/라벨/읽음 처리
F18. Filter: has:attachment, is:unread, date range
F19. Setting: 테마, 표시 밀도, 서명
...
```

**이 목록이 나올 때까지 다음 Phase로 넘어가지 않는다.**

### Phase 1: 구조 분석

레퍼런스 앱의 레이아웃을 ASCII art로 그린다.

```
┌─────────────────────────────────────┐
│ Header                              │
├────────┬────────────────┬───────────┤
│Sidebar │  Content       │  Detail   │
│        │                │           │
└────────┴────────────────┴───────────┘
```

각 영역의 역할을 한 줄로 정의한다:

| 영역 | 역할 | 인터랙션 |
|------|------|---------|
| Header | 검색 + 네비게이션 | 검색 입력, 프로필 메뉴 |
| Sidebar | 폴더/카테고리 목록 | 선택 → Content 갱신 |
| Content | 아이템 리스트 | 선택 → Detail 표시 |
| Detail | 아이템 상세 | 읽기, 편집 |

### Phase 2: definePage 설계

LAYOUT.md의 10개 LayoutNode를 사용하여 definePage를 작성한다.

**작성 전 체크리스트:**
1. `src/interactive-os/layout/LAYOUT.md` 읽기 — 사용 가능한 노드, 조합 규칙, 패턴 카탈로그 확인
2. 가장 가까운 기존 패턴 선택 (3-Pane, Sidebar+Content, Stack+Overlay, Conditional Mode Switch 등)
3. 기존 패턴에서 변형할 부분만 수정

**출력 형식:**

```ts
const appLayout = definePage({
  entities: {
    root: { data: { type: '...', ... }, children: ['...'] },
    // ...
  },
})
```

**hidden 활용**: 조건부 영역(모드 전환, 패널 show/hide)은 `hidden: true/false`로 선언.

**overlay 활용**: 모달, 팝업은 OverlayNode으로. 전역 크롬(FAB 등)은 FloatingNode으로.

### Phase 3: Widget × ui/ 부품 매칭

각 widget이 어떤 ui/ 부품으로 조립되는지 매칭한다.

**매칭 전 필수**: `src/interactive-os/CATALOG.md` 읽기 — 있는 부품을 먼저 확인.

**출력 형식:**

| Widget | 조립 부품 (ui/) | 있음/없음 |
|--------|---------------|----------|
| SearchBar | `Combobox` + `Avatar` | ✅ |
| ItemList | `ListBox` + `MailItem` | ⚠️ MailItem 신규 |

**매칭 규칙:**
- ui/ 컴포넌트 1개로 되면 → 그대로 사용
- ui/ 컴포넌트 2개+ 조합 → widget으로 분리
- items/ 에 맞는 Item이 없으면 → "신규 Item 필요" 표시
- indicators/ 에 맞는 것이 없으면 → "신규 Indicator 필요" 또는 기존 것으로 대체

### Phase 4: Coverage 검증 (하네스)

Phase 0의 **모든 기능**이 Phase 2~3의 widget에 배치됐는지 검증한다. 이 검증이 blueprint의 핵심 가치다 — 누락을 구조적으로 잡는다.

**Coverage Matrix:**

| ID | 기능 | Widget | 배치됨? |
|----|------|--------|--------|
| F1 | Mail: read | ReadingPane | ✅ |
| F2 | Mail: archive | MailList (swipe/toolbar) | ✅ |
| F5 | Mail: snooze | ??? | ❌ 누락 |
| F6 | Mail: label | ??? | ❌ 누락 |
| F17 | Bulk: 다중선택 | ??? | ❌ 누락 |

**누락 발견 시:**
1. 기존 widget에 기능을 추가할 수 있으면 → widget에 메모
2. 새 widget이 필요하면 → definePage에 노드 추가
3. 새 overlay/modal이 필요하면 → OverlayNode 추가

**❌가 0개가 될 때까지 Phase 2~3으로 돌아가서 수정한다.**

### Phase 5: GAP 리포트

Coverage 100% 달성 후, FlatLayout + ui/ 카탈로그로 **안 되는 것**을 명시한다.

**GAP 분류:**
- **부품 GAP**: ui/에 없는 컴포넌트 → "신규 필요" 또는 "기존 X로 대체"
- **레이아웃 GAP**: LayoutNode로 표현 불가 → LAYOUT.md 한계 목록 참조
- **인터랙션 GAP**: axis/pattern으로 커버 안 되는 조작 → 축 확장 필요

### Phase 6: Context 설계

widget이 pull할 도메인 context의 인터페이스를 설계한다.

```ts
export interface AppContextValue {
  // 각 widget이 필요한 값을 나열
}

export const [AppProvider, useApp] = createDomainContext<AppContextValue>('App')
```

### Phase 7: 인터랙션 시나리오

주요 사용자 동작 → FlatLayout 반응을 테이블로 정리한다.

| 동작 | FlatLayout 반응 |
|------|----------------|
| 아이템 선택 | Detail hidden → false |
| 모달 열기 | overlay visible → true |

## 출력물 요약

1. **Feature List** (7축 전수 열거)
2. ASCII 레이아웃 다이어그램
3. `definePage` 코드 (preview, 파일 편집 없음)
4. Widget × ui/ 매칭 테이블
5. **Coverage Matrix** (Feature → Widget 매핑, ❌ = 0)
6. GAP 리포트
7. Context 인터페이스
8. 인터랙션 시나리오 테이블

## 제약

- **코드 편집 없음** — preview만. 실제 구현은 `/go`로 전환
- **CATALOG.md 필수 읽기** — "있는 걸로 만든다" 원칙
- **LAYOUT.md 필수 읽기** — 노드 조합 규칙 준수
- **Coverage ❌ 0개 필수** — Feature List의 모든 항목이 widget에 배치될 때까지 Phase 2~3을 반복
