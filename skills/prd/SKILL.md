---
description: discuss의 해결책을 받아 CLAUDE.md FE 책임 맵에 투사하여 작은 파일로 분해하고 코드 레벨 contract을 정의한다. 책임=파일=에이전트 단위로 미리 쪼개 누가 구현해도 같은 결과로 수렴하는 청사진을 만든다.
---

## 역할

너는 **책임 분해자**다. discuss의 해결책 ⑪을 받아 CLAUDE.md FE 책임 맵의 행으로 쪼갠다. 책임 = 파일 = 에이전트 단위가 되도록 미리 분리하여, 누가 구현해도 같은 결과로 수렴하게 만든다.

## 본질 (한 문장)

PRD = 요구사항을 기성 책임 맵에 투사하여 **작은 파일로 미리 분리**한 청사진. 그 위에 contract(export 시그니처) · WHY · HOW · WHAT(코드 레벨, 의존 순서)을 쌓는다.

## 왜 이렇게 하는가

- v1 PRD(코드 없는 요구사항): 에이전트들이 각자 다른 구조로 구현 → 병렬 합류 실패
- v2 (현재): 책임 분해 + contract 정의 → 누가 읽어도 유사한 코드 산출 → 병렬 가능

핵심 4가지:

1. **FE 책임은 거의 정해져 있다** — `CLAUDE.md`의 `## FE 책임 맵`을 참조. 스킬은 책임을 **발명하지 않고 매핑**한다
2. **작은 파일 강제** — `guardOsPatterns` 등 훅이 큰 책임 혼합을 차단. PRD 단계에서 미리 쪼개면 자연 통과
3. **있는 걸로 먼저** — 신규 선언 전에 기존 부품 조회. `CATALOG.md` + `src/` 탐색이 §1 작성의 일부
4. **의존 순서** — WHAT은 topological order. 앞 항목에만 의존하는 뒤 항목

## 포지션 (파이프라인)

```
/discuss (WHY + 해결책)
   ↓  [⑪ 해결 🟢일 때 진입]
/prd (책임 분해 + Contract + WHAT 코드)
   ↓  [§1 책임 분해 🟢 + §2 Contract 🟢]
/go (책임 행 단위로 병렬 dispatch)
```

## Step 0: 입력 확인

1. discuss 13요소 이해도 테이블이 대화에 있는지 확인
2. 없으면 중단: "discuss 결과가 필요합니다. `/discuss`를 먼저 해주세요."
3. ⑪ 해결이 🟢인지 확인 — 🟡/🔴이면 중단
4. **`CLAUDE.md`의 `## FE 책임 맵` 섹션을 읽는다** — §1 작성의 SSOT

## Step 1: PRD 파일 생성

저장 위치:
- 서비스 기능: `docs/1-projects/<service>/prds/<feature>-prd.md`
- 엔진/공통 영역: `docs/2-areas/<layer>/prds/<feature>-prd.md`

빈 템플릿 작성 후 §0에 discuss 링크 삽입.

## Step 2: §1 책임 분해 (PRD의 심장)

요구사항 ⑪을 CLAUDE.md FE 책임 맵의 행으로 쪼갠다. **각 행 = 하나의 책임 = 작은 파일 1개**.

### 작성 절차

1. **요구사항 ⑪을 책임 단위로 나열** (의도 동사 단위: 계산/렌더/저장/변환/감시 등)
2. **각 책임마다 기존 부품 탐색**:
   - `src/interactive-os/CATALOG.md` 조회
   - `Glob`/`Grep`으로 동일 책임 파일 검색 (예: `Glob("**/*VirtualScroll*")`, `Grep("class.*Window")`)
   - 탐색한 경로/검색어를 §1 끝의 "탐색 증거"에 기록
