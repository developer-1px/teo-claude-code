---
name: ocp
description: 파일이나 기능의 개방-폐쇄 원칙(OCP)을 점검하고 리팩토링한다. "OCP", "/ocp", "개방 폐쇄", "switch 너무 많다", "if 분기 정리", "분기 흩어짐", "선언적 맵", "registry", "descriptor", "새 타입/variant 추가마다 여러 곳 수정" 같은 요청에서 사용한다. 열린 집합의 분기가 여러 소비자에 산재해 동반 변경 지점이 2곳 이상인지 분석하고, 확장 시 기존 코드 수정 지점을 0~1곳으로 줄이는 구조를 설계·전환한다.
---

# OCP 점검과 리팩토링

## 목적

**명령(분기·디스패치)은 안으로 숨기고, 선언(의도·정의)은 밖으로 드러낸다.**

OCP 위반의 본질은 "수정 지점 N곳"이 아니라 **명령이 밖으로 새고 선언이 안에 갇힌 상태**다. 수정 지점 수는 그 결과 증상일 뿐이다. 따라서 점검은 의미 분배(안/밖) 판정이 먼저, 정량 검증(수정 지점 카운트)이 나중이다.

```
밖 (선언·의도, 사용자가 매번 쓰는 곳)   안 (명령·메커니즘, 한 번 짜고 안 건드리는 곳)
─────────────────────────────────────   ──────────────────────────────────────
- 항목 정의 (descriptor 데이터)          - 분기/디스패치 (if/switch/타입 분기)
- 등록 호출 (defineXxx)                  - registry 조회 / resolve / fallback
- 소비자의 의도 ("태그 가져온다")         - 메커니즘 구현 디테일
```

## 핵심 판단

변경 시나리오를 먼저 고정한다. 새 항목을 추가하거나 삭제할 때 함께 수정해야 하는 곳이 2곳 이상이고, 그 항목 집합이 열린 집합이면 OCP 위반으로 본다.

건드리지 말아야 할 것:
- 닫힌 집합의 `switch` 또는 `if` 체인
- 새 항목 추가 시 수정 지점이 1곳 이하인 구조
- 단순 취향 문제인 "switch가 보기 싫다" 수준의 코드

주의할 것:
- `switch`를 거대한 `Record<string, Descriptor>` 리터럴로 옮기는 것은 보통 OCP가 아니다. 새 항목마다 같은 중앙 파일을 열어야 하면 본질이 같다.
- `index.ts`에 import와 맵 엔트리를 계속 추가해야 하면 수정 지점은 여전히 2곳이다.
- 소비자 함수에 `if (type === "section")` 같은 타입별 분기가 남으면 실패다. 소비자는 registry 조회와 fallback만 수행하고, 타입별 로직은 descriptor/strategy가 소유해야 한다.

## Phase 0. 안/밖 경계 (Inside/Outside Tree)

수량 검사 전에 **의미를 먼저 고정한다**. 이 케이스에서 무엇이 밖에 있어야 하고 무엇이 안에 있어야 하는지를 ASCII 트리로 **엄청 자세하게** 작성한다. 카테고리별로 가지치고, 각 잎 노드에 구체적 코드 예시·금지 사례·이유를 적는다. 트리가 얕거나 일반 서술이면 Phase 1의 카운트가 헛돈다 — 이 트리가 Phase 1·2의 입력 자료다.

```text
밖/ (선언·의도 — 사용자가 새 항목 추가할 때 쓰는 표면)
├─ 항목 정의
│  ├─ Do: descriptor 리터럴 ({ tag: "section", className: ... })
│  └─ Don't: 정의 안에 if/switch/타입 분기
├─ 등록 호출
│  ├─ Do: defineXxx(key, descriptor) — 1줄 등록
│  └─ Don't: 정의 소스에서 멀리 떨어진 중앙 파일 import 추가
└─ 소비자 의도
   ├─ Do: getTag(data) 같은 의도 동사
   └─ Don't: getTagForSection / getTagForArticle 같은 타입 누설

안/ (명령·메커니즘 — 한 번 짜고 사용자가 안 건드리는 영역)
├─ registry 자료구조
│  └─ Do: Map<key, Descriptor>; Don't: 타입별 분기된 Map
├─ resolve 헬퍼
│  └─ Do: 값/함수 polymorphic resolve + fallback
├─ fallback 정책
│  └─ Do: registry miss 시 기본값; Don't: miss 시 타입별 분기
└─ 디스패치
   └─ Do: registry.get(data.type)?.field; Don't: 소비자 안 if (type === "...")
```

