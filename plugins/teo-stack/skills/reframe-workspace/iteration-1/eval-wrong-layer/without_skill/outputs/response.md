# Combobox 필터링 문제 — 방향 재검토

## 현상 요약

getVisibleNodes를 세 번 수정했지만 필터링이 여전히 안 맞는 상황:
1. 필터 조건 변경
2. 정렬 순서 변경
3. 캐시 무효화 추가

세 번의 수정이 모두 같은 레이어(getVisibleNodes)를 건드렸다는 점이 핵심 신호입니다.

## 진단: 잘못된 레이어를 고치고 있을 가능성

getVisibleNodes는 engine 레이어의 순회 함수입니다. Combobox 필터링이 "이상하다"는 증상은 여러 레이어에서 발생할 수 있습니다:

1. **Store 레이어**: 필터링 대상 데이터(NormalizedData) 자체가 올바른가? 노드가 정규화될 때 parentId/children 관계가 맞는가?
2. **Engine 레이어 (현재 수정 중)**: getVisibleNodes의 순회 로직
3. **Axis 레이어**: Combobox가 사용하는 축(navigate, value 등)의 VisibilityFilter가 올바른가?
4. **Pattern 레이어**: composePattern에서 Combobox 패턴이 올바른 축을 조합하고 있는가?
5. **UI 레이어**: Combobox 컴포넌트가 input value를 engine에 올바르게 전달하고 있는가?

## 의심해야 할 방향

"필터링 결과가 이상하다"는 대부분 **입력(input value)이 engine에 도달하는 경로** 또는 **필터 기준이 선언된 위치**의 문제입니다:

### 가설 A: 필터 입력값 전달 문제 (UI → Engine)
Combobox의 텍스트 입력이 engine의 필터 상태에 반영되는 경로를 확인하세요. input의 onChange가 command를 통해 store를 업데이트하고 있는지, 아니면 React state로 우회하고 있는지.

### 가설 B: VisibilityFilter 선언 위치 (Axis)
각 축이 VisibilityFilter를 소유합니다. Combobox에서 필터링은 navigate 축이나 value 축의 VisibilityFilter에서 처리되어야 합니다. getVisibleNodes 자체를 수정하는 것은 범용 순회 로직을 특정 패턴에 맞추려는 시도이므로 방향이 틀립니다.

### 가설 C: 데이터 구조 문제 (Store)
필터링 대상 텍스트가 노드의 어떤 필드에 있는지. label인지 value인지, 또는 별도 검색용 필드가 있는지. NormalizedData의 노드 구조를 확인하세요.

## 권장 행동

1. **getVisibleNodes 수정 세 번 모두 되돌리세요.** 범용 순회 함수를 건드리는 것은 다른 패턴(TreeGrid, ListBox 등)에 부작용을 줄 수 있습니다.
2. **증상을 먼저 정확히 재현하세요.** "이상하다"가 구체적으로 뭔지 — 노드가 안 나오는지, 순서가 틀린지, 관계없는 노드가 나오는지.
3. **데이터 흐름을 역추적하세요.** input value → command → store → axis VisibilityFilter → getVisibleNodes → 렌더링. 어디서 기대와 달라지는지 각 단계의 출력을 확인하세요.
4. **축의 VisibilityFilter를 먼저 의심하세요.** Combobox 패턴이 사용하는 축에서 필터 조건이 올바르게 선언되어 있는지 확인하세요.

## 핵심

같은 곳을 세 번 고쳤는데 안 된다면, 고치는 곳이 틀린 겁니다. getVisibleNodes는 "보이는 노드를 순회"하는 함수이지, "어떤 노드가 보여야 하는지 결정"하는 함수가 아닙니다. 결정은 축의 VisibilityFilter가 합니다.
