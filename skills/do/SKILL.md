---
name: do
description: aria os 기반 개발 파이프라인 실행기. 요구사항을 8단계(스키마→데이터→커맨드→조건→알고리즘→UI→테스트)로 분해하고 서브에이전트를 오케스트레이션한다. "/do", "구현해", "개발해", "코딩해" 등 구현 요청 시 사용. /go의 execute phase에서도 호출된다. 전통 React 방식이 아닌 os 부품 조립 패러다임을 강제한다.
---

## 왜 이 스킬이 필요한가

aria 프로젝트는 전통 React와 **패러다임이 다르다**:

| 전통 React | aria os 기반 |
|------------|-------------|
| UI 먼저 → 상태 나중에 | **데이터 먼저 → UI 마지막** |
| useState로 상태 관리 | store NormalizedData + command |
| onClick={() => ...} | keyMap 선언 |
| 컴포넌트가 로직 소유 | engine이 로직 소유, 컴포넌트는 렌더러 |
| style={{}} / CSS-in-JS | ax() 12축 |
| 직접 DOM 조립 | ui/ 완성품 import |

LLM의 사전 학습은 전통 React다. 금지 목록(CLAUDE.md)으로는 이 편향을 이길 수 없다. **양성 경로** — "이 순서로 이렇게 해라" — 가 필요하다.

## 핵심 원리: 부품 조립

aria 개발 = **기존 부품 선택 + 조립**. 새로 만드는 건 부품이 없을 때만.

부품 카테고리와 선택 기준:

| 질문 | 카테고리 | 위치 | 선택 기준 |
|------|----------|------|-----------|
| 데이터 구조가 필요한가? | **store** | `src/interactive-os/store/` | NormalizedData + command. 기존 스키마에 있으면 재활용 |
| 사용자가 키보드/마우스로 뭘 하나? | **axis** | `src/interactive-os/axis/` | navigate, select, expand, activate, dismiss, tab, value 중 선택 |
| 그 동작 조합이 APG 패턴인가? | **pattern** | `src/interactive-os/pattern/` | listbox, treegrid, tabs, combobox 등 |
| 반복 동작이 필요한가? | **plugin** | `src/interactive-os/plugins/` | history, crud, clipboard, rename, dnd 등 기존 플러그인 |
| 화면에 뭐가 보이나? | **ui** | `src/interactive-os/ui/` | 기존 완성품 매칭. 없으면 ui/에 새로 만듦 |
| 어떻게 생겼나? | **ax()** | `src/styles/ax.ts` | 12축 중 해당 축 조합 |

**부품 목록은 동적이다.** 매번 `tree` 명령으로 현재 부품을 확인한다. 스킬에 하드코딩하지 않는다.

## 8단계 파이프라인

요구사항을 이 순서로 처리한다. **각 단계의 산출물이 다음 단계의 입력**이므로 순서를 건너뛸 수 없다.

```
① 요구사항 분석
② 스키마 (있는 것 먼저)
③ 결과 데이터 설계
④ 커맨드 정의
⑤ 조건 (visibility, filter, guard)
⑥ 알고리즘 (변환 로직)
⑦ UI 선택 + 반영
⑧ 스크린 테스트
```

### ① 요구사항 분석

입력: PRD, task.md, discussion 결론, 또는 사용자 요청

- 요구사항을 **개별 항목**으로 분해한다
- 각 항목에 대해 부품 카테고리 테이블을 채운다:

```markdown
### 항목: [요구사항 한 줄 요약]

| 카테고리 | 기존 부품 | 신규 필요 |
|----------|-----------|-----------|
| store    | cmsSchema.ts의 X 타입 | Y 타입 추가 |
| axis     | navigate + select | — |
| pattern  | listbox | — |
| plugin   | crud | — |
| ui       | ListBox | — |
| ax()     | surface, cs, pd | — |
```

### ② 스키마

- `tree` 명령으로 기존 스키마 파일 확인
- **있는 것 먼저 사용**. 기존 Zod 타입을 확인하고 재활용
- 없는 타입만 추가

### ③ 결과 데이터 설계