작성 후 자가 점검:
- 잎 노드가 카테고리당 ≥2개인가? (얕으면 Phase 1 카운트가 흔들린다)
- "밖/" 가지에 분기 단어(if/switch/case/타입명)가 들어가 있지 않은가?
- "안/" 가지에 항목 이름(section/article/...)이 들어가 있지 않은가?
- 각 Don't 옆에 "왜 안 되는지" 한 줄 이유가 붙었는가?

자가 점검을 통과한 트리만 Phase 1로 가져간다.

## Phase 1. 동반 변경 분석 (Phase 0 검증)

Phase 0에서 고정한 안/밖 경계가 현재 코드에서 실제로 지켜지는지 **수량으로 검증한다**. 결론을 먼저 정하지 않는다.

```markdown
## OCP 점검

파일/범위: ____
변경 시나리오: "새 항목 ____를 추가하면?"

### 1. 분기 수집

| # | 위치 | 함수/모듈 | 분기 대상 | case/조건 수 | 소비자 여부 |
|---|------|-----------|----------|--------------|-------------|
| 1 | ____ | ____ | ____ | ____ | Y/N |

### 2. 수정 지점 수집

| # | 파일 | 함수/모듈 | 새 항목 추가 시 수정 내용 | 필수 정의 지점인가 |
|---|------|-----------|--------------------------|--------------------|
| 1 | ____ | ____ | ____ | Y/N |

동반 변경 지수: ____곳
추가 수정 지점: ____곳

### 3. 열린/닫힌 판단

| 분기 대상 | 열린/닫힌 | 값의 정의 소스 | 근거 |
|----------|----------|----------------|------|
| ____ | ____ | ____ | ____ |

### 4. 안/밖 누출 검사 (Phase 0 트리 대조)

| 누출 종류 | 위치 | Phase 0 트리 위반 가지 | 카운트 |
|-----------|------|------------------------|--------|
| 명령 누출 (밖에 분기) | ____ | 밖/____에 if/switch | ____ |
| 선언 매장 (안에 정의) | ____ | 안/____에 항목별 데이터 | ____ |

명령 누출 + 선언 매장 합계: ____

### 5. 결론

판정: OCP 위반 / 허용 / 보류
근거: ____ (수량 + 안/밖 누출 양쪽 인용)
다음 단계: ____
```

판정 기준:
- OCP 위반: 열린 집합 + (동반 변경 지수 2곳 이상 **또는** 안/밖 누출 1건 이상)
- 허용: 닫힌 집합, 또는 동반 변경 지수 1곳 이하 **이고** 안/밖 누출 0건
- 보류: 값의 정의 소스나 변경 시나리오가 불명확함

분석 결과를 사용자에게 보여주고 구조 설계로 넘어갈지 확인한다.

## Phase 2. 확장 구조 설계

목표는 "새 항목 추가 시 추가 수정 지점 0~1곳"이다. 새 추상화가 아니라 수정 지점 감소가 목적이다.

### 2-1. 확장 단위 정하기

동반 변경되는 속성들이 하나의 개념으로 수렴하는지 먼저 확인한다.

```markdown
묶으려는 속성: ____
한 문장 정의: "____의 ____를 정의한다"
수렴 여부: YES/NO
```

수렴하면 하나의 descriptor/strategy로 묶는다. 수렴하지 않으면 표현, 검증, 구조, 데이터 로딩처럼 책임별로 분리한다.

좋은 descriptor는 값 또는 함수를 받을 수 있어야 한다. 하위 분기(`variant`, `role`, `mode` 등)는 소비자에 남기지 말고 함수 필드 안으로 옮긴다.

```ts
type Descriptor<TData, TValue> = {
  tag?: string | ((data: TData) => string)
  className?: string | ((data: TData) => string)
  render?: (data: TData) => TValue
}

function resolve<TData, TValue>(
  field: TValue | ((data: TData) => TValue) | undefined,
  data: TData,
  fallback: TValue,
): TValue {
  if (field === undefined) return fallback
  return typeof field === "function"
    ? (field as (data: TData) => TValue)(data)
    : field
}
```

