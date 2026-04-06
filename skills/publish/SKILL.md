---
description: Living Documentation 오케스트레이터. module/layer 단위로 문서 완전성을 감사하고 빈 곳을 채운다. "/publish", "/publish listbox", "/publish ui", "문서 완전한가", "publish" 등을 말할 때 사용. /close의 Step 4에서 /area 대신 호출된다. retrospect 후 역PRD 이식, 데모·registry 확인, area 갱신을 하나의 파이프라인으로 수행.
---

## /publish — Living Documentation 오케스트레이터

> MDN처럼 "module을 찾아가면 설명+데모+API+키보드 표가 다 있는 상태"를 만든다.
> Martraire 4원칙(Reliable, Low-Effort, Collaborative, Insightful) + **Complete**.

## 입력

- `/publish {slug}` — 특정 module 감사+채움 (예: `listbox`, `treegrid`)
- `/publish {layer}` — layer 전체 감사 (예: `ui`, `pattern`, `plugins`)
- `/publish` — 최근 변경된 module 자동 감지 (git diff 또는 retro 결과)

## 7섹션 체크리스트

UI module(`docs/2-areas/ui/*.md`)의 완전성 기준:

| # | 섹션 | 판정 기준 | 자동 채움 소스 |
|---|------|----------|--------------|
| 1 | **Description** | `# Name` + `> 한 줄 설명` 존재 | registry slug → slugToMdFile |
| 2 | **Demo** | ` ```tsx render` + `<ShowcaseDemo slug="...">` 존재 | showcaseRegistry 확인 → 블록 삽입 |
| 3 | **Usage** | ` ```tsx` 코드 블록 존재 (import 포함) | 컴포넌트 소스에서 Props 기반 생성 |
| 4 | **Props** | `## Props` + 표 존재, 빈 행 없음 | 컴포넌트 소스의 interface에서 추출 |
| 5 | **Keyboard** | ` ```tsx render` + `<ApgKeyboardTable slug="...">` 존재 | apgBySlug 확인 → 블록 삽입 |
| 6 | **Accessibility** | `## Accessibility` + pattern/role/childRole 존재 | pattern 소스에서 추출 |
| 7 | **Internals** | `## Internals` + DOM 구조 + CSS 정보 존재 | 컴포넌트 소스에서 추출 |

**판정 규칙:**
- 섹션 존재 + 내용 있음 → ✅
- 섹션에 "없음", "N/A" 등 명시적 부재 → ✅ (의도적)
- 섹션 자체가 없거나 비어있음 → ❌

> 비-UI module(axis, pattern, plugin 등)은 체크리스트가 다르다. 해당 layer의 Area MD 구조에 맞게 적응한다.

## Step 1: 완전성 감사

1. scope 결정:
   - slug → `docs/2-areas/ui/{slugToMdFile[slug]}.md` 1개
   - layer → `docs/2-areas/{layer}/*.md` 전체
   - 없음 → `git diff`로 변경된 src 파일 → 해당 layer/module 자동 감지

2. 각 MD 파일을 7섹션 체크리스트로 감사

3. 리포트 출력:

```
/publish listbox

ListBox 완전성:
  ✅ Description  — "Keyboard-navigable list with single or multi-select support."
  ✅ Demo         — ShowcaseDemo slug="listbox"
  ✅ Usage        — import 예제 있음
  ✅ Props        — 5/5 props 기록
  ✅ Keyboard     — ApgKeyboardTable slug="listbox"
  ✅ Accessibility — pattern: listbox, role: listbox
  ✅ Internals    — DOM 구조 + CSS

  완전성: 7/7 (100%)
```

layer 단위면 module별 점수 + 평균:

```
/publish ui

UI Layer 완전성:
  ListBox      ███████ 7/7  100%
  Grid         ███████ 7/7  100%
  Combobox     █████░░ 5/7   71%  ← Props, Internals 누락
  ...
  Layer 평균: 85%
  최저: Combobox (71%)
```

**Step 1만으로 종료 가능** — 감사만 원하면 여기서 멈춘다. 채움이 필요하면 Step 2~5로 진행할지 묻는다.

## Step 2: 역PRD 이식

대화에 /retrospect 결과(역PRD)가 있으면, PRD의 스펙을 영구 문서로 전환한다.

| PRD 섹션 | → MD 섹션 | 이식 내용 |
|----------|----------|----------|
| ③ 인터페이스 | Props, Keyboard | 입력→결과 매핑 → Props 표, 키보드 동작 |
| ④ 경계 | Accessibility, Internals | 극단 조건 → 접근성 주의사항, DOM 구조 |
| ① 동기 | Description | WHY → 한 줄 설명 보강 |

**규칙:**
- 기존 내용이 있는 섹션은 건드리지 않는다 (F1 금지)
- 역PRD가 없으면 이 Step 건너뜀

## Step 3: 데모 완전성

❌ 섹션이 Demo인 경우:

1. `showcaseRegistry`에 해당 slug가 있는지 확인
   - 없으면 → **경고만** (F4: 강제 등록 금지). Tooltip 같은 engine 밖 컴포넌트일 수 있음
   - 있으면 → MD에 ShowcaseDemo 블록 삽입

2. `apgBySlug`에 해당 slug가 있는지 확인
   - 있으면 → MD에 ApgKeyboardTable 블록 삽입
   - 없으면 → Keyboard 섹션에 "APG 비표준" 명시

3. 테스트 커버리지가 부족하면 → `/demo-coverage` 호출 제안 (자동 실행 아님)

## Step 4: 점수 (선택적)

`pnpm score:*` 스크립트가 존재하면 → `/improve` 위임 제안.
없으면 → 건너뜀. 경고 없음.

## Step 5: Area 갱신

`/area` 스킬을 위임하여:
- L2 주기율표에서 ⬜→🟢 전환
- L3 빈칸 발견
- 새 구조적 갭 보고

## MD 파일이 없는 경우

Step 1에서 MD 자체가 없으면, 7섹션 스캐폴드를 생성한다:

```markdown
# {Name}

> {description — showcaseRegistry 또는 컴포넌트 소스에서 추출}

## Demo

` ` `tsx render
<ShowcaseDemo slug="{slug}" />
` ` `

## Usage

` ` `tsx
import { {Name} } from 'interactive-os/ui/{Name}'
` ` `

## Props

| prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|

## Keyboard

` ` `tsx render
<ApgKeyboardTable slug="{slug}" />
` ` `

## Accessibility

- pattern:
- role:
- childRole:

## Internals

### DOM 구조

### CSS

- 방식: CSS Modules
- 파일: {Name}.module.css
```

스캐폴드 후 Step 2~5를 이어서 빈 칸을 채운다.
