---
name: design-implement
description: ax() 축 시스템으로 UI를 구현한다. 컴포넌트 스타일링, UI 구현, CSS 수정 시 ax() 12축 사용을 강제한다. "컴포넌트 만들어줘", "CSS 작성", "스타일링", "UI 구현", "/design-implement" 등 디자인 시스템이 있는 프로젝트에서 CSS를 작성할 때 사용. module.css는 last-mile(축에 없는 속성)만.
---

# Design Implement — 디자인 결정 + ax() 축 기반 구현

## 왜 이 스킬이 필요한가

AI는 CSS 앞에 서면 바로 코드를 쓰려 한다. 데이터를 보지 않고, 역할을 구분하지 않고, 그룹핑을 고민하지 않는다. `ax()`가 있어도 **선택 기준(문법)**이 없으면 무작위 조합이 된다.

이 스킬은 두 가지를 강제한다:
1. **디자인 결정** — 코드 작성 전에 "뭘 왜 이렇게 보여주는가"를 사고한다
2. **ax() 준수** — 결정된 디자인을 12축으로 구현한다. CSS 직접 작성은 last-mile만.

## 전제

- `src/styles/ax.ts`에 ax() 함수가 존재해야 한다
- `src/styles/axes.css`에 축별 CSS 클래스가 정의되어 있어야 한다
- DESIGN.md가 프로젝트 루트에 존재해야 한다
- `src/interactive-os/ui/`에 기존 완성품 컴포넌트가 있다

## 구현 계층 (우선순위)

```
1. ax()만으로 구현         ← 기본 경로. 대부분 여기서 끝남
2. ax() + module.css      ← last-mile: position, ::before, column-count 등 축에 없는 CSS
3. style={}               ← 금지
```

---

## Phase 0: 경로 판단

| 상황 | 경로 |
|------|------|
| 전체 디자인을 해달라는 요청 / 새 컴포넌트·페이지 | → **Phase 1 풀 실행** |
| 기존 컴포넌트 부분 수정 (축 값 교체, 간격 조정 등) | → **Phase 2로 직행** |

판단 기준: "역할 구분과 그룹핑을 새로 해야 하는가?" YES → Phase 1, NO → Phase 2.

---

## Phase 1: 디자인 결정 (코드 작성 전 필수)

**빈 캔버스에서 시작하지 않는다.** 기존 컴포넌트에 골격이 있다.

각 Step의 결과를 텍스트로 출력한다 — 생각을 텍스트로 강제하면 건너뛰는 것을 방지한다.

### Step 1. 데이터 나열

실제 데이터 또는 샘플 데이터를 **텍스트로 쭉 적는다.**

```
예: 인시던트 상세
- 제목: "API 응답 지연 500ms 초과"
- 상태: Resolved
- 심각도: SEV-2
- 담당자: 김철수
```

### Step 2. 역할 구분

데이터 안에서 **역할이 다른 것들을 식별**한다.

```
예:
- 식별: 제목, 상태, 심각도 → "한눈에 뭔지"
- 메타: 담당자, 시간 → "누가 언제"
```

### Step 3. 그룹핑 + 위계

같은 역할끼리 묶고, 그룹 간 **위계**를 매긴다.

위계가 gap 축을 결정한다 — 기계적 매핑:

| 관계 | ax() gap | 예시 |
|------|----------|------|
| 가까울수록 | xs(4), sm(8) | 항목 내 요소 |
| 멀수록 | lg(16), xl(24) | 섹션 간 |
| 같은 위계 | 같은 값 | 동급 그룹 |

### Step 4. 배치

나열 방향은 **스크롤 여부**로 결정한다.

```
항목이 뷰포트에 다 들어가는가?
  → YES: 자유 (보통 가로가 공간 효율적)
  → NO:  스크롤 방향 = 나열 방향
```

→ layout 축 값으로 직결: `row`, `column`, `bar`, `spread`, `stack`, `scroll`, `fill`

### Step 5. 시각 도구 선택

**모든 시각 변화는 기능이 있을 때만 쓴다. 기능 없는 시각 변화 = 장식 = 금지.**

```
"이 시각 변화의 기능은 뭔가?"
  → 위계 표현?  → gap 축
  → 영역 구분?  → surface + padding + shape (면 = 3축 세트)
  → 역할 구분?  → textStyle 축
  → 강조?      → tone/text 축
  → 없음?      → 쓰지 마라
```

우선순위: **gap → surface+padding+shape (면) → 선(last-mile)** 순서로 시도.

### Step 6. 컴포넌트 선택

```
이 UI에 해당하는 기존 컴포넌트가 있는가? (src/interactive-os/ui/)
  → YES: 그 컴포넌트를 쓴다 (조립)
  → NO:  범용 컴포넌트를 ui/에 먼저 만든다
```

---

## Phase 2: ax() 축 기반 구현

### 12축 체크리스트

코드를 작성할 때 아래 12축을 하나씩 확인한다. ax.ts에서 타입을 읽어 현재 사용 가능한 값을 확인한다.

#### 시각 축 (6개)

| 축 | 질문 | 값 |
|---|---|---|
| **surface** | 인터랙션 모드는? | `action` / `input` / `display` / `overlay` / `ghost` |
| **controlSize** | 컨트롤 크기급은? | `sm` / `md` / `lg` |
| **textStyle** | 텍스트 역할은? | `hero` / `display` / `page` / `section` / `label` / `body` / `caption` / `code` |
| **tone** | 의미 색상은? | `accent` / `danger` / `success` / `warning` / `neutral` |
| **text** | 텍스트 밝기는? | `bright` / `primary` / `secondary` / `muted` |
| **shape** | 비-컨트롤 radius는? | `none` / `sm` / `md` / `lg` / `xl` / `pill` |

