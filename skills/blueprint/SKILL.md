---
name: blueprint
description: 앱 레이아웃을 FlatLayout definePage로 설계한다. 요구사항이나 레퍼런스 앱 이름을 받아 레이아웃 구조 분석 → definePage 설계 → widget × ui/ 부품 매칭 → GAP 발견까지 수행한다. "레이아웃 설계", "앱 만들어봐", "화면 구조", "blueprint", "definePage로 설계", "~처럼 만들면", "Gmail 레이아웃" 등을 말할 때 사용. 코드를 편집하지 않고 preview만 출력한다. /do 전에 청사진을 먼저 잡고 싶을 때 사용.
---

## 왜 이 스킬이 필요한가

FlatLayout으로 화면을 만들 때 가장 먼저 해야 할 일은 **배치 구조를 선언적으로 설계**하는 것이다. 코드를 바로 짜면 구조가 어긋나고, 부품이 부족한 걸 나중에 발견한다. blueprint는 코드 편집 없이 **종이 위의 청사진**을 먼저 그린다.

## 입력

다음 중 하나:
- 레퍼런스 앱 이름 (예: "Gmail", "Notion", "Linear", "Figma")
- 요구사항 텍스트 (예: "3-pane 파일 탐색기 + 미리보기")
- 스크린샷 (이미지 파일 경로)

## 파이프라인: 4 Phase

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

### Phase 4: GAP 리포트

현재 FlatLayout + ui/ 카탈로그로 **안 되는 것**을 명시한다.

| GAP | 설명 | 해결 방향 |
|-----|------|----------|
| MailItem 없음 | 메일 목록 행 (checkbox+star+sender+subject+time) | ui/items/MailItem 신규 |
| StarIndicator 없음 | 별표 토글 | Toggle로 대체 가능 |

**GAP 분류:**
- **부품 GAP**: ui/에 없는 컴포넌트 → "신규 필요" 또는 "기존 X로 대체"
- **레이아웃 GAP**: LayoutNode로 표현 불가 → LAYOUT.md 한계 목록 참조
- **인터랙션 GAP**: axis/pattern으로 커버 안 되는 조작 → 축 확장 필요

### Phase 5: Context 설계

widget이 pull할 도메인 context의 인터페이스를 설계한다.

```ts
export interface AppContextValue {
  // 각 widget이 필요한 값을 나열
}

export const [AppProvider, useApp] = createDomainContext<AppContextValue>('App')
```

### Phase 6: 인터랙션 시나리오

주요 사용자 동작 → FlatLayout 반응을 테이블로 정리한다.

| 동작 | FlatLayout 반응 |
|------|----------------|
| 아이템 선택 | Detail hidden → false |
| 모달 열기 | overlay visible → true |

## 출력물 요약

1. ASCII 레이아웃 다이어그램
2. `definePage` 코드 (preview, 파일 편집 없음)
3. Widget × ui/ 매칭 테이블
4. GAP 리포트
5. Context 인터페이스
6. 인터랙션 시나리오 테이블

## 제약

- **코드 편집 없음** — preview만. 실제 구현은 `/do`로 전환
- **CATALOG.md 필수 읽기** — "있는 걸로 만든다" 원칙
- **LAYOUT.md 필수 읽기** — 노드 조합 규칙 준수
