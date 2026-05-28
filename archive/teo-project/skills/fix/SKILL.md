---
name: fix
description: 가장 최근 작업물이 고장났을 때 자동 재현→디버깅→수정. "/fix", "안 돼", "고장", "왜 안 돼", "방금 만든 거 안 돼" 등 문제 보고 시 사용. /debugging보다 짧고, "뭐가 고장났는지"를 자동 추론하는 Step 0이 추가됨. repro recorder JSON이 첨부되면 그것을 재현 증거로 사용.
---

## 역할

"방금 만든 게 안 돼"를 받으면, **뭐가 고장났는지 추론 → 재현 → 디버깅 → 수정**을 자율 수행한다.

`/debugging`은 "이미 무엇이 고장났는지 아는 상태"에서 시작하지만, `/fix`는 "무엇이 고장났는지 모르는 상태"에서 시작한다.

## Step 0: 고장 대상 추론

사용자가 "/fix"만 입력하면 — 최근 변경에서 고장 대상을 추론한다.

1. **URL이 입력에 포함되었으면** (예: `http://localhost:5173/...`) → 그 URL 자체가 고장 지점. **코드 읽기 전에 브라우저로 직접 가본다.** (아래 "URL이 주어지면 MCP 우선" 참조)
2. **repro JSON이 첨부되었으면** → 그 안의 이벤트·URL·컴포넌트 스택에서 고장 지점 특정
3. **둘 다 없으면** → `git diff HEAD~1` 또는 직전 커밋 메시지에서 최근 변경 파악
4. **변경 내용에서 "기대 동작" 추론** — 커밋 메시지, 변경된 파일, 테스트 코드에서 의도 파악

추론 결과를 한 줄로 선언:
```
🔧 고장 추정: [기능명] — [기대 동작] → [실제 증상 (있으면)]
```

사용자에게 확인 없이 바로 Step 1으로 진행한다 — 속도가 핵심. 추론이 틀리면 재현 단계에서 자연스럽게 드러난다.

### URL이 주어지면 MCP 우선 (claude-in-chrome)

사용자가 화면 이슈를 URL과 함께 보고하면(예: "http://localhost:5173/viewer/... code가 잘려"), **코드를 읽거나 grep 하기 전에 `mcp__claude-in-chrome__*` 툴로 브라우저를 열고 직접 관찰한다.**

표준 시퀀스:

1. `ToolSearch` `select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__read_page,mcp__claude-in-chrome__javascript_tool,mcp__claude-in-chrome__read_console_messages` — 필요한 MCP 툴 로드
2. `tabs_context_mcp` → 기존 탭 조회
3. 기존 탭에 맞는 게 없으면 `tabs_create_mcp`로 새 탭, 있으면 `navigate`
4. `computer`(screenshot)로 **먼저 눈으로 본다** — 증상이 보이면 이슈 특정 완료
5. 필요시 세부 검증:
   - `read_page` — DOM 구조/텍스트
   - `javascript_tool` — `getComputedStyle`, `scrollWidth/clientWidth`, `getBoundingClientRect()` 등으로 clipping·overflow·치수 측정
   - `read_console_messages` — 런타임 에러 체크
6. 증상이 정량적으로 잡히면(예: "scrollWidth 1200 > clientWidth 800 → overflow hidden이 자르고 있음") → 해당 컴포넌트 소스로 이동

**원칙:** "화면이 이상하다"는 사용자 증언이다. 눈으로 본 증상이 없으면 가설만 세우게 된다. 스크린샷+DOM 측정이 가장 빠른 증거.

### 화면 작업이면 스크린샷 우선 (URL 없어도)

최근 변경이 **라우터 추가, UI 컴포넌트 추가, CSS 수정, 레이아웃 변경** 등 화면 관련이면 — 코드를 읽기 전에 **브라우저 스크린샷부터 찍는다.** 눈에 보이는 결과가 가장 빠른 재현 증거다.

```
git diff → "라우터/컴포넌트/CSS 변경 감지"
  → 해당 라우트를 브라우저에서 열고 스크린샷 (MCP)
  → 화면이 기대와 다르면 그것이 증상
  → 화면이 정상이면 인터랙션 재현으로 넘어감
```

## Step 1~4: /debugging 흐름

Step 0에서 특정한 고장 대상으로 `/debugging` 스킬의 4단계를 실행한다:

```
재현 → 관측 도구 검증 → 설계 의도 파악 → 수정
```

**재현 전략:**
- repro JSON이 있으면 → JSON의 이벤트 시퀀스를 브라우저에서 재현
- 없으면 → 변경된 코드의 경로(라우트)를 열고, 커밋 메시지에서 추출한 동작을 시도

**수정 후:**
- 브라우저 재검증 필수
- `vitest run` 전체 통과 확인

## Step 5: 회귀 테스트

수정이 완료되면, **해당 버그를 재현하는 페이지 수준 통합 테스트**를 작성한다.

- repro 시나리오를 `userEvent.keyboard()` → DOM/ARIA 상태 검증으로 변환
- 테스트 파일은 **route 단위**로 조직: `__tests__/route-{routeName}.regression.test.tsx`
- 같은 route에서 발견된 버그는 한 파일에 누적
- 수정 전 코드에서 실패하고, 수정 후 통과하는지 확인

이 단계를 건너뛰지 않는다 — branch coverage는 missing logic을 감지하지 못하므로, 실제 사용자 행동 기반 테스트만이 재발을 방지한다.

## repro JSON 형식

사용자가 repro recorder로 캡처한 JSON은 아래 구조:
```json
{
  "meta": { "url": "/cms", "duration": 5000 },
  "timeline": [
    { "type": "keydown", "key": "Mod+\\", "target": "div[role=option]", "component": { "stack": [...] } },
    { "type": "click", "target": "button", "component": { "source": "src/..." } }
  ]
}
```

이 JSON에서:
- `meta.url` → 어느 페이지에서 발생했는지
- `timeline[].key` / `timeline[].target` → 어떤 동작을 했는지
- `timeline[].component.source` → 어느 컴포넌트에서 발생했는지
- "no changes" 표기 → 해당 동작 후 DOM 변화가 없었음 (= 기대한 동작이 안 됨)
