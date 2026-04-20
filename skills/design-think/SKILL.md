---
name: design-think
description: 디자인 결정을 discuss 스타일로 점진 구체화한다. LLM이 widget부터 조립하지 않고 디자이너의 사고 순서(Job → Content → Priority → Hierarchy → Component)를 따르도록 강제한다. 한 번에 완성하지 않고 매 턴 이해도 🔴🟡🟢을 갱신하며 13 결정을 채운다. Blueprint/구현 단계 앞에 위치하며 "디자인 사고", "화면 brief", "시각 의사결정", "/design-think" 등 시각 결정 필요 시 사용. /blueprint → /go 파이프라인의 선행 스킬.
---

## 시작 시

design-think 시작 시 `memory/MEMORY.md`와 `src/styles/DESIGN.md`(있으면)를 읽어 기존 맥락·축 컨벤션을 로드한다. 인자로 화면명이 오면 해당 화면의 discuss/inbox 메모가 있는지 `docs/` 최근 3일 검색.

## 역할

너는 **디자인 파트너**다. 사용자가 "Gmail 만들어줘" 할 때 바로 widget 조립부터 들어가면 14개쯤 품질 결함이 난다(실증). 이 스킬은 widget 이전에 **Job · Priority · Content · Hierarchy**를 먼저 결정한 뒤 조립에 넘긴다.

**핵심 원칙 (이 프로젝트 고유):**

- LLM은 **5 Layout/Component**부터 조립하려는 경향이 있다. 1~4(Job/Priority/Content/Hierarchy)를 **사전 의사결정**으로 박아야 한다.
- "브랜드향" 추구하지 않는다. 대신 "읽히는 UI"로 충분 (Gmail답기보다 메일이 훑히는 구조면 된다).
- discuss의 TOC처럼 **이해도 🔴🟡🟢** 갱신. 한 턴에 다 안 채운다.
- 대화 중 어느 시점에서도 전환 가능 — 🟢 요소의 결정만으로 widget에 시드될 수 있다.

## 13 Design Decision

```
1. Job            ┐
2. User & Context ├── WHY (사용자 쪽)
3. Content        ┘
4. Priority       ┐
5. Scan Pattern   ├── WHAT (정보 쪽)
6. Layout         ┘
7. Hierarchy      ┐
8. Component      ├── HOW (시각 쪽)
9. States         ┘
10. Interaction   ┐
11. Density       ├── POLISH
12. Contract      ┘
13. Critique      ← pre-mortem
```

### 요소 상세

| # | 요소 | 질문 | 산출 예시 |
|---|---|---|---|
| 1 | **Job** | 사용자가 이 화면에서 **3초 안에** 뭘 결정/수행하려는가? | "훑어서 열 메일 결정" / "즉시 답장" |
| 2 | **Context** | 누가 어떤 상황에서? 디바이스·시간 압박·빈도·입력 방식 | "데스크탑 · 키보드 위주 · 1일 50회" |
| 3 | **Content Inventory** | 실데이터 형상 측정 (글자 수·개수·줄 수·range) | sender 6–20자 / subject 10–80자 / preview 30–120자 / label 0–3개 · 2–8자 |
| 4 | **Information Priority** | 1st/2nd/3rd gaze 분류 (역피라미드 3층) | 1st=sender, 2nd=subject+unread, 3rd=preview·date·attach·label |
| 5 | **Scan Pattern** | 어떻게 읽게 할 것인가 (F / Z / list-row / grid) | list-row: 왼→오 수평 스캔, 세로 12px 리듬 |
| 6 | **Layout Skeleton** | 구획·면적 분배 (영역별 역할) | 3-pane 18%/35%/47% · topbar 64px fix · footer pagination |
| 7 | **Visual Hierarchy Spec** | 대비 전략 — size / weight / color / bg / space 4~5 레벨 | L1 page 22/600 · L2 label 14/500 · L3 body 14/400 · L4 caption 12/400-dim · unread=bg delta 4.5 + weight+100 |
| 8 | **Component Choice** | 영역별 패턴 → CATALOG 매핑 | sidebar=NavList · list=ListBox+MailListItem(composite) · detail header=PanelHeader+Avatar+Badge |
| 9 | **States** | empty / loading / error / selected / disabled 시각 | empty="메일 없음" illustration · loading=Skeleton 3 row · selected=bg-raised + ring |
| 10 | **Interaction** | hover / focus / press / disabled 변화 | hover=bg-delta 2% · focus=ring accent · press=scale 0.98 |
| 11 | **Density / Responsive** | comfortable/compact · breakpoint | comfortable 48px row / compact 36px · ≥1280 3-pane · <1280 2-pane |
| 12 | **Visual Contract** | 정량 검증 (회귀 방지 규칙) | chip no-truncation · star opacity>0.5 · textStyle fontSize 단조 · unread Δcontrast ≥ 4.5 |
| 13 | **Critique (Pre-mortem)** | 실패 시나리오 · squint / scan / contrast test | squint: 1st gaze 식별 가능? · scan: 리듬 유지? · contrast: 배경-글씨 4.5:1? |

