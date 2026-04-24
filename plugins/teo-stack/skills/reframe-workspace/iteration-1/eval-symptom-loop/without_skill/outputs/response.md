세 번 다 같은 층위에서 시도한 거야. setTimeout 타이밍, useEffect deps, ref 캐싱 — 전부 "포커스가 사라진 뒤 복구하는 방법"을 바꾼 거지, "왜 포커스가 사라지는지"를 안 본 거야.

focusRecovery 플러그인은 포커스가 사라진 **후**에 동작하는 안전망이야. 안전망을 아무리 튜닝해도 포커스가 날아가는 원인 자체는 안 바뀌어.

## 진짜 질문은 이거야

> "포커스가 있던 DOM 노드가 왜 사라지는가?"

포커스가 "사라진다"는 건 거의 항상 이 중 하나야:

1. **리렌더링으로 DOM 노드가 교체됨** — key가 바뀌거나, 부모가 unmount/remount되면서 포커스를 가진 엘리먼트가 DOM에서 빠짐. `document.activeElement`가 `body`로 떨어짐.
2. **데이터 변경으로 노드가 visible 목록에서 빠짐** — `getVisibleNodes` 결과가 바뀌면서 포커스 대상이 사라짐. collapse, 필터, 삭제 등.
3. **비동기 상태 업데이트가 포커스 이동과 경합** — 상태가 두 번 업데이트되면서 중간 렌더에서 포커스 대상이 없는 상태가 됨.

## 다음에 할 일

코드를 고치기 전에 **관찰부터** 해.

1. 포커스가 사라지는 순간에 **브라우저 DevTools > Elements 패널**에서 포커스가 있던 DOM 노드가 실제로 DOM에서 제거되는지 확인해. (Elements 패널에서 노드가 flash하면서 사라지는 게 보일 거야.)
2. `document.activeElement`가 `body`로 떨어지는 시점을 잡아. 콘솔에 이거 찍어봐:
   ```js
   document.addEventListener('focusout', e => {
     requestAnimationFrame(() => {
       if (document.activeElement === document.body) {
         console.trace('focus fell to body');
       }
     });
   });
   ```
3. stack trace를 보면 어떤 리렌더/DOM 조작이 포커스를 날렸는지 보일 거야.

원인을 찾으면 수정은 focusRecovery가 아니라 **포커스를 날리는 쪽**에서 해야 해. 예를 들어:
- key가 불안정하면 key를 안정화
- 불필요한 unmount가 있으면 조건부 렌더링 구조 수정
- 상태 업데이트가 두 번 일어나면 배치로 합치기

**증상(포커스 복구)이 아니라 원인(포커스 소실)을 봐.**
