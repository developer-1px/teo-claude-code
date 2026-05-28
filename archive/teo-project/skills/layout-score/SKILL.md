---
name: layout-score
description: FlatLayout definePage + widget의 구조를 체크리스트로 평가하고 수렴 루프를 돌려 개선한다. 텍스트 체크(L1/L2) + 스샷 검증(L3)의 3층 교차 구조. "레이아웃 평가", "definePage 점수", "이 페이지 레이아웃 봐줘", "/layout-score" 등을 말할 때 사용. 구조 단위 책임 경계를 검증한다.
---

# layout-score — FlatLayout 수렴 루프

## 왜 이 스킬이 존재하는가

LLM은 스크린샷 비평은 고해상도인데 디자인 개선은 평균으로 회귀한다. 원인은 **수렴 루프 부재** — 비평은 1회 forward pass이지만 개선은 닫힌 루프가 필요하다. FlatLayout은 flat 선언이라 **raw 텍스트만으로도 고해상도 평가가 가능**하다는 특성이 있고, 이 특성을 이용해 L1/L2 텍스트 루프 + L3 스샷 검증의 교차 구조를 돌리는 것이 이 스킬의 핵심이다.

## 3층 분리 (필수)

```
L1 (FlatLayout): "slot과 배치가 의도 대로인가"       — raw text만으로 가능
L2 (Widget):     "slot content가 의도를 수행하는가"  — raw text + 동작 검증
L3 (ax/토큰):    "그 의도가 픽셀에 드러나는가"       — 반드시 스샷 필요
```

**불변식**: 한 번의 iteration은 한 층만 건드린다. L1/L2/L3를 섞으면 범위가 폭발해 미완주.

## STEPS

### STEP 0: 대상 확정

사용자가 지정한 파일(또는 페이지)를 읽는다.
- `src/pages/*/Page*.tsx` — definePage 선언
- `src/pages/*/*Widgets.tsx` 또는 widget 구현 파일

### STEP 1: 스펙 선확인 (가짜 축 방어)

`src/interactive-os/layout/flatLayout.ts`에서 지원 축을 확인한다. 없는 수단(예: `divider` prop)을 평가 축으로 삼으면 수렴이 실패한다.

현재 확인된 스펙:
- **split**: direction, sizes, resizable, surface, padding
- **bar**: justify, gap, surface, padding
- **widget**: widget, props, source, scroll, surface, padding
- **variants**: split / stack / bar / overlay / widget / grid / nav / tab / section / floating / state
- **surface values**: sunken / base / raised / overlay
- **divider prop 없음** — surface delta 또는 gap으로 구분

### STEP 2: L1 체크리스트 적용 (definePage raw만)

| # | 축 | 판정 기준 | binary? |
|---|----|----------|---------|
| L1 | top-level 구조 | root에 header/content/footer 영역이 구분되는가 | ✓ |
| L2 | progress prominence | 진행률/상태 widget이 header 또는 독립 bar에 있는가 | ✓ |
| L3 | toolbar 구분 | toolbar ↔ grid 경계에 surface delta가 있는가 | ✓ |
| L4 | footer 존재 | keyboard hints 상시 노출 bar 있는가 (+ intent 2단 체크) | ✓ |
| L5 | toolbar 내부 그룹 구분 | bar 2+ child에 gap/surface 선언 | ✓ |
| L6 | grid surface 명시 | grid 노드의 surface가 암묵이 아닌 명시 | ✓ |
| L7 | root padding | 외곽 숨쉬기 선언 | ✓ |
| L8 | sizes 정합성 | sizes 개수 == children 개수, flex 영역 1개 | ✓ |
| L9 | sidebar tree (editor 류) | navigation widget slot | ✓ |
| L10 | detail pane (editor 류) | 편집 pane slot | ✓ |
| **L11** | **인접 same-surface 금지** ★ | split/bar의 인접 child에 연속 같은 surface 금지 | ✓ |
| L12 | 1-child container | 자식 1개인 bar/split은 경고 (삭제 후보) | 🟡 |
| L13 | padding rhythm | 동일 레벨 영역이 같은 scale | ✓ |

**L11이 결정적**. 텍스트로만 잡을 수 있고, 스샷으로는 덜 명확한 실패 패턴.

### STEP 3: 2단 판정 — slot 존재 ≠ 의도 수행

각 "slot 존재" 축에 대해 두 질문:
- **(a)** slot이 declaration에 있는가? (binary, raw text)
- **(b)** slot에 배치된 widget이 slot의 의도를 수행하는가? (widget inspection)

(a)만 ✓이고 (b)가 ✗이면 **false positive**. 반드시 L2로 진입해 widget을 본다.

