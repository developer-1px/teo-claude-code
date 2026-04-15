---
name: design-review
description: 4-build manifest 기반 디자인 리뷰. manifest.yaml의 시나리오별로 브라우저 재현 → improve-design 채점 → 5-review/ 결과 기록. "디자인 리뷰", "빌드 리뷰", "스크린샷 리뷰", "/design-review" 등을 말할 때 사용. 개발 완료 후 디자인 검증 단계.
---

# design-review — manifest 기반 디자인 리뷰 파이프라인

## 왜 이 스킬이 필요한가

개발자가 기능을 빌드하고 `4-build/manifest.yaml`에 시나리오별 스크린샷을 찍었다. 하지만 이 스크린샷을 보고 디자인 품질을 **체계적으로 검증하고 결과를 기록하는** 단계가 없었다. `/improve-design`은 현재 화면 1장만 채점하고, `/use`는 자유 탐색 후 `/discuss`로 빠진다. **manifest 시나리오를 순회하며 각각 채점하고, 2-design.md 검토 항목과 대조하여 5-review/에 결과를 남기는** 워크플로우가 빠져있었다.

## 전제

- dev server 실행 중 (localhost:5173)
- MCP (claude-in-chrome) 연결됨
- feature 폴더에 아래 구조가 존재:
  ```
  {feature}/
    2-design.md      ← 검토 항목 체크리스트
    4-build/
      manifest.yaml  ← 시나리오 정의 (route, scenarios[])
    5-review/         ← 결과 출력 대상 (비어있어도 됨)
  ```

## 인자

| 인자 | 필수 | 예시 |
|------|------|------|
| feature 경로 | O | `docs/1-projects/viewer/stories/doc-browsing/features/miller-columns/` |

## 파이프라인

```
Step 1: 입력 수집
  ├─ manifest.yaml 읽기 → 시나리오 목록
  ├─ 2-design.md 읽기 → 검토 항목
  └─ 4-build/*.png 읽기 → 기존 스크린샷 참고

Step 2: 시나리오별 브라우저 검증 (GIF 녹화)
  for each scenario in manifest:
    ├─ 라우트 이동
    ├─ 시나리오 상태 재현 (클릭/키보드)
    ├─ 스크린샷 촬영
    ├─ zoom 3곳 이상
    └─ improve-design 채점 (독립 채점자)

Step 3: 2-design.md 검토 항목 대조
  ├─ 정보 밀도
  ├─ 시각 계층
  ├─ 레이아웃/비율
  └─ 전체 톤

Step 4: 5-review/ 결과 기록

Step 5: 수정 필요 시 → /improve-design 루프 진입
```

### Step 1: 입력 수집

```yaml
# manifest.yaml 구조
route: /docs
scenarios:
  - id: default
    description: 기본 상태 — 루트 폴더 목록 표시
    file: default.png
  - id: folder-selected
    description: 폴더 선택 — 하위 컬럼 표시
    file: folder-selected.png
```

manifest에서 추출할 정보:
- `route` — 브라우저에서 이동할 기본 라우트
- `scenarios[].id` — 시나리오 식별자
- `scenarios[].description` — 어떤 상태를 재현해야 하는지
- `scenarios[].file` — 4-build에 찍어둔 참고 스크린샷

2-design.md에서 추출할 정보:
- 검토 항목 체크리스트 (있으면 사용, 없으면 기본 4항목 사용)

**기본 검토 항목** (2-design.md가 비어있거나 항목이 없을 때):
1. 정보 밀도 — 아이콘, 메타 정보, 시각적 단서의 충분함
2. 시각 계층 — 선택/포커스/호버 상태 구분
3. 레이아웃/비율 — 컬럼 너비, 프리뷰 비율, 빈 공간
4. 전체 톤 — 색상, 타이포, 간격의 일관성

### Step 2: 시나리오별 브라우저 검증

각 시나리오에 대해:

1. **라우트 이동**: `navigate`로 manifest의 `route`로 이동
2. **상태 재현**: scenario.description을 읽고 해당 상태를 만든다
   - "폴더 선택" → 해당 폴더 클릭
   - "깊은 탐색" → 3단계 이상 drill-in
   - "파일 선택" → .md 파일 클릭
   - "빈 폴더" → 자식 없는 폴더 클릭
3. **스크린샷 촬영**: 전체 + zoom 3곳 이상
4. **4-build 스크린샷과 비교**: 기존 스크린샷을 Read로 읽어 현재 화면과 대조
5. **improve-design 채점**: 독립 채점자(sonnet) 호출

**채점자 호출 방법:**

