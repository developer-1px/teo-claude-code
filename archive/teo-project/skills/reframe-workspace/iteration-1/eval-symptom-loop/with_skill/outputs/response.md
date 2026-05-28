# Reframe: TreeGrid 포커스 소실 버그

## Step 1: 멈춤 — 지금까지의 흐름

코드 수정을 중단한다.

```
1. setTimeout 타이밍 조절 (focusRecovery 플러그인) — 결과: 동일 증상
2. useEffect deps 변경 — 결과: 동일 증상
3. ref 캐싱 — 결과: 동일 증상, 여기서 멈춤
```

**패턴**: 같은 증상(포커스 소실)을 세 가지 다른 방법으로 반복 수정하고 있다. 세 시도 모두 "포커스를 복구하는 쪽"을 만지고 있다. 결과가 똑같다는 것은 고치고 있는 곳이 원인이 아니라는 뜻이다.

---

## Step 2: 재정의 — 원래 문제를 다시 본다

| 요소 | 재점검 결과 | 기존 가정과 다른 점 |
|------|-------------|---------------------|
| **목적** | TreeGrid에서 특정 조작 후 포커스가 사라지지 않아야 한다 | 변함없음 |
| **이상적 결과** | 어떤 조작을 해도 포커스가 항상 visible한 노드 위에 있다 | 변함없음 |
| **현실** | focusRecovery가 실행은 되지만 포커스가 복구되지 않는다 | **focusRecovery가 "안 도는" 게 아니라 "돌아도 안 되는" 것**. 타이밍/deps/ref 문제가 아닐 가능성 |
| **문제** | 이상-현실 갭: 복구 대상 노드 자체가 유효하지 않거나, 포커스를 빼앗는 다른 주체가 있다 | **기존 가정: focusRecovery 내부 로직이 문제. 실제 갭: focusRecovery의 입력(visible nodes) 또는 focusRecovery 이후에 포커스를 다시 빼앗는 무언가가 문제** |
| **원인** | 후보 1: store 업데이트 후 getVisibleNodes가 삭제된 노드를 반환하여 recovery 대상이 없음. 후보 2: React 리렌더링이 recovery 이후에 DOM을 교체하여 포커스가 날아감. 후보 3: 다른 useEffect가 recovery 이후에 focus()를 호출 | **세 시도 모두 "recovery 함수 내부"만 봤다. recovery의 상류(입력 데이터)와 하류(이후 실행되는 것)를 전혀 보지 않았다** |
| **목표** | focusRecovery 플러그인 내부가 아니라, recovery 전후의 데이터 흐름과 실행 순서를 추적해야 한다 | **수정 지점이 focusRecovery 파일 바깥에 있을 수 있다** |

---

## Step 3: 진단 — 왜 헤맸는가

**증상-원인 혼동**: "포커스가 사라진다 → focusRecovery가 문제다"로 곧장 뛰어들어, recovery 내부만 세 번 고쳤다. 그러나 recovery는 "포커스를 되살리는 쪽"이지 "포커스를 죽이는 쪽"이 아니다. 죽이는 쪽을 찾지 않고 살리는 쪽만 고치고 있었다.

---

## Step 4: 새 방향 제안

### 재정의된 문제

focusRecovery가 작동하지 않는 것이 아니라, **포커스를 소실시키는 원인이 따로 있고 recovery보다 나중에 실행된다** (또는 recovery에 유효한 대상 노드가 전달되지 않는다).

### 새 접근

1. **포커스를 빼앗는 주체를 찾는다**: `document.activeElement`를 콘솔에서 추적하거나, `focus`/`blur` 이벤트에 breakpoint를 걸어 recovery 이후에 누가 focus()를 호출하는지 확인한다.
2. **getVisibleNodes 반환값을 확인한다**: recovery 시점에 삭제/숨김된 노드가 recovery 후보에서 이미 빠져 있는지, 또는 아직 stale한 목록을 보고 있는지 확인한다.
3. **React 리렌더 타이밍을 확인한다**: store 업데이트 → React 리렌더 → DOM 교체가 recovery 이후에 일어나면, recovery가 focus()한 DOM 노드가 새 노드로 교체되면서 포커스가 날아간다. 이 경우 recovery 타이밍이 아니라 **DOM 안정성**(key prop, 불필요한 언마운트)이 문제다.

### 기존 접근과의 차이

기존: focusRecovery **내부**(setTimeout, deps, ref)를 수정 → "살리는 쪽"을 더 잘 살리려 함
새 접근: focusRecovery **외부**(누가 죽이는가, 입력 데이터가 유효한가, DOM이 교체되는가)를 조사 → "죽이는 쪽"을 찾아 제거

---

이 방향이 맞는지 확인해 줘. 세 번 틀린 뒤의 재정의라 이것도 틀릴 수 있다 -- 네 판단이 필요하다.