3. **기존이 있으면 "재사용" 또는 "확장" 명시 / 없을 때만 "신규"**
4. **신규 파일 경로는 CLAUDE.md FE 책임 맵의 파일명 규칙으로 자동 결정** — 스킬이 이름을 짓지 않는다
5. **의존 칼럼 채움** — 같은 표 내 다른 행 번호 또는 외부 파일 경로. 의존은 CLAUDE.md 레이어 순서 준수 (store → engine → axis → pattern → primitives → ui → pages)

### 표 형식

| # | 책임 | 파일 경로 | 레이어 | 기존/신규 | 의존 |
|---|------|----------|-------|----------|------|
| 1 | 가상 윈도우 계산 | `src/interactive-os/primitives/useVirtualScroll.ts` | primitives | 신규 | — |
| 2 | 가상 List UI | `src/interactive-os/ui/VirtualList.tsx` | ui | 신규 | 1 |
| 3 | CMS 적용 | `src/pages/cms/PageCms.tsx` | pages | 수정 | 2 |

### 검증 (자동 🔴 조건)

- 파일 1개에 책임 2개 이상 들어가면 → **분해 부족** → 행을 더 쪼갠다
- 의존 칼럼이 순환하면 → 책임 경계 잘못 → 재분해
- 의존이 레이어 역방향이면 → 책임 위치 잘못 → 재배치
- 신규 파일 경로가 CLAUDE.md FE 책임 맵 행에 매칭되지 않으면 → FE 책임 맵에 누락된 카테고리 → 사용자에게 보고
- "탐색 증거" 누락 → "있는 걸로 먼저" 위반

§1 완성도: 행 4~6칼럼 채움 + 검증 통과 → 🟢

## Step 3: §2 Contract (각 신규 파일의 export 시그니처)

§1 표의 "신규" / "확장" 행에만 작성. "재사용" 행은 생략.

​```ts
// src/interactive-os/primitives/useVirtualScroll.ts
export type VirtualWindow = {
  startIdx: number
  visibleCount: number
  onScroll: (top: number) => void
}

/**
 * @invariant startIdx + visibleCount <= rows
 */
export function useVirtualScroll(rows: number, rowHeight: number): VirtualWindow
​```

규칙:
- **네이밍 사전 준수** (CLAUDE.md FE 책임 맵 + memory feedback)
- **No Placeholders**: `(?)`·"TBD"·"적절히"·"필요시" 등 금지. 결정 안 된 항목은 §1로 escalate하여 책임 행을 분리하거나 명시
- `@invariant` 주석으로 구현이 보존해야 할 조건 명시
- §1의 의존 칼럼 = §2 export 사이의 import 방향

## Step 4: §3 WHY / §4 HOW

- **§3 WHY**: 이 요구사항을 지금 이 분해로 푸는 근본 이유. discuss ⑪의 압축 + 책임 분해의 정당성
- **§4 HOW**: §1 책임들이 어떻게 조립되는가. Mermaid 시퀀스 또는 flowchart 1개로 충분

## Step 5: §5 WHAT (코드 레벨, 의존 순서)

§1 표를 의존 순서대로 정렬한 뒤, 각 행의 구현을 코드 블록으로 작성.

````markdown
### W1. useVirtualScroll (§1.1)

**의존**: —
**파일**: `src/interactive-os/primitives/useVirtualScroll.ts`

​```ts
export function useVirtualScroll(rows: number, rowHeight: number): VirtualWindow {
  const [scrollTop, setScrollTop] = useState(0)
  const startIdx = Math.floor(scrollTop / rowHeight)
  const visibleCount = Math.ceil(VIEWPORT_HEIGHT / rowHeight)
  return { startIdx, visibleCount, onScroll: setScrollTop }
}
​```

**검증**: vitest unit — `rows=1000, rowHeight=20, scrollTop=200 → startIdx=10`
````

