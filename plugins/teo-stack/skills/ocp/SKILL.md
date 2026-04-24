---
name: ocp
description: 파일의 개방-폐쇄 원칙(OCP)을 점검하고 리팩토링을 수행한다. "switch 너무 많다", "분기 정리", "선언적 맵", "OCP", "/ocp" 등으로 트리거된다. 변경 시 함께 수정되는 곳을 파악하고, 수정 지점을 1곳으로 줄이는 확장 구조를 설계하는 것이 핵심이다.
---

## 목적

변경이 발생할 때 **함께 수정되는 곳이 2곳 이상**이면, 수정 지점을 **1곳으로 줄이는 구조**를 설계하고 전환한다.

"switch를 없애라"가 아니다. 닫힌 집합의 switch는 건드리지 않는다. **열린 집합의 분기가 여러 곳에 산재**할 때만 동작한다.

## 안티패턴 경고

**거대 Record/Map 리터럴은 OCP가 아니다.** switch를 `Record<string, Descriptor>`로 옮기면:
- 여전히 한 파일을 열어서 수정해야 함 (switch와 본질이 같음)
- JSX/함수를 데이터인 척 넣으면 가독성이 더 나빠짐

**명시적 import 목록도 OCP가 아니다.** index.ts에 import + 맵 엔트리를 수동으로 추가해야 하면 수정 지점이 여전히 2곳(파일 생성 + index 수정).

**소비자 함수에 타입별 분기가 남아있으면 OCP가 아니다.** 소비자가 `if (type === 'section')` 같은 분기를 갖고 있으면, 새로운 "특수 타입"을 추가할 때 소비자를 수정해야 한다. 소비자는 **registry.get(key)만 하고, 타입별 로직은 descriptor가 소유해야 한다.**

**진짜 OCP = 확장 시 기존 코드 수정 없이, 또는 최대 1곳만 수정하여 동작하는 구조.**

## 동작: 3 Phase

### Phase 1: 동반 변경 분석 (빈칸 채우기)

SRP처럼 **사실을 먼저 수집**하고, 판단은 나중에 한다.

```
## OCP 점검

파일: ____

### 1-1. 분기 수집 (사실)

이 파일의 모든 switch/if-else 체인:
| # | 위치 | 함수명 | 분기 대상 | case 수 |
|---|------|--------|----------|---------|

### 1-2. 변경 시나리오 (사실)

"새 항목 X를 추가하면 어디를 수정해야 하는가?"

| 수정 지점 | 파일 | 함수 | 수정 내용 |
|----------|------|------|----------|

동반 변경 지수: ____곳

### 1-3. 열린/닫힌 판단 (추론)

| 분기 대상 | 열린/닫힌 | 근거 (값의 정의 소스 추적) |
|----------|----------|------------------------|

### 1-4. 결론

| 판정 | 조건 |
|------|------|
| **OCP 위반** | 열린 집합 + 동반 변경 2곳 이상 |
| **허용** | 닫힌 집합, 또는 동반 변경 1곳 이하 |
```

**핵심: 동반 변경 지수가 2 이상이고 열린 집합일 때만 Phase 2로 진행.**

분석 결과를 사용자에게 보여주고 확인을 받는다.

### Phase 2: 확장 구조 설계

**목표: 새 항목 추가 시 수정 지점을 최대 1곳으로 줄이는 구조.**

#### 2-1. 확장 단위 결정

새 항목이 추가될 때 **무엇이 하나의 단위인가?** 동반 변경되는 속성들을 묶어서 descriptor 타입을 설계한다.

```typescript
// 여러 switch에 흩어진 속성 → 하나의 descriptor로 통합
type XxxDescriptor = {
  // switch A에서 반환하던 것
  // switch B에서 반환하던 것
  // switch C에서 반환하던 것
}
```

