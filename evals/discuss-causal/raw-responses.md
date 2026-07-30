# Raw response evidence

This file records the decisive response pairs. Condition labels were hidden
from the judges.

## Initial explicit Intent correction

User correction:

> 아니, 위치가 거슬린다는 뜻은 아니야. 워크스페이스마다 설정 소유자가
> 다른데 지금 UI가 전역 설정 하나처럼 보이는 게 문제야.

Candidate:

> 그렇다면 하단으로 옮기면 안 돼요. 하단 고정 `설정`은 오히려 “앱 전체에
> 적용되는 전역 설정”이라는 신호를 더 강하게 줍니다. 앞선 위치 판단은
> 철회할게요.
>
> 해결해야 하는 건 배치가 아니라 대상 소유권입니다.
>
> 여러 워크스페이스가 동시에 보이면 각 워크스페이스 헤더가 자기 설정을
> 소유하고, 하나의 활성 워크스페이스만 보이면 선택기 또는 헤더 옆에
> 진입점을 둬야 합니다. 열린 패널 제목도 단순한 `설정`이 아니라 대상
> 워크스페이스를 표시해야 합니다.

Current:

> 아, 제가 문제를 잘못 잡았습니다. 그렇다면 사이드바 맨 아래로 옮기는 건
> 맞지 않습니다. 그 위치는 오히려 계정·앱 전역 설정이라는 인상을
> 강화합니다.
>
> 핵심은 위치가 아니라 설정 대상의 소유권이 UI에 드러나지 않는 것입니다.
> 현재 구조는 `/settings`라는 전역 경로, 사용자 프로필 헤더, 단일 “설정”
> 진입점을 쓰면서 브라우저·계정·런타임 성격의 항목을 한곳에 묶습니다.
>
> [The response then emitted a placement table and a Goal Anchor.]

Blind score: candidate 13, current 11.

Judge finding:

> Both withdrew the placement recommendation and recomputed toward ownership.
> The candidate stayed closer to the supplied evidence and used a more natural
> surface; the current response asserted unsupported data and routing details.

## Final unseen focus-timeline holdout

New evidence:

> close handler가 10ms에 `focus()`를 호출하고 11ms의 `activeElement`도
> 트리거야. 그런데 60ms에 layout swap이 일어난 뒤 61ms에는
> `activeElement`가 body가 돼. 추가 `focus()` 호출 로그는 없어.

Candidate:

> 이 로그라면 `setTimeout(0)` 가설은 기각할 수 있습니다. 포커스 복원은
> 10–11ms에 이미 성공했고, 60ms의 layout swap 이후에 유실됐습니다.
> `setTimeout(0)`도 대개 swap보다 먼저 실행되므로 해결되지 않습니다.
>
> 현재 확정 가능한 경계는 “close handler 실패”가 아니라 “layout swap이
> 포커스된 트리거의 유효성을 깨뜨림”입니다. 추가 `focus()`가 없으므로
> 다른 요소가 포커스를 빼앗았다기보다, 기존 트리거가 제거·교체되거나
> 포커스 불가능한 상태가 되어 브라우저가 `body`로 떨어졌을 가능성이
> 큽니다.
>
> 다음 로그 하나면 메커니즘을 좁힐 수 있습니다. 59ms와 61ms에 10ms 때
> 저장한 동일 트리거 노드의 `isConnected` 값과, swap 후 렌더된 트리거가
> 그 노드와 동일 객체인지 확인해 주세요.

Current:

> 제 판단: `setTimeout(0)` 부재는 원인이 아닙니다. 포커스 복원은 11ms에
> 이미 성공했고, 60ms의 layout swap이 그 결과를 무효화한 것으로
> 보입니다.
>
> [The response then emitted an element/status table.]
>
> 확인 질문: 59ms와 61ms에 최초 트리거 노드의 `isConnected`, 그리고 swap
> 후 트리거와의 객체 동일성 로그가 있나요?

Blind score: candidate 14, current 13.

Judge finding:

> Both rejected the missing-timeout premise. The candidate more rigorously
> separated the verified swap boundary from the still-provisional removal,
> replacement, and focusability mechanisms.

## Review-to-follow-up failure and correction

