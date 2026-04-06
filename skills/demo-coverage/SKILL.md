---
name: demo-coverage
description: 소스 코드를 읽고 분기 맵을 추출하여 데모 컴포넌트와 커버리지 테스트를 생성·검증하는 코드-first 루프. "데모 커버리지", "커버리지 올려", "데모 만들어", "/demo-coverage" 등을 말할 때 사용. 라우트별 반복 호출 가능. 인자로 axis 이름이나 소스 경로를 받을 수 있다.
---

## 역할

소스 코드의 모든 분기를 시연하는 데모와 테스트를 코드-first로 생성한다. "커버리지를 올린다"가 아니라 **"코드가 하는 일을 빠짐없이 보여준다"**가 목적이다. 커버리지 수치는 사후 검증 도구일 뿐.

## 왜 코드-first인가

데모-first(데모 작성 → 커버리지 측정 → 갭 발견)는 "왜 이 branch가 안 탔는지"를 추측해야 한다. 코드-first는 소스의 분기 구조에서 시나리오를 도출하므로, 커버 불가 분기(default-arg, envLimit)를 선제적으로 분류할 수 있다.

## 입력

인자로 다음 중 하나를 받는다:
- axis 이름: `navigate`, `tab`, `expand` 등
- 소스 파일 경로: `src/interactive-os/axis/navigate.ts`
- 없으면: `node scripts/axisScorecard.mjs`로 worst-first 자동 선택

## Step 1: 소스 코드 읽기 + 분기 맵 추출

대상 소스 파일을 읽고, **모든 결정 지점**을 추출하여 분기 맵을 작성한다.

### 추출 대상

| 코드 패턴 | 분기 맵 표현 |
|-----------|-------------|
| `if (condition)` | B{n}a: condition=true, B{n}b: condition=false |
| `condition ? A : B` | B{n}a: truthy→A, B{n}b: falsy→B |
| `A ?? B` | B{n}a: A가 non-nullish, B{n}b: A가 nullish (default-arg) |
| `A \|\| B` | B{n}a: A가 truthy, B{n}b: A가 falsy |
| `switch/case` | 각 case가 하나의 분기 |

### 분류

각 분기를 세 유형으로 분류한다:

| 유형 | 설명 | 행동 |
|------|------|------|
| **actionable** | 데모에서 옵션/인터랙션으로 커버 가능 | 시나리오 작성 |
| **default-arg** | `??` 연산자의 undefined 경로. 명시적 옵션 전달 시 구조적으로 불가 | 스킵 — 의미 있는 동작 차이 없음 |
| **envLimit** | happy-dom 한계로 실행 불가 (IntersectionObserver, scope 전환 등) | 스킵 — 표시만 |

### 출력 형식

```markdown
## 분기 맵: {파일명}

### 옵션 인터페이스
| 옵션 | 타입 | 기본값 | 데모 토글 |
|------|------|--------|----------|

### 분기
| ID | Line | 조건 | true 경로 | false 경로 | 유형 |
|----|------|------|----------|-----------|------|
| B0 | 9 | options?.mode ?? 'arrow' | 명시적 값 | undefined→'arrow' | default-arg |
| B1 | 11 | mode === 'enter-esc' | enter-esc keyMap | arrow keyMap | actionable |
```

## Step 2: 시나리오 도출

actionable 분기마다 하나의 시나리오를 작성한다.

```markdown
### 시나리오
| # | 모드/옵션 | 상태 | 입력 | 분기 | 검증 (DOM 상태) |
|---|----------|------|------|------|----------------|
```

시나리오의 **검증** 열은 반드시 DOM에서 관찰 가능한 상태여야 한다:
- `aria-expanded="true"` / `"false"`
- `tabindex="0"` 이동 (어느 data-node-id로)
- `aria-selected="true"` / `"false"`
- `contenteditable` 존재
- 요소 개수 변화

## Step 3: 데모 컴포넌트 확인/생성

### 데모가 있을 때
기존 데모(`src/pages/axis/{Name}Demo.tsx`)를 읽고, 분기 맵의 모든 actionable 분기가 데모 토글로 접근 가능한지 확인한다. 빠진 옵션이 있으면 토글을 추가한다.