**descriptor 필드는 값 또는 함수를 받을 수 있게 설계한다.** 타입마다 하위 분기(variant, role 등)가 있으면, 그 분기 로직을 descriptor의 함수 필드에 넣어서 소비자에서 분기를 제거한다.

```typescript
// 나쁜 예: 소비자가 타입별 분기를 소유
function getTag(data) {
  if (data.type === 'section') return data.variant === 'footer' ? 'footer' : 'section'
  if (data.type === 'text') return roleTagMap[data.role] ?? 'span'
  return registry.get(data.type)?.tag ?? 'div'  // 여전히 닫혀있음!
}

// 좋은 예: descriptor가 로직을 소유, 소비자는 조회만
type Descriptor = {
  tag?: TagValue | ((data) => TagValue)  // 값 또는 함수
}
function getTag(data) {
  const desc = registry.get(data.type)
  return resolve(desc?.tag, data) ?? 'div'  // 타입을 모르는 범용 조회
}
// section의 variant 분기는 defineXxx('section', { tag: (d) => ... }) 안에
```

#### 2-2. 개념 수렴 검증

descriptor로 묶기 전에, 동반 변경되는 속성들이 **하나의 개념으로 수렴하는지** 확인한다. 수렴하지 않으면 `defineXxx`로 묶어도 God Object가 된다.

```
묶으려는 속성들: ____

이것들을 한 문장으로 설명할 수 있는가?
→ "____의 ____를 정의한다"

YES → 하나의 descriptor로 통합
NO  → 별개 개념이므로 별도 define 함수로 분리하거나, 묶는 범위를 재조정
```

**예시:**
- `tag + className + render` → "노드 타입의 **표현(presentation)**을 정의한다" → 수렴 O
- `tag + className + render + validation + childRules` → 표현 + 검증 + 구조 → 수렴 X, 관심사 분리 필요

#### 2-3. 해결 패턴 선택

Phase 1의 동반 변경 분석 결과를 보고, 아래 정석 패턴 중 적합한 것을 선택한다. **판단 기준은 "추가 수정 지점"이다.**

| # | 패턴 | 추가 수정 | 원리 | 적합한 경우 |
|---|------|----------|------|-----------|
| 1 | **Co-location** | 0곳 | 이미 수정하는 곳(스키마/설정)에 descriptor를 함께 둠 | 항목 정의 소스가 명확할 때 (스키마, 설정 객체 등) |
| 2 | **자기 등록 (defineXxx)** | 0곳 | 각 항목이 `defineXxx(key, descriptor)` 호출로 등록 | Co-location이 레이어 제약으로 불가할 때, 또는 정의 소스가 분산될 때 |
| 3 | **Convention Discovery** | 0곳 | 디렉토리/네이밍 규칙으로 자동 수집 (`import.meta.glob`) | 항목마다 독립 파일이 자연스러울 때 |
| 4 | **Strategy (다형성)** | 0곳 | 공통 인터페이스 + 각 구현이 독립 클래스/함수 | 항목별 행동이 복잡하고 상태를 가질 때 |
| 5 | **수집 파일 1줄** | 1곳 | 파일 추가 + index에 import 1줄 | 자동 수집이 과하고 타입 안전이 중요할 때 |

**패턴 1(Co-location)을 먼저 검토한다.** 이유: 열린 집합의 항목은 어딘가에서 정의되고 있다. 그 정의 지점에 descriptor를 co-locate하면 추가 수정 지점이 0이다. 다른 패턴은 co-location이 불가능할 때 검토한다.

**선택 흐름:**
```
항목의 정의 소스가 있는가? (스키마, 설정, enum 등)
├─ YES → Co-location (패턴 1)
│         "정의 소스에 descriptor를 붙일 수 있는가?"
│         ├─ YES → 채택 (수정 0곳)
│         └─ NO (레이어 위반, 타입 제약 등)
│              → defineXxx (패턴 2): 등록 함수를 만들어 각 항목이 호출
│                "descriptor가 하나의 개념으로 수렴하는가?" (2-2에서 검증 완료)
│                ├─ YES → 채택 (수정 0곳)
│                └─ NO → 개념별로 defineXxx를 분리
└─ NO → 정의가 분산됨
          "각 항목이 독립 모듈인가?"
          ├─ YES → defineXxx(2) 또는 Convention(3)
          └─ NO → Strategy(4) 또는 수집파일(5)
```

