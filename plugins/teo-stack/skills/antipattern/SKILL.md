---
name: antipattern
description: 발견된 안티패턴을 훅 하네스로 전환한다. "이거 하지 마", "이건 안티패턴", "훅으로 막아", "하네스 만들어", "antipattern", "/antipattern" 등으로 트리거. 메모리에 기록하는 게 아니라 guardOsPatterns.mjs 등의 훅에 정적 검사 규칙을 추가하여 구조적으로 재발을 차단하는 것이 목적이다. 안티패턴을 발견했을 때, 또는 코드리뷰 중 "이건 하면 안 돼"라는 피드백이 나왔을 때 사용한다.
---

## 핵심 원칙

**메모리는 잊는다. 하네스는 잊지 않는다.**

사용자가 "이거 하지 마"라고 말했을 때:
- 메모리에 기록 → LLM이 다음 세션에서 떠올리길 바람 (불안정)
- 훅에 규칙 추가 → 다음에 시도하면 즉시 차단 (확실)

이 스킬은 안티패턴을 **훅 규칙으로 변환**하는 파이프라인이다.

## 입력

안티패턴은 다양한 형태로 들어온다:

1. **사용자 피드백**: "이거 하지 마", "이건 위반이야", "왜 이렇게 했어"
2. **코드리뷰**: 리뷰어가 거부한 패턴
3. **세션 중 발견**: 구현하다가 잘못된 방향으로 간 것을 나중에 수정한 경우
4. **직접 요청**: "이 패턴을 훅으로 막아줘"

## 실행 절차

### Step 1: 안티패턴 식별

사용자가 지적한 것 또는 대화에서 드러난 안티패턴을 구체적으로 정의한다.

```
안티패턴: [이름]
위반 코드: [구체적 코드 패턴]
올바른 대안: [어떻게 해야 하는지]
탐지 가능성: 정적 / 맥락 필요
```

### Step 2: 분류 — 훅 vs 스킬 체크리스트

| 탐지 가능성 | 조치 |
|------------|------|
| **정적 탐지 가능** — regex나 AST 패턴으로 잡힘 | → guardOsPatterns.mjs에 규칙 추가 |
| **맥락 판단 필요** — 파일 간 관계, 용도 이해 필요 | → 이 스킬의 체크리스트에 추가 |
| **양쪽 다** — 일부는 정적, 일부는 맥락 | → 훅 + 체크리스트 모두 |

**정적 탐지 판단 기준**: "이 패턴이 코드에 나타나면 100% 위반인가?" → Yes면 훅, No면 체크리스트.

### Step 3: 훅 규칙 작성 (정적 탐지 가능한 경우)

`.claude/hooks/guardOsPatterns.mjs`에 규칙을 추가한다.

**규칙 작성 원칙:**
- 검사 대상 파일 범위를 명확히 (isPages, isTsx, isCss, isExempt 등)
- regex는 false positive을 최소화 — 너무 넓으면 개발이 멈춤
- 에러 메시지에 **올바른 대안**을 구체적으로 안내
- 기존 규칙 번호 체계를 이어감

**규칙 템플릿:**
```javascript
// 규칙 N: [안티패턴 이름]
if ([조건] && [패턴].test(content)) {
  violations.push(
    '[위반 설명] — [올바른 대안 안내]'
  )
}
```

### Step 4: 테스트

훅 규칙을 추가한 후, 양성/음성 케이스를 stdin으로 테스트한다:

```bash
# 양성 (차단되어야 함)
printf '{"tool_name":"Write","tool_input":{"file_path":"...", "content":"[위반 코드]"}}' \
  | node .claude/hooks/guardOsPatterns.mjs

# 음성 (통과해야 함)
printf '{"tool_name":"Write","tool_input":{"file_path":"...", "content":"[정상 코드]"}}' \
  | node .claude/hooks/guardOsPatterns.mjs
```

양성은 `{"decision":"block",...}`이 출력되어야 하고, 음성은 출력 없이 통과해야 한다.

### Step 5: 보고

```markdown
## Antipattern → Harness 결과

### 추가된 훅 규칙
| # | 이름 | 패턴 | 파일 범위 |
|---|------|------|----------|
| 15 | 네이티브 다이얼로그 | prompt/alert/confirm | !isExempt, tsx |

### 체크리스트 추가 (맥락 판단)
- 오버레이 열림 시 route-level 키맵 비활성화 확인

### 테스트 결과
- 양성 N건 차단 확인
- 음성 N건 통과 확인
```

## 현재 체크리스트 (맥락 판단이 필요한 항목)