### 데모가 없을 때 (MISSING_DEMO)
기존 데모 패턴을 따라 새로 생성한다:

```
패턴:
1. useState로 옵션별 상태
2. composePattern(patternSpec, axis(options), ...) 로 behavior 구성
3. <div className="page-keys"> 컨트롤 (select/checkbox)
4. <div className="page-keys"> 키 힌트 (옵션에 따라 변화)
5. <div className="card"> <Aria behavior={behavior} ...>
```

필수 import:
- axis 함수 (`../../interactive-os/axis/{name}`)
- navigate (arrow key 지원용, 대부분의 데모에 필요)
- composePattern, Aria, core, focusRecovery
- axisListData 또는 axisTreeData (데이터 구조에 따라)

## Step 4: 커버리지 테스트 생성

파일명: `src/interactive-os/__tests__/{name}-demo-coverage.integration.test.tsx`

### 구조

```typescript
/**
 * Demo coverage: {Name}Demo → {name}.ts
 * // V2: 2026-03-25-demo-coverage-loop-prd.md
 *
 * 코드에서 도출한 분기 맵:
 *   {분기 요약}
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Name}Demo from '../../pages/axis/{Name}Demo'

describe('{Name}Demo coverage', () => {
  // 모드/옵션별 describe 블록
  // 시나리오별 it 블록
  // 각 it에 최소 1개 DOM assertion
})
```

### 규칙

- **분기 ID를 주석으로 표시**: `// B{n}: {조건 설명}`
- **assertion은 DOM 상태만**: role, tabindex, aria-*, data-* 속성
- **mock 호출 검증 금지**: `toHaveBeenCalled` 등 사용하지 않음
- **helper 함수로 모드 전환 추출**: 같은 모드 전환이 반복되면 함수로

## Step 5: 실행 + 검증

```bash
# 1. 테스트 실행 + 커버리지 수집
pnpm vitest run --coverage src/interactive-os/__tests__/{name}-demo-coverage.integration.test.tsx

# 2. 스코어카드
node scripts/axisScorecard.mjs
```

### 결과 판정

| composite | 판정 |
|-----------|------|
| 100% | 완벽 — 모든 actionable 분기 커버 |
| ≥ 80% | 양호 — 잔여는 default-arg/envLimit일 가능성 높음 |
| < 80% | actionable 분기 누락 — Step 2로 돌아가 시나리오 추가 |

미커버 분기를 확인할 때:
```bash
node -e "
const cov=require('./coverage/coverage-final.json');
const e=Object.entries(cov).find(([k])=>k.includes('{name}.ts')&&!k.includes('types'));
const src=require('fs').readFileSync('src/interactive-os/axis/{name}.ts','utf8').split('\\n');
Object.entries(e[1].branchMap).forEach(([id,bm])=>{
  e[1].b[id].forEach((h,i)=>{
    if(h===0) console.log('branch '+id+'['+i+'] line '+(bm.locations?.[i]?.start?.line||bm.line)+': '+src[(bm.locations?.[i]?.start?.line||bm.line)-1]?.trim());
  });
});
"
```

## Step 6: 리포트

```markdown
## {name} 데모 커버리지 리포트

### 분기 맵
{Step 1 출력}

### 시나리오 → 테스트 매핑
| 시나리오 | it 블록 | 결과 |
|----------|--------|------|

### 커버리지
| Metric | Before | After |
|--------|--------|-------|
| composite | {이전}% | {이후}% |

### 미커버 분류
| Line | 분기 | 유형 | 이유 |
|------|------|------|------|
```

## 반복 호출

인자 없이 호출하면 axisScorecard의 worst-first 순서로 다음 대상을 자동 선택한다. 모든 축이 composite ≥ 80%이면 "All axes above threshold" 출력 후 종료.

## MD 문서 (MISSING_DEMO일 때)

데모 컴포넌트 생성 시 `docs/2-areas/` 에 대응하는 MD 파일도 생성한다. routeConfig에 `md:` 필드가 있으면 해당 경로, 없으면 `{layer}/{name}.md`.
