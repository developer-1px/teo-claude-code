---
name: screen-test
description: 제품 수준 화면 검증 테스트 작성. 사용자 입력(click/keyboard) → 화면 변화(라우트/DOM 시각 상태) 검증. 소스 코드 구조와 무관하게 요구사항을 검증한다. 개발 사이클 완료 후 TDD 메커니즘 테스트를 제품 수준으로 승격할 때, 또는 "화면 테스트", "통합 테스트 만들어", "이 기능 테스트", "/screen-test" 등을 말할 때 사용.
---

## 역할

**소스 코드가 아니라 요구사항을 검증하는 테스트**를 작성한다.

개발 중 TDD가 만드는 테스트는 메커니즘을 검증한다 — "이 command가 store를 올바르게 바꾸는가?" 이 테스트는 리팩토링하면 깨진다. 구현이 바뀌면 테스트도 바뀌어야 한다.

이 스킬이 만드는 테스트는 요구사항을 검증한다 — "사용자가 이걸 클릭하면 화면이 이렇게 바뀌는가?" 구현이 어떻게 바뀌든, 요구사항이 충족되면 테스트는 통과한다.

## 원칙

### 입력: 사용자 동작만

```ts
// ✅ 사용자가 할 수 있는 동작
await user.click(element)
await user.keyboard('{Enter}')
await user.type(input, 'hello')
element.focus()

// ❌ 코드의 구조적 사용
engine.dispatch(command)
store.entities[FOCUS_ID]
ctx.activate()
```

### 출력: 화면에서 관찰 가능한 것만

```ts
// ✅ 화면에서 보이는 것
expect(location.pathname).toBe('/viewer')           // 라우트 변경
expect(el.getAttribute('aria-expanded')).toBe('true') // ARIA 상태
expect(el.textContent).toContain('Hello')            // 텍스트 내용
expect(el).toHaveAttribute('data-focused', '')       // 시각 상태
expect(container.querySelectorAll('[role="option"]')).toHaveLength(3)  // 요소 개수

// ❌ 내부 데이터
expect(store.entities.foo.data.name).toBe('bar')    // store 내부
expect(onActivate).toHaveBeenCalledWith('viewer')    // mock 호출
expect(focusedId).toBe('viewer')                     // 내부 상태
```

### 셀렉터: ARIA role과 사용자 가시 속성만

```ts
// ✅ 사용자가 인지하는 것
container.querySelector('[role="button"]')
container.querySelector('[aria-label="Navigation"]')
container.querySelector('[data-node-id="viewer"]')  // 앱의 식별자

// ❌ 구현 의존
container.querySelector('.activity-bar__item--active')  // CSS class
container.querySelector('Aria.Item')                     // 컴포넌트 이름
```

## 테스트 작성 절차

### Step 1: 대상 화면과 user journey 식별

변경된 코드가 영향 주는 **라우트/화면**을 식별한다:
- git diff에서 변경 파일 → 어떤 라우트에 속하는지 확인
- 해당 라우트의 핵심 user journey를 나열 (1~3개)

핵심 user journey = **"사용자가 이 화면에서 당연히 되어야 하는 것"**

예시:
- ActivityBar: "아이템 클릭 → 해당 라우트로 이동"
- TreeGrid: "행 클릭 → 행 선택 + 디테일 패널 표시"
- Combobox: "텍스트 입력 → 드롭다운 필터링"

### Step 2: 테스트 파일 위치 결정

라우트 단위로 조직한다:
```
src/__tests__/route-{routeName}.screen.test.tsx
```

같은 라우트의 테스트는 한 파일에 누적한다. 이미 있으면 추가, 없으면 생성.

### Step 3: 테스트 구조

```tsx
// @test-harness — 라우터 통합 필요
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom'
import AppShell from '../AppShell'  // 또는 해당 Page 컴포넌트

let currentPath = '/'

function LocationTracker() {
  const { pathname } = useLocation()
  currentPath = pathname
  return null
}

function renderAt(path: string) {
  const router = createMemoryRouter(
    [{ element: <AppShell />, children: [{ path: '*', element: <LocationTracker /> }] }],
    { initialEntries: [path] },
  )
  return render(<RouterProvider router={router} />)
}

describe('화면: [화면 이름]', () => {
  it('[user journey 한 줄 설명]', async () => {
    const user = userEvent.setup()
    const { container } = renderAt('/path')

    // 1. 요소 찾기 — ARIA role 또는 data 속성
    const element = container.querySelector('[role="..."]') as HTMLElement

    // 2. 사용자 동작
    await user.click(element)

    // 3. 화면 변화 검증
    await waitFor(() => {
      expect(/* 화면에서 관찰 가능한 것 */).toBe(/* 기대값 */)
    })
  })
})
```

### Step 4: 검증 — 코드 구조 의존 확인

작성한 테스트를 점검한다:

- [ ] import에 pages/AppShell 이외의 소스 파일이 있는가? → 있으면 제거
- [ ] store, engine, command, ctx 등 내부 API를 사용하는가? → 있으면 사용자 동작으로 대체
- [ ] CSS class로 셀렉팅하는가? → ARIA role/data 속성으로 대체
- [ ] mock이 있는가? → 제거 (실제 컴포넌트 렌더링)
- [ ] **이 테스트가 내부 구현을 완전히 리팩토링해도 통과하는가?** → 아니면 다시 작성

## 판단 기준: 어떤 journey를 테스트하나

모든 기능을 테스트하지 않는다. **깨지면 사용자가 즉시 알아차리는 것**만:

| 테스트 O | 테스트 X |
|----------|----------|
| 클릭 → 라우트 이동 | 키보드 단축키 조합 |
| 검색 입력 → 결과 필터링 | 드롭다운 정확한 개수 |
| 폼 제출 → 성공 표시 | 내부 validation 규칙 |
| 토글 → 상태 변경이 화면에 반영 | expand/collapse 애니메이션 |

경험 법칙: **"이 기능 소개할 때 처음 보여줄 동작이 뭔가?"** — 그게 테스트 대상.