훅으로 잡을 수 없어서 사람/AI가 코드를 읽고 판단해야 하는 안티패턴들:

### 1. 오버레이 키보드 트래핑 누락
- 오버레이(modal/dialog)가 열려있을 때 route-level AriaRoute keyMap이 여전히 동작하면 위반
- modalOpen 가드 변수로 keyMap을 조건부 구성해야 함

### 2. 컴포넌트 용도 불일치
- ListBox: 값 선택 (폼)
- NavList: 액션 실행 (네비게이션, 명령) — activateOnSelect
- Combobox: 필터 + 선택
- TreeView: 계층 탐색
- 클릭→네비게이션인데 ListBox를 쓰면 위반 (onActivate가 Enter만 트리거)

### 3. CSS last-mile 경계
- 기존 CSS 파일에 ax() 축 소유 속성이 있으면 위반 (훅은 새 코드만 검사)
- `display`, `background`, `border-radius`, `box-shadow`, `font-size`, `color`, `padding`, `gap` 등
- **ui/ 내부 하드코딩 클래스**: `className="foo"`로 별도 CSS 클래스를 만들어 ax() 축 소유 속성(padding, layout 등)을 정의하면 위반. ax()로 표현 가능하면 ax() 사용. CSS 클래스는 transition/pseudo-element/columns 등 ax() 밖의 속성만 허용
- 특히 role:'control' Button에 padding override CSS를 만드는 패턴은 role 축의 크기 SSOT를 깨뜨림

### 4. 단순 작업에 과잉 워크플로우
- 결과물이 10줄 이하, 파일 1~2개, 기존 패턴 반복이면 discuss/PRD/cast/에이전트 편대 금지
- 판단 기준: "산출물의 복잡도"가 아니라 "의사결정의 복잡도". 방향이 명확하면 바로 구현
- 위반 신호: 리서치 에이전트 3개+, PRD 8단계를 전부 채움, 리뷰 에이전트 3개 병렬 — 결과물 대비 과잉
- 올바른 흐름: 규모 판단 → 작으면 /go 또는 직접 구현. discuss/PRD는 "방향을 모를 때"만

### 5. 사이즈 미고정 오버레이 → **훅 승격 완료 (규칙 17)**
- ~~Quick Open, Dialog 등 오버레이 패널에 width가 없으면 콘텐츠에 따라 크기 변동~~
- `surface:'overlay'`에 `width` 축이 없으면 훅이 자동 차단

### 6. 콘텐츠 영역 텍스트 선택 차단 → **Pit of Success로 해결**
- ~~Aria 인터랙티브 컨테이너 안 콘텐츠에서 마우스 텍스트 선택 불가~~
- 원인: `useAriaView`의 `pointerdown preventDefault`가 콘텐츠 영역까지 전파
- 해결: MarkdownViewer/CodeBlock/VirtualCodeBlock이 `select-text` 클래스를 자체 소유 + `useAriaView`가 `.select-text` 영역을 가드
- 새 콘텐츠 컴포넌트를 만들면 `select-text` 클래스 필요

### 7. 자명한 다음 행동에 불필요한 선택지 질문
- /go Verify 통과 후 "handoff할까 커밋할까?" 같은 질문은 판단 회피
- 맥락상 다음 행동이 명확하면(작업 경계 → /handoff) 바로 실행
- "A할까 B할까"를 묻기 전에 "내가 판단할 수 있는가?"를 자문
- 위반 신호: 사용자에게 자명한 2지선다를 던짐, "어떻게 할까요?" 식 질문

### 8. 반복 렌더링 요소를 plain div로 출력
- `.map()`으로 반복되는 요소가 클릭/키보드 인터랙션이 있어야 하는데 plain `<div>`로 렌더링하면 위반
- 파일 목록, 세션 목록, 태그 목록 등 — 사용자가 선택/활성화할 수 있는 항목은 interactive item이어야 함
- 올바른 대안: ui/ 완성품(NavList, ListBox 등)을 사용하거나, 최소한 `interactive: 'item'` 축 + 키보드 접근성 확보
- 판단 기준: "이 목록의 항목을 사용자가 클릭/Enter로 무언가 할 수 있는가?" → Yes면 item 필수

### 9. NormalizedData → plain array → 수동 JSX 렌더 (pages/)
- pages/ widget에서 `store.relationships[ROOT_ID]`나 `store.entities`를 순회하여 plain array로 추출 후 JSX로 수동 렌더링하면 NormalizedData→UI 채널 우회
- 위반 신호:
  - `function selectXxx(store) { return ids.map(id => store.entities[id]) }` + 이 array를 그대로 `.map(x => <div>...)` 렌더
  - 같은 파일에 `definePage`/`createStore`는 썼는데 Aria 컴포넌트(`ListBox`, `TreeView`, `TabList`, …)가 없음