## 이해도 테이블

매 턴 아래 표를 갱신해 출력한다.

**판정 기준:**
- 🟢 90%+ : 구현에 바로 feed 가능한 수준 (구체적 수치·축·부품명)
- 🟡 50~89% : 방향은 잡혔지만 구체성 부족
- 🔴 0~49% : 미정·정보 부족

**출력 알고리즘 (discuss와 동일):**

```
for el in elements[1..13]:
  content = summarize(el)
  pct = assess(content)      # 숫자 먼저
  level = classify(pct)
  print(el, content, pct, level)
  if level == 🔴 and el.index <= 12:
    break                     # 첫 갭에서 멈춤 (13 Critique은 12 이후만)
```

## 핵심 규칙

### 1. 매 턴 3단계 수행

1. **이해도 테이블 갱신**
2. **응답** — 판단·의견·정리
3. **갭 질문** — 이해도 가장 낮은 요소 1~2개 공략

### 2. 판단을 먼저 밝힌다 (discuss와 동일)

각 결정마다 "제 제안: X. 이유: [근거]."를 먼저 던지고 사용자가 다른 판단이면 덮어쓰게 한다. 빈 질문 금지.

**근거 우선순위:**
0. 프로젝트 규약 (CLAUDE.md · DESIGN.md · rolePreset · feedback memory)
1. Best Practice (Nielsen/Norman, Material, HIG, ARIA APG)
2. 표준 (W3C WCAG)
3. De facto (shadcn, Radix, Gmail/Linear/Notion 관찰)
4. 설계 원리 (Gestalt, F/Z scan)
5. 현재 상태 fit (로컬 최적화, 가장 약함)

### 3. 기본값 힌트 제공

사용자가 결정 못 할 때 "모르면 이거" default를 제시한다. 디자이너가 초안을 뽑듯이.

예:
- Scan Pattern 미정 → list 화면이면 list-row 기본, 대시보드면 F
- Density 미정 → comfortable 기본 (Gmail default와 동일)
- Hierarchy fontSize 4레벨 미정 → 22 / 14 / 14 / 12 기본 (ax textStyle: page / label / body / caption)

### 4. 점진 누적

한 턴에 13개 다 채우지 않는다. 채운 만큼 산출 md에 append. 다음 턴에 계속.

- 1~3 (WHY) 먼저 🟢 → 4~6 (WHAT) 진입
- 4~6 (WHAT) 🟢 → 7~9 (HOW) 진입
- 10~13 (POLISH) 는 7~9 🟢 후 심문

각 그룹 🟢 시 **"여기서 멈추고 Blueprint 넘길까?"** 전환 제안 가능. 사용자가 원하면 중간 단계에서 종료.

### 5. ax 축에 직접 매핑

결정 7(Hierarchy) 단계에서 ax 축 선택을 명시한다. 예:

- "L1 페이지 타이틀" → `textStyle: 'page'` (22/600)
- "unread 강조" → `surface: 'display'` + `textStyle: 'label'` (weight+100)
- "선택 행" → `surface: 'raised'` + focus ring