- 최종 상태가 어떤 NormalizedData 모양이어야 하는지 설계
- nodes 플랫 맵의 구조, 루트 ID 배열

### ④ 커맨드 정의

- 현재 상태 → 결과 상태로 가는 command 정의
- `defineCommand` 패턴 사용
- 기존 command가 있으면 재활용

### ⑤ 조건

- VisibilityFilter, guard 조건
- 어떤 노드가 언제 보이는지, 어떤 동작이 언제 허용되는지

### ⑥ 알고리즘

- command의 execute 로직
- engine/plugin 레벨의 변환 로직

### ⑦ UI 선택 + 반영

- `tree src/interactive-os/ui/`로 기존 완성품 확인
- 적합한 UI 컴포넌트 선택
- 없으면 **ui/에 먼저 만들고** pages에서 import
- ax() 12축으로 스타일링. style={{}} 금지
- pages에서 useAria/useAriaZone 직접 사용 금지

### ⑧ 스크린 테스트

- `/screen-test` 스킬로 화면 수준 검증
- user input → 화면 변화 검증 (코드 구조 무관)

## 실행 방식: 플랜 → 서브에이전트

### Step 1: 파이프라인 플랜 생성

①을 직접 수행하여 요구사항 항목별 부품 매핑 테이블을 완성한다. 이것이 플랜이다.

```markdown
## /do 파이프라인 플랜

### 요구사항 항목 목록
1. [항목 A] — 부품: store(X), axis(navigate), ui(ListBox)
2. [항목 B] — 부품: store(Y), pattern(treegrid), ui(TreeGrid)
...

### 의존 관계
- 항목 A, B는 독립 → 병렬 가능
- 항목 C는 A의 스키마에 의존 → A 이후 순차

### 단계별 에이전트 배치
- Agent 1: ②③ 스키마 + 데이터 (항목 A, B 공통)
- Agent 2: ④⑤⑥ 커맨드 + 조건 + 알고리즘 (Agent 1 이후)
- Agent 3: ⑦ UI (Agent 2 이후)
- Agent 4: ⑧ 스크린 테스트 (Agent 3 이후)
```

### Step 2: 서브에이전트 디스패치

각 에이전트에게 전달하는 것:

1. **자기 단계의 입력/산출물** — "②③을 한다. 산출물은 스키마 파일과 타입"
2. **이전 단계의 산출물 경로** — "①의 플랜은 여기"
3. **해당 단계의 부품 선택 기준** — 위 카테고리 테이블에서 관련된 부분만 발췌
4. **CLAUDE.md 핵심 규칙** — 해당 단계에 관련된 것만 발췌 (전체를 넘기지 않는다)

에이전트 프롬프트 템플릿:

```
너는 aria 프로젝트에서 [단계 번호]를 수행한다.

## 이 프로젝트의 개발 방식
[패러다임 전환 테이블 — 전통 React vs aria]

## 네 역할
[이 단계에서 할 일, 입력, 산출물]

## 부품
[tree 스캔 결과 — 관련 디렉토리만]

## 이전 단계 산출물
[경로 또는 내용]

## 규칙
[CLAUDE.md에서 이 단계에 관련된 규칙만]
```

### Step 3: 통합 + 검증

모든 에이전트가 완료되면:
- 산출물이 파이프라인 플랜과 일치하는지 확인
- `pnpm typecheck` + `pnpm test` 통과 확인
- 실패 시 해당 단계 에이전트 재디스패치

## go와의 관계

go는 오케스트레이터로서 상황 판단 후 `/do`를 호출할 수 있다:

```
/go
  ├── 상황 판단
  ├── Phase: Execute → /do 호출
  ├── Phase: Verify (go가 담당)
  └── Phase: Retrospect (go가 담당)
```

`/do`는 execute만 담당한다. verify, retrospect는 `/go`의 몫.

## 단독 사용

go 없이 `/do`만 호출할 수도 있다. 이 경우:
- 파이프라인 플랜 생성 + 실행까지만
- verify는 수동으로 (또는 사용자가 /go를 이어서 호출)