- 올바른 대안: `const listData = useMemo(() => buildListData(items), [items]); return <ListBox data={listData} renderItem={ListItem} />`
- 효과: ARIA 속성(selected/posinset/setsize/tabindex roving)·키맵·plugin 합성이 자동으로 붙음
- **훅 일부 승격**: 규칙 6이 `role="list|listitem|tab|row|cell|..."` 수동 선언을 차단 (표면적 증상). 하지만 "NormalizedData 추출→수동 JSX"는 role 없이도 가능해서 정적 탐지 한계 — 이 체크리스트로 보완
- 판단 기준: "내가 지금 `.map(x => <div>)` 하고 있고, x가 store에서 왔는가?" → Yes면 ui/ 컴포넌트에 data prop 주입으로 재작성

### 10. 상태 계층 선택 (useState / createModuleStore / createCommandEngine)

컴포넌트 바깥으로 나갈 상태를 고를 때 세 질문으로 결정:

| 질문 | useState | createModuleStore | createCommandEngine |
|------|---------|-------------------|---------------------|
| 주인이 누구? | 단일 컴포넌트 | 앱 전역 | 앱 전역 + 도메인 |
| 몇 곳이 읽나? | 1 컴포넌트 + props | 여러 컴포넌트가 독립 구독 | 여러 컴포넌트 + middleware/plugin |
| 변경 로그/undo? | 아니오 | 아니오 | 예 |

- **useState**: 컴포넌트 수명에 묶이면 충분. 90% 케이스.
- **createModuleStore**: 앱 전역이되 단일 값 토글·설정 (theme/locale/viewMode/sidebarCollapsed). localStorage 키가 있으면 거의 이쪽.
- **createCommandEngine**: 엔티티 그래프 + 선택/편집/undo가 필요한 도메인 (list/tree/grid/editor).

**승격 신호** (useState → createModuleStore):
- 같은 `localStorage` 키를 여러 파일의 `useState`가 읽거나 쓰고 있음
- 훅(`src/hooks/use*.ts`)에서 `useState` + `localStorage.setItem` 같이 쓰고 있음 → **규칙 41로 차단됨**
- 한 페이지에서 set한 값이 다른 페이지에서 stale하게 보임

**승격 신호** (createModuleStore → createCommandEngine):
- 여러 필드가 상호 의존해서 validator가 필요해짐
- undo/redo, 변경 로그, middleware(logging/debounce/optimistic)가 필요해짐
- 엔티티-관계 구조(트리, 연결, 포커스된 항목)로 커짐

**판단 기준**: "이 값의 변경을 '명령'처럼 로깅·취소·검증해야 하는가?" → Yes면 command engine.

### 11. 모듈-스코프 let + 수동 getter/setter (구독 없음)

pages/ 또는 hooks/에서 `let S: T`를 모듈 스코프에 선언하고 `export function get*()` / `export function set*()`만 export하면, **나중에 구독이 필요해지는 순간** 수동 pub/sub를 다시 짜게 된다 (= 규칙 40 위반 코드를 배양하는 전 단계).

- 위반 신호: `let _data`, `let S:`, `let persistTimer` + `export function getX()` / `export function setX()` 조합
- 오늘 구독이 없어도 미래에 UI가 이 값을 실시간 반영해야 하면 반드시 `createModuleStore`로 이관된다 — 처음부터 `createModuleStore`로 시작하면 미래 비용 0
- 정적 탐지 한계: `let _` + `export set*`는 localStorage 캐시·계산 상수 등 합법 케이스와 겹쳐 자동 차단 불가. 코드리뷰에서 사람이 판정.
- 판단 기준: "이 값이 변하면 UI가 즉시 반응해야 하는가?" → Yes면 `createModuleStore`. No면 그대로 유지 OK.

## 훅 확장 시 주의사항

- **false positive 최소화**: 규칙이 너무 넓으면 정상 코드도 차단하여 개발 흐름이 멈춤. 의심스러우면 체크리스트에 먼저 두고, 패턴이 명확해지면 훅으로 승격
- **에러 메시지가 곧 문서**: 차단 메시지에 "왜 안 되는지"와 "대신 뭘 써야 하는지"를 명확히 적어야 함. 메시지를 읽고 바로 수정할 수 있어야 한다
- **제외 범위 존중**: `isExempt` (os 내부, devtools, styles)는 날코딩이 허용되는 영역
