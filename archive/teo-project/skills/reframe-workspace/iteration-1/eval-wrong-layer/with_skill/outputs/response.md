# /reframe -- Combobox 필터링

코드 수정을 중단합니다.

## Step 1: 지금까지의 흐름

1. **필터 조건 변경** (`getVisibleNodes` 내부 조건문 수정) — 결과: 일부 케이스만 개선, 다른 케이스 깨짐
2. **정렬 순서 변경** (`getVisibleNodes` 반환값 정렬 로직 수정) — 결과: 순서는 바뀌었지만 필터링 자체는 여전히 이상
3. **캐시 무효화 추가** (`getVisibleNodes`에 캐시 버스팅) — 결과: 성능만 나빠지고 필터링 결과 동일. 여기서 멈춤

패턴: **세 번 모두 `getVisibleNodes`만 건드렸다.** 조건, 정렬, 캐시 -- 같은 함수 안에서 다른 측면을 반복 수정하고 있다. 수정할수록 문제가 번지고 있다.

## Step 2: 재정의 -- 6요소 재점검

| 요소 | 재점검 결과 | 기존 가정과 다른 점 |
|------|-------------|---------------------|
| **목적** | Combobox에서 사용자가 텍스트를 입력하면 매칭되는 옵션만 보여주고 싶다 | 변함없음 |
| **이상적 결과** | 입력값에 따라 옵션 리스트가 즉시 필터링되어 표시된다 | 변함없음 |
| **현실** | `getVisibleNodes`를 세 번 고쳤지만 필터링 결과가 여전히 안 맞는다 | **`getVisibleNodes`는 engine 레이어의 범용 순회 함수다.** Combobox 필터링이라는 도메인 로직을 넣을 자리가 아닐 수 있다 |
| **문제** | 진짜 갭: 필터링 로직이 올바른 레이어에 없다. `getVisibleNodes`는 visibility 상태를 읽는 함수이지, 필터 조건을 결정하는 함수가 아니다 | **기존 가정: "필터링 결과가 이상하니까 필터링하는 함수를 고치면 된다"고 생각했지만, `getVisibleNodes`는 필터를 적용하는 곳이지 필터를 정의하는 곳이 아니다** |
| **원인** | Combobox의 필터 상태(입력 텍스트)가 store/axis의 VisibilityFilter로 올바르게 전달되지 않거나, 애초에 Combobox 패턴이 자체 VisibilityFilter를 소유하지 않고 있을 가능성이 높다 | **고치고 있던 곳(engine의 순회)이 아니라 데이터를 넣는 곳(axis 또는 pattern의 VisibilityFilter 선언)이 문제다** |
| **목표** | Combobox 패턴의 VisibilityFilter 선언부, 또는 input 값 → filter 상태 연결부 | **`getVisibleNodes` 함수 내부가 아니라, 그 함수에 입력을 공급하는 상위 레이어** |

## Step 3: 진단 -- 왜 헤맸는가

**의존 방향 오류.** "필터링 결과가 이상하다" → "`getVisibleNodes`를 고치자"로 직행했지만, `getVisibleNodes`는 VisibilityFilter를 받아서 순회하는 하류 함수다. 문제는 상류(필터를 정의하고 전달하는 쪽)에 있는데 하류(필터를 실행하는 쪽)만 반복 수정했다.

## Step 4: 새 방향 제안

### 재정의된 문제

Combobox의 입력값이 VisibilityFilter로 올바르게 변환/전달되지 않아서, `getVisibleNodes`가 잘못된 필터 조건으로 순회하고 있다.

### 새 접근

1. Combobox 패턴(`src/interactive-os/pattern/`)에서 VisibilityFilter가 어떻게 선언되어 있는지 확인한다
2. input의 value 변경이 VisibilityFilter 업데이트로 이어지는 경로를 추적한다 (axis의 value 축 → filter 연결)
3. 필터 조건 자체가 아니라 **필터 조건이 전달되는 배관**을 점검한다

### 기존 접근과의 차이

기존: `getVisibleNodes` 내부 로직을 반복 수정 (하류, engine 레이어)
새 접근: VisibilityFilter 선언과 input → filter 연결을 점검 (상류, axis/pattern 레이어)

---

이 재정의가 맞는지 확인해주세요. 세 번 틀린 뒤라 이 방향도 틀릴 수 있습니다. Combobox 패턴의 VisibilityFilter 선언부를 같이 보면서 판단하면 좋겠습니다.