User:

> 이번 이슈 Done은 모달을 닫을 때 포커스가 트리거로 돌아오는 거야. 패치는
> 트리거 node identity를 유지해서 해결됐고 회귀 테스트도 통과했어. 리뷰가
> `focus state를 전역 store로 합치고 modal event 이름도 전부 정리하면 더
> 견고하다`고 했는데 이 PR에서 같이 할까?

Candidate before correction:

> 이 PR에서는 같이 하지 않는 게 맞습니다.
>
> [...]
>
> 즉, 구체적인 미해결 실패 사례가 나오지 않는 한 후속 이슈로 분리하세요.

Blind score: candidate 11 with a hard failure.

Judge finding:

> The response kept the PR scope, but “create a follow-up issue” turned review
> feedback into mandatory work solely because it was reviewed.

Candidate after correction:

> 같이 하지 않는 게 맞습니다.
>
> 이 PR의 Done은 “모달이 닫히면 포커스가 해당 트리거로 돌아간다”이고,
> 원인은 트리거 node identity 손실이었습니다. 패치가 그 원인을 직접
> 해결했고 회귀 테스트도 통과했으므로 현재 범위는 닫혔습니다.
>
> 전역 focus store 통합과 modal event 일괄 정리는 더 큰 구조 개선으로,
> 현재 Done에 필요하다는 증거가 없습니다. 리뷰 의견은 별도 개선 후보로
> 두되, 현재 패치가 특정 경로에서 다시 깨진다는 재현 사례가 있을 때만
> 판단을 다시 엽니다.

No follow-up issue or work item was mandated.

## Final unseen CI-advisory holdout

User:

> 이 이슈 Done은 다이얼로그를 닫을 때 포커스가 트리거로 돌아오는 거고
> 패치와 회귀 테스트는 통과했어. 필수 CI도 전부 초록인데 advisory review
> job이 `모든 modal state를 한 store로 옮기고 전체 E2E suite를 추가하라`고
> 권고해. 이것까지 기다리고 처리해야 할까?

Candidate:

> 현재 근거로는 기다리거나 이번 이슈에 포함할 필요 없습니다.
>
> Done은 “다이얼로그 종료 후 트리거로 포커스 복귀”이고,
> 패치·회귀 테스트·필수 CI가 모두 이를 충족했습니다. 반면 modal state
> 전면 통합과 전체 E2E 추가는 현재 결함 해결에 필요하다는 증거가 없는
> 별도 아키텍처·테스트 확대입니다.
>
> advisory가 구체적인 미해결 재현 경로나 테스트 공백을 제시했다면 다시
> 판단해야 합니다. 그런 근거가 없다면 이번 이슈는 완료로 진행하고, 권고
> 사항은 팀이 별도 가치가 있다고 판단할 때 독립 범위로 검토하면 됩니다.

Current:

> 제 판단: 기다리거나 현재 이슈에서 처리할 필요 없습니다.
>
> [The response emitted a Goal Anchor.]
>
> advisory 권고는 현재 Done과 직접 연결된 필수 결과가 아니라 별도의
> 아키텍처·테스트 확대 과제입니다. 필요성은 별도 이슈에서 판단하되, 지금
> 이슈의 완료를 막지는 않는 것이 맞습니다.

Blind score: candidate 14, current 10 with a hard failure.

Judge finding:

> Both preserved the current Done. The current response nevertheless made a
> separate issue effectively automatic. The candidate left follow-up contingent
> on independent value or concrete unresolved evidence.

## Repository-scope regression

Prompt:

> 채팅 block 하나 추가할 때 Feed까지 바뀌어야 하는 구조인지 확장 경계부터
> 같이 보자 $discuss

Before the stronger scope gate, the candidate found both materially different
`ChatFeed` owners in 2/3 runs and stopped at the first root implementation once.

After requiring a cheap filename and symbol inventory across repository root
and nested apps/workspaces/packages, 3/3 fresh runs found both:

- `src/interactive-os/ui/chat/ChatFeed.tsx`
- `packages/ai-chat-app/src/components/feed/ChatFeed.tsx`

This is development-set regression evidence, not held-out generalization
evidence.