#### 구조 축 (6개)

| 축 | 질문 | 값 |
|---|---|---|
| **layout** | 배치 구조는? | `row` / `column` / `center` / `bar` / `spread` / `stack` / `scroll` / `fill` |
| **gap** | 자식 간격은? | `xs`(4) / `sm`(8) / `md`(12) / `lg`(16) / `xl`(24) |
| **padding** | 내부 여백은? | `none` / `xs` / `sm` / `md` / `lg` / `xl` |
| **width** | 폭 제약은? | `full` / `auto` / `fit` / `sm` / `md` / `lg` |
| **flex** | flex 비율은? | `none` / `auto` / `1` |
| **clamp** | 줄 수 제한은? | `1` / `2` / `3` / `4` |

### 사용법

```tsx
// ✅ ax()로 모든 시각+구조를 선언
<div className={ax({ layout: 'bar', gap: 'sm', padding: 'md' })}>
  <span className={ax({ textStyle: 'caption', text: 'muted' })}>Previous</span>
  <span className={ax({ textStyle: 'body', text: 'bright' })}>clipboard</span>
</div>

// ✅ surface + controlSize + tone = 완전한 버튼
<button className={ax({ surface: 'action', controlSize: 'md', tone: 'accent' })}>Save</button>

// ✅ 면 = surface + padding + shape 세트
<div className={ax({ surface: 'display', padding: 'lg', shape: 'lg' })}>Card</div>

// ❌ style={} 금지
<div style={{ padding: '16px' }}>

// ❌ CSS 토큰 직접 사용 (ax 축으로 표현 가능한 것)
.foo { padding: var(--space-lg); display: flex; gap: var(--space-sm); }
```

### module.css: last-mile만

ax() 12축으로 표현 불가능한 CSS만 module.css에 작성한다:

| 허용 (last-mile) | 금지 (ax로 표현 가능) |
|---|---|
| `position: absolute/fixed` | `display: flex` → `layout` |
| `column-count`, `column-gap` | `padding` → `padding` 축 |
| `::before`, `::after` | `gap` → `gap` 축 |
| `transform`, `animation` | `font-size` → `textStyle` 축 |
| `z-index` | `background` → `surface` 축 |
| `overflow-x: hidden` (세부 제어) | `border-radius` → `shape`/`controlSize` 축 |
| `backdrop-filter` | `color` → `text`/`tone` 축 |
| `grid-template-*` | `cursor` → `surface` 축 |

**판단 기준: "이 속성이 ax() 12축 중 하나로 표현 가능한가?" → YES면 ax(), NO면 module.css.**

### 번들 공변 규칙

ax() 축은 독립이지만, 일부 축은 함께 쓸 때 의미가 완성된다:

| 패턴 | 함께 쓰는 축 | 이유 |
|---|---|---|
| **컨트롤** | `surface` + `controlSize` + (선택: `tone`) | controlSize가 높이/radius/padding 전부 소유 |
| **면** | `surface: 'display'` + `padding` + `shape` | 3축 중 하나라도 빠지면 면이 아니다 |
| **텍스트** | `textStyle` + `text` | 역할(크기) + 밝기 = 완전한 텍스트 |
| **레이아웃** | `layout` + `gap` | 방향 + 간격 = 완전한 배치 |

## Composition Rules

1. **면 = 영역 구분** — surface + padding + shape 필수. 선은 last-mile 최후 수단
2. **화면당 주인공 1개** — hero/display textStyle 1개 + 나머지 후퇴
3. **조연의 후퇴** — 네비/보조 요소는 `caption` + `muted`
4. **포인트 컬러 1개** — `tone: 'accent'`만 채도. 나머지 neutral
5. **Gap = 위계** — 가까울수록 xs, 멀수록 xl. 같은 위계는 같은 gap
6. **액션은 오른쪽 끝** — `layout: 'spread'`

## Phase 3: 검증

1. **style={} 점검** — style 속성 사용 → ax() 축으로 교체
2. **CSS 토큰 직접 사용 점검** — module.css에서 ax 축으로 표현 가능한 속성 → ax()로 이동
3. **번들 공변 점검** — surface만 있고 controlSize 없는 버튼 등
4. **Composition rules 점검** — 위 규칙 준수 확인

## 위반 감지 패턴

| 패턴 | 위반 | 교정 |
|---|---|---|
| `style={{ padding: '16px' }}` | style={} 금지 | `ax({ padding: 'lg' })` |
| `.foo { display: flex; gap: 8px; }` | ax 축으로 가능 | `ax({ layout: 'row', gap: 'sm' })` |
| `ax({ surface: 'action' })` 에 controlSize 없음 | 컨트롤 번들 불완전 | `ax({ surface: 'action', controlSize: 'md' })` |
| `ax({ textStyle: 'caption' })` 에 text 없음 | 텍스트 번들 불완전 | `ax({ textStyle: 'caption', text: 'muted' })` |
| `className={styles.card}` 에 padding/shape | ax 축으로 가능 | `ax({ surface: 'display', padding: 'lg', shape: 'lg' })` |
| `.nav { font-size: var(--type-caption-size); color: var(--text-muted); }` | ax 축으로 가능 | `ax({ textStyle: 'caption', text: 'muted' })` |