**defineXxx 패턴 구현:**

```typescript
// 1. descriptor 타입 — 필드는 값 또는 함수
type XxxDescriptor = {
  tag?: string | ((data: Data) => string)
  className?: string | ((data: Data) => string)
  render?: (data: Data, ctx: Ctx) => ReactNode
}

// 2. 등록 함수 + 내부 registry
const registry = new Map<string, XxxDescriptor>()

export function defineXxx(key: string, desc: XxxDescriptor) {
  registry.set(key, desc)
}

// 3. resolve 헬퍼 — 값이면 그대로, 함수면 호출
function resolve<T>(field: T | ((data: Data) => T) | undefined, data: Data, fallback: T): T {
  if (field === undefined) return fallback
  return typeof field === 'function' ? (field as (data: Data) => T)(data) : field
}

// 4. 소비자 — 타입별 분기 없이 registry 조회만
export function getTag(data: Data) {
  return resolve(registry.get(data.type)?.tag, data, 'div')
}
export function getClassName(data: Data) {
  return resolve(registry.get(data.type)?.className, data, '')
}

// 5. 등록 — 각 항목이 독립적으로 호출
defineXxx('badge', { tag: 'div', className: 'badge-class', render: ... })
defineXxx('section', {
  tag: (data) => data.variant === 'footer' ? 'footer' : 'section',  // 하위 분기는 함수로
  className: (data) => sectionClassMap[data.variant] ?? '',
})
```

이 패턴의 핵심:
- **소비자에 타입별 if/switch가 없다** — 모든 분기는 descriptor의 함수 필드 안에
- **소비자도, 수집 파일(index.ts)도 수정할 필요 없이, `defineXxx` 호출만 추가하면 확장된다**
- **하위 분기(variant, role 등)도 descriptor 함수로 처리** — 소비자가 특수 타입을 알 필요 없음

#### 2-4. 구조 설계 + 수정 지점 검증

선택한 패턴으로 구체적 구조를 설계한 뒤, **반드시 수정 지점을 다시 센다:**

```
설계한 구조에서 "새 항목 X를 추가하면?"

수정 지점:
1. ____ (이것은 어차피 수정해야 하는 곳인가? Y/N)
2. ____ (추가 수정인가? Y/N)

추가 수정 지점: ____곳 (1 이하여야 함)
```

**추가 수정 지점이 2곳 이상이면 패턴을 다시 선택한다.**

분석 결과를 사용자에게 보여주고 **구조에 대한 확인**을 받는다.

### Phase 3: 전환 실행

사용자가 구조에 동의하면, 실행한다.

#### 실행 순서

1. descriptor 타입 정의 (필드는 값 | 함수)
2. resolve 헬퍼 작성 (값이면 반환, 함수면 호출)
3. registry + defineXxx 함수 작성
4. 기존 switch/if의 각 case를 독립적인 `defineXxx()` 호출로 변환
5. 소비자(기존 switch 함수들)를 registry 조회 + resolve로 교체
6. typecheck 실행

#### 검증

리팩토링 완료 후:
1. `pnpm typecheck` — 타입 검증
2. **소비자 무분기 검증**: 소비자 함수에 타입별 if/switch/case가 **0개**인가? 소비자가 특정 타입 이름을 알고 있으면 실패.
3. **변경 시나리오 재검증**: "새 항목 추가 시 수정 지점이 0~1곳인가?"
4. **삭제 시나리오**: "항목 삭제 시 수정 지점이 0~1곳인가?"
5. 검증 실패 시 Phase 2로 돌아가서 구조를 재설계한다