### 2-2. 패턴 선택

아래 순서로 검토한다. 먼저 가능한 가장 작은 구조를 고른다.

| 우선 | 패턴 | 추가 수정 지점 | 선택 기준 |
|------|------|----------------|-----------|
| 1 | Co-location | 0곳 | 항목의 정의 소스(스키마, 설정, 모델)에 descriptor를 함께 둘 수 있음 |
| 2 | `defineXxx` 자기 등록 | 0곳 | 정의 소스와 소비자 레이어가 분리되어 있고 항목별 등록 호출이 자연스러움 |
| 3 | Convention discovery | 0곳 | 항목별 독립 파일이 자연스럽고 `import.meta.glob` 같은 자동 수집이 프로젝트에 맞음 |
| 4 | Strategy | 0곳 | 항목별 행동이 복잡하거나 상태/라이프사이클을 가짐 |
| 5 | 수집 파일 1줄 | 1곳 | 자동 수집이 과하고 타입 안전이나 명시성이 더 중요함 |

선택 흐름:

```text
항목의 정의 소스가 있는가?
├─ YES: 정의 소스에 descriptor를 붙일 수 있는가?
│  ├─ YES: Co-location
│  └─ NO: defineXxx 또는 책임별 descriptor
└─ NO: 항목이 독립 모듈인가?
   ├─ YES: defineXxx 또는 Convention discovery
   └─ NO: Strategy 또는 수집 파일 1줄
```

### 2-3. 소비자 무분기 설계

소비자 함수는 타입 이름을 몰라야 한다. 허용되는 것은 범용 조회, `resolve`, fallback, 에러 처리뿐이다.

```ts
const registry = new Map<string, Descriptor<Data, ReactNode>>()

export function defineXxx(key: string, descriptor: Descriptor<Data, ReactNode>) {
  registry.set(key, descriptor)
}

export function getTag(data: Data) {
  return resolve(registry.get(data.type)?.tag, data, "div")
}
```

실패 예:

```ts
if (data.type === "section") return "section"
return registry.get(data.type)?.tag ?? "div"
```

### 2-4. 설계 검증

전환 전에 수정 지점을 다시 센다.

```markdown
설계한 구조에서 "새 항목 ____를 추가하면?"

| # | 수정 지점 | 어차피 필요한 정의 지점인가 | 추가 수정인가 |
|---|----------|----------------------------|---------------|
| 1 | ____ | Y/N | Y/N |

추가 수정 지점: ____곳
소비자 타입별 분기: 0개 / ____개
채택 여부: YES/NO
```

추가 수정 지점이 2곳 이상이거나 소비자 타입별 분기가 남으면 Phase 2를 다시 수행한다. 설계 결과를 사용자에게 보여주고 실행 동의를 받는다.

## Phase 3. 전환 실행

동의된 구조 안에서만 수정한다.

실행 순서:
1. descriptor/strategy 타입을 정의한다.
2. 값 또는 함수 필드를 처리하는 `resolve` 헬퍼를 만든다.
3. registry, `defineXxx`, discovery, strategy 중 선택한 확장 지점을 구현한다.
4. 기존 case별 값을 descriptor/strategy로 옮긴다.
5. 소비자 함수를 registry 조회 + `resolve` + fallback으로 교체한다.
6. 기존 import와 호출부를 최소 범위로 갱신한다.

검증:
1. 프로젝트의 정적 검증을 실행한다. 예: `tsc --noEmit`, `pnpm typecheck`, `npm run build`, `eslint`.
2. 소비자 함수에 타입별 `if`/`switch`/`case`와 특정 타입 이름 참조가 0개인지 확인한다.
3. 새 항목 추가 시 수정 지점이 0~1곳인지 다시 센다.
4. 항목 삭제 시 수정 지점도 0~1곳인지 센다.
5. 검증 실패 시 Phase 2로 돌아가 구조를 줄이거나 바꾼다.

보고:
- 원래 동반 변경 지수와 변경 후 수정 지점 수
- 선택한 패턴과 선택 이유
- 소비자 무분기 검증 결과
- 실행한 정적 검증과 결과