규칙:
- **의존 순서 위반 금지** — W2가 W3에 의존하면 W3가 먼저 와야 함
- **코드 블록 No Placeholders** (superpowers writing-plans 규칙 차용) — `// TODO`, `// adjust as needed` 금지. 결정 못한 부분은 §1로 escalate
- 검증은 1~3줄로 명시 (vitest / screen-test / 수동 스샷)

## Step 6: 원칙 감시자 (1회, 마지막)

다음을 자동 검사:

1. **CLAUDE.md 규약 위반**: 파일명, import, ax(), 레이어 의존 방향
2. **memory feedback 위반**: 있는 걸로 만든다, render function is slot, ax semantic not css 등
3. **CATALOG.md 미확인**: 신규 UI 컴포넌트가 §1 "탐색 증거" 없으면 위반
4. **Placeholder 잔존**: `(?)`, "TBD", "적절히", "필요시" 등
5. **책임 행 = 1파일 1책임 강제**: 한 파일에 여러 책임이 묶이면 위반

위반 발견 시 해당 섹션으로 되돌아가 수정 후 재검사.

## Step 7: 사용자 리뷰

대화에 다음 요약 제시:
- §1 책임 분해 표 (전체)
- §2 Contract 신규 export 목록
- §5 WHAT 코드 블록 수
- 원칙 감시자 위반 0건 또는 수정 내역

사용자 수정 요청 반영 후 확정.

## 완성도 판정

- 🟢: §1 표 모든 행이 1파일 1책임 + §2 신규 파일별 contract 완비 + §5 의존 순서 정렬 + Placeholder 0 + 원칙 감시 통과 + 탐색 증거 기재
- 🟡: 일부 행에 Placeholder 또는 책임 분해 불충분 또는 탐색 증거 누락
- 🔴: §1 표 비어 있음 또는 책임 행 = 파일 매칭 실패

## Blueprint 템플릿

​```markdown
# [Feature Name] — PRD

> **Discussion**: [파일 경로 또는 한 줄 요약]
> **산출물 유형**: UI 기능 / 엔진 / 스킬·훅 / 문서·리서치 / 리팩토링
> **규모 추정**: 신규 N개, 수정 M개, 재사용 K개

## §0 요구사항 (from discuss)

- 해결책 ⑪: [한 줄]
- 제약 ⑦: [목록]
- 보유 자산 ⑧: [목록]

## §1 책임 분해

| # | 책임 | 파일 경로 | 레이어 | 기존/신규 | 의존 |
|---|------|----------|-------|----------|------|
| 1 | ... | `src/...` | ... | 신규 | — |
| 2 | ... | `src/...` | ... | 수정 | 1 |

### 탐색 증거

- `Glob` / `Grep` 검색어 + 결과 요약
- `CATALOG.md` 조회 항목

**완성도**: 🔴

## §2 Contract

> §1의 "신규" / "확장" 행에만 작성

### `path/to/file.ts`

​```ts
export type ... = { ... }

/**
 * @invariant ...
 */
export function ...(arg: ...): ...
​```

**완성도**: 🔴

## §3 WHY

[근본 이유 + 책임 분해 정당성]

## §4 HOW

​```mermaid
flowchart TD
  ...
​```

## §5 WHAT (의존 순서)

### W1. ... (§1.1)

**의존**: —
**파일**: `...`

​```ts
// 실제 구현 코드
​```

**검증**: ...

### W2. ... (§1.2)

**의존**: W1
**파일**: `...`

​```ts
// 실제 구현 코드
​```

**검증**: ...

## §6 원칙 감시자 결과

(완료 후 채움)

---

**전체 완성도**: 🔴
​```

## 종료

§1·§2 🟢 + 사용자 리뷰 완료 → 확정. AI 자율 판단으로 `/go` 이관.

### 자율 진행

PRD 확정 후 AI는 자율적으로 `/go`로 이관한다. §1 표의 책임 행 = 병렬 dispatch 단위. 의존 칼럼 위상정렬 순서대로 에이전트를 분배한다.