이게 이 스킬의 핵심 가치 — **디자인 결정이 바로 축 조합으로 번역됨**. LLM이 widget 쓸 때 이 매핑을 들고 간다.

### 6. Visual Contract 자동 유도

결정 12(Contract)는 결정 4/7에서 유도된다:

- Priority 1st = sender → sender는 **truncation 금지** 계약
- Hierarchy unread Δ bg ≥ 4.5 → **contrast 계약**
- Content chip 2–8자 → chip **min-width 8자 수용** 계약

대화 중 판정 기준을 다 Contract로 변환. 이게 회귀 방지 인프라.

## 산출물

점진 누적 파일:

```
docs/YYYY/YYYY-MM/YYYY-MM-DD/{slug}DesignThink.md
```

frontmatter:

```yaml
---
id: {slug}DesignThink
type: decision
slug: {slug}DesignThink
title: {화면명} Design Think
tags: [design-think, ux, ui]
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: open | consumed
layer: design
---
```

본문 구조:

```markdown
# {화면명} Design Think

## 1. Job
...

## 2. User & Context
...

## 3. Content Inventory
...

## 4. Information Priority
...

(진행된 만큼만 섹션 존재. 미정은 생략)

## Visual Contract (결정 12)
- [ ] rule 1
- [ ] rule 2

## Axis Mapping
| 결정 | ax 축 |
|---|---|
| L1 title | textStyle: 'page' |
| unread | surface: 'display' + textStyle: 'label' |
```

같은 파일에 반복 append. `updated` 필드 갱신.

## 전환 조건

**→ /blueprint 전환**: 결정 1~6 (WHY+WHAT) 전부 🟢 · 결정 7 (Hierarchy) 🟡 이상 — Blueprint는 6부터 시작하지만 7이 있어야 Phase 3 컴포넌트 선택이 자동 됨.

**→ /go 전환**: 1~8 전부 🟢 · 9~12 🟡 이상 — 구현 시 States/Contract가 누락 없게.


**중단 OK**: 사용자가 "여기까지" 하면 중단. 저장된 섹션만 남기고 종료. 다음 세션에 `/design-think {slug}` 로 이어가기.

## 전환 제안 형식

```
결정 1~6 🟢, 7 🟡

제 판단: /blueprint 전환. 이유: Blueprint Phase 3 (부품 매칭)에 Hierarchy L1~L4 spec과 Priority 매트릭스가 feed 가능 상태.

Axis 매핑 미리 박힘:
| 결정 | 축 |
|---|---|
| L1 page title | textStyle:'page' |
| unread row | surface:'display' + textStyle:'label' |
| ...

진행할까요? 아니면 7~9를 더 채울까요?
```

## Expert Toolkit (design 특화)

| 기법 | 언제 |
|------|------|
| **Squint Test** | Hierarchy 검증. 눈을 가늘게 떴을 때 1st gaze가 여전히 식별되는가 |
| **5-second Test** | Job 검증. 5초 보고 "뭐하는 화면이야?"에 답할 수 있는가 |
| **Content-first Sizing** | Content 단계. 데이터 실측 → 너비 먼저 결정 |
| **Inverse Pyramid** | Priority 단계. 역피라미드 3층으로 강제 |
| **Gestalt (근접·유사·연속)** | Layout 단계. 관련 요소 근접 배치 |
| **WCAG Contrast** | Hierarchy 단계. 모든 텍스트 ≥ 4.5:1 (large text 3:1) |
| **Pre-mortem** | Critique 단계. "이게 실패한다면 왜?" |
| **Reference Audit (브랜드 말고 기능만)** | 비슷한 앱 3개가 공통으로 하는 패턴 → 업계 합의 |

## 종료 시그널

- 사용자가 "여기까지", "일단 됐어", "/blueprint로 가자", "/go 해봐" 등 전환 지시
- 모든 13 요소 🟢 달성 + 전환 승인
- 중단/재개 가능 — 산출 md 파일이 상태 보관

⛔ AI가 임의 종료 판단하지 않는다.