**검증된 실패 사례**: footer bar에 `I18nHelpWidget` 배치 → (a) ✓, (b) ✗. widget이 popover 토글이라 hints가 클릭해야 보임. 의도("상시 노출") 실패.

### STEP 4: 범위 제한 (필수)

한 iteration은 한 층만. 다음 항목은 **범위 밖**으로 분리:
- L9/L10처럼 신 widget이 전제인 결함 → widget 신설 iteration
- L2 widget 내부 결함 → L2 루프
- L3 토큰·색 대비 결함 → L3 루프

범위 밖 항목은 리포트에 명시하되 이번 iteration에서 만지지 않는다.

### STEP 5: diff 설계

- 기존 부품 재사용 우선 (CATALOG.md 확인)
- 플랫폼 갭(예: ax tabular-nums 축 누락)이 발견되면 별도 기록
- hook 가드(`guardOsPatterns.mjs`)가 평균 해법(`style={}` 등)을 막는 것을 신뢰 — 가드가 보조 평가자

### STEP 6: 적용 + typecheck

```bash
pnpm typecheck 2>&1 | grep -E "(대상파일)" | head -20
```
파일 단위로 좁혀 확인. 기존 무관 에러가 많으므로 filter 필수.

### STEP 7: L3 스샷 검증 (필수, 생략 불가)

```bash
node scripts/screenshot.mjs /대상라우트
```
라우트가 스크립트 `routes` 배열에 없어도 `/` 접두사로 주면 ad-hoc 수집된다 (filterRoutes 참조).

Read로 `screenshots/{label}.png` 를 읽고 눈으로 확인:
- header/toolbar/grid/footer 밴드가 실제 구분되는가
- 배치한 widget이 의도대로 노출되는가
- 예상 못 한 depth·색 문제가 있는가

**텍스트 루프만으로는 수렴 불가**. 이 단계는 종료 조건의 일부.

### STEP 8: 재평가 + delta 기록

동일 체크리스트로 다시 채점. "전 X/N → 후 Y/N" 형식.

### STEP 9: 잔존 명시 + 층 재분류

수렴 못 한 항목을 분류:
- 범위 밖 (widget 신설 필요) → 다음 iteration 입력
- L2 widget 내부 → L2 루프 입력
- L3 토큰 → L3 루프 입력
- 플랫폼 갭 (ax 축 누락 등) → 별도 backlog

### STEP 10: 프로세스 회고

작동한 것 / 마찰 / 발견을 분리해 기록. 발견이 체크리스트의 신설 축이 되면 L11처럼 다음 세션의 규칙으로 승격.

## 불변식 (이 스킬의 "왜"를 지키는 규칙)

1. **한 iteration = 한 층** — L1·L2·L3 섞지 않는다
2. **Binary 판정 우선** — 비율·취향 축은 수렴 방해
3. **스펙 선확인** — 없는 수단 제안은 실패
4. **hook 가드 = 보조 평가자** — 평균 해법이 자동 걸러짐
5. **도메인 재검증** — 체크리스트 룰이 도메인에 반할 수 있다 ("100%=muted" 사례)
6. **slot 존재 ≠ 의도 수행** — (a) 텍스트 + (b) widget 2단 판정
7. **스샷 검증 필수** — L1 텍스트 통과 후에도 한 번은 눈으로 본다
8. **인접 same-surface 금지 (L11)** — 원칙 저장만으로 부족, 체크리스트 축으로 승격 필수
9. **범위 밖 분리** — 다음 iteration 입력으로 명시, 이번에 만지지 않음

## 관련 메모리

- `feedback_design_convergence_loop` — 왜 수렴 루프가 필요한가
- `feedback_flatlayout_separation_declaration` — 인접 구분 수단 declaration 원칙
- `feedback_slot_existence_vs_intent` — 2단 판정 (slot 존재 ≠ 의도 수행)

## 관련 스킬

- `/design-extract` — 레퍼런스 토큰 실측 (L3 입력 준비)
- `/blueprint` — 앱 레이아웃 설계 (이 스킬의 입력 생성)

## 증명 (2026-04-15 세션)

i18n editor PageI18nEditor.tsx 대상으로 3회 iteration:
- iter 1: L1 4-layer 재구조 (8/10 → 8/8 범위 내)
- iter 2: L2 widget 내부 (I18nStats 위계, inline hints) (W1·W4·W6 수정)
- iter 3: L11 위반 수정 (footer base → sunken)

각 iteration마다 텍스트 체크 + 스샷 검증 교차. L3(ProgressIndicator 불가시, surface 토큰 대비)만 미수렴 → L3 루프로 이월. **L1/L2 수렴 루프가 실제로 작동함이 증명됨**.