```
Agent({
  model: "sonnet",
  description: "Design scorer — {scenario.id}",
  prompt: `
    다음 스크린샷을 improve-design 채점 체크리스트로 채점하라.
    역채점법: 감점부터 찾는다. 증거 없는 통과는 무효.
    
    시나리오: {scenario.description}
    
    [improve-design의 P0 + P1 + 가점 체크리스트 전체 포함]
    
    출력:
    - 항목별: 증거 + 감점/통과
    - 총점: X/10 (+가점)
    - 시나리오별 특이사항
  `
})
```

### Step 3: 2-design.md 검토 항목 대조

시나리오별 채점 결과를 모아서, 2-design.md의 검토 항목 각각에 매핑한다:

```markdown
## 검토 결과

### 정보 밀도
- [x] 아이콘 구분 — 폴더 chevron 있음, 파일 아이콘 없음 ⚠️
- [ ] 메타 정보 — 파일 크기/날짜 표시 없음

### 시각 계층
- [ ] 선택 상태 — ancestor 배경색 없음 ⚠️
- [x] 포커스 상태 — outline 있으나 배경색 없음 ⚠️
- [ ] 호버 상태 — interactive 축 동작 확인 필요

### 레이아웃/비율
- [x] 컬럼 너비 — min 180px, 적정
- [ ] 프리뷰 비율 — min 40%, 적정
- [ ] 빈 공간 — deep drill 시 우측 과다 ⚠️

### 전체 톤
- [x] 색상 — 다크 테마 일관
- [x] 타이포 — body 통일
- [ ] 간격 — 컬럼 간 border-dim 약함
```

### Step 4: 5-review/ 결과 기록

`{feature}/5-review/` 디렉토리에 결과 파일을 생성한다:

**`5-review/review.md`** — 통합 리뷰 문서:

```markdown
# {Feature Name} — Design Review

## 요약
- 리뷰 일시: {date}
- 라우트: {route}
- 시나리오: {count}개
- 평균 점수: {avg}/10

## 시나리오별 결과

### {scenario.id}: {scenario.description}
- 점수: X/10 (+가점)
- P0 위반: [목록]
- P1 위반: [목록]
- 가점: [목록]

### ...

## 검토 항목 대조 (2-design.md)

[Step 3의 매핑 결과]

## 수정 우선순위

| 순위 | 이슈 | 시나리오 | 감점 | 수정 방향 |
|------|------|----------|------|-----------|
| 1 | ... | ... | -2 | ax() 해법 |
| 2 | ... | ... | -1 | ... |

## 다음 단계
- [ ] /improve-design 루프 진입 (점수 < 9/10)
- [ ] 수정 후 재리뷰
```

### Step 5: 수정 필요 시

- **평균 점수 9/10 이상**: 리뷰 완료, 2-design.md 체크리스트에 체크 표시
- **평균 점수 9/10 미만**: `/improve-design` 루프 진입을 제안
  - 제안 형식: "평균 {X}/10. 수정 우선순위 상위 {N}개를 `/improve-design`로 수정할까요?"
- **특정 시나리오만 낮은 점수**: 해당 시나리오에 집중한 수정 제안

## 시나리오 재현 가이드

manifest의 description만으로는 브라우저에서 정확한 상태를 만들기 어려울 수 있다. 다음 패턴을 따른다:

| 키워드 | 재현 방법 |
|--------|-----------|
| "기본 상태" | 라우트 이동만 (아무 조작 없음) |
| "선택" / "selected" | 해당 아이템 클릭 |
| "깊은 탐색" / "drill" | 폴더를 3단계+ 클릭 |
| "프리뷰" / "preview" | 파일(.md) 클릭 |
| "빈" / "empty" | 자식 없는 폴더 클릭 |
| "많은 항목" / "many" | 항목 10개+ 있는 폴더로 이동 |
| "스크롤" | 항목이 넘치는 상태 확인 |
| "호버" | 요소 위에 마우스 hover |
| "키보드" | Arrow/Tab/Enter 키 사용 |

4-build의 기존 스크린샷을 Read로 읽어서 "이 상태를 만들어야 한다"는 참고로 활용한다.

## 주의

- 브라우저 도구(mcp__claude-in-chrome__*)가 필요하다. 없으면 4-build 스크린샷만으로 채점 (정확도 하락).
- 채점은 반드시 독립 채점자(sonnet)가 한다. 메인이 직접 채점하지 않는다.
- 채점자의 점수는 절대적이다. 메인이 수정할 수 없다 (improve-design 규칙 준수).
- 시나리오 재현이 불가능하면 (데이터 의존 등) 해당 시나리오를 skip하고 이유를 기록한다.
- GIF 녹화는 전체 리뷰 과정을 하나로, 또는 시나리오별로 나눌 수 있다.
