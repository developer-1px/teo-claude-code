---
name: reference
description: 사용자 발화를 액면 그대로 수행하지 않고 숨은 조사 의도, 배경, 목표를 먼저 추론한 뒤 비교 대상의 범주와 피어셋을 잠그고, 내부 맥락을 감사하고 standard, best practice, de facto, frontier trend를 비교해 읽히는 reference narrative를 만든다. "reference", "레퍼런스", "BP 찾아줘", "best practice", "사실상 표준", "de facto", "요즘 트렌드", "최근 시도", "업계는 어떻게 해", "표준 뭐야", "research", "리서치", "/reference", "/research"처럼 외부 수렴 흐름을 알고 싶을 때 사용한다. 단순 링크 목록이나 표 보고서가 아니라, 소스를 대신 읽고 같은 범주의 BP/de facto와 얼마나 가까운지, 결이 얼마나 비슷한지, 차이가 있다면 더 가까운 유사 레퍼런스는 무엇인지 문단 중심으로 설명하고 필요한 근거 표는 appendix로 내린다.
---

# /reference — 수렴 흐름 기반 레퍼런스 맵

외부 지식을 "검색 결과"가 아니라 **판단 기준 좌표계**로 만든다.

이 스킬은 어떤 주제가 시간이 지나며 어디로 수렴하는지 확인한다. 공식 표준, 권장 방식, 사실상 표준, 최근 실험을 구분하고, 프로젝트 내부 맥락과 맞춰 적용 가능성을 판정한다.

사용자가 이 스킬을 부르는 이유는 소스를 직접 읽기 위해서가 아니다. AI가 소스를 대신 읽고, 각 결론이 어떤 근거에서 나왔는지 바로 판단할 수 있게 압축하기 위해서다.

## 기본 태도

`/reference`는 사용자의 말을 액면 그대로 실행하지 않는다. 사용자가 "BP 찾아줘", "요즘은 어떻게 해", "이걸로 해봐"라고 말하면, 그 뒤에는 보통 다음 의도가 숨어 있다.

- 지금 결정하려는 선택지가 외부 수렴 흐름과 맞는지 확인하고 싶다.
- 내가 떠올린 방향이 개인 취향인지, 업계의 반복 패턴인지 구분하고 싶다.
- 소스를 직접 하나씩 읽기보다 AI가 먼저 읽고 믿을 만한 판단 프레임으로 압축해주길 원한다.
- 당장 채택할 것, 변형할 것, 지켜볼 것을 나눠 실행 판단까지 얻고 싶다.

따라서 조사를 시작하기 전에 "이 조사는 어떤 배경에서 시작됐고, 무엇을 결정하기 위한 것인가"를 먼저 추론한다. 확신이 낮으면 짧게 가정으로 표시하고, 조사 결과에서 그 가정을 검증하거나 수정한다.

기본 톤은 처방이 아니라 **캘리브레이션**이다. 사용자는 가치판단을 하기 위해 reference를 요청하지만, 산출물은 "이렇게 해야 한다"보다 "BP/de facto 기준점과 얼마나 가깝고, 어느 지점이 다르며, 다르다면 어떤 레퍼런스와 더 가까운가"를 중립적으로 보여준다.

권고가 필요하면 마지막에 짧게 분리한다. 본문 대부분은 유사도, 거리, 차이, 근거를 다룬다.

## 비교 범주 우선 원칙

`/reference`의 첫 실패 모드는 주제어에 끌려가서 너무 넓은 범주를 조사하는 것이다. 사용자가 "의도정렬 허브"를 물어도, 대상이 `SKILL.md`로 구현된 스킬이면 1차 비교 대상은 "agent intent alignment" 일반론이 아니라 **Agent Skills, custom commands, prompt files, custom agents, instruction files** 같은 에이전트 확장 단위다.

따라서 외부를 보기 전에 비교 대상의 **구현 형태**와 **피어셋**을 먼저 잠근다.

| 대상 타입 | 1차 피어셋 | 인접 피어셋 |
|---|---|---|
| `skill` | Agent Skills, Claude/Codex skills, skill authoring guides | custom command, prompt file, custom agent |
| `custom-command` | slash command, prompt file, command template | skill, custom agent |
| `custom-agent` | custom agent, chat mode, planner/reviewer agent | skill, handoff workflow |
| `instruction-file` | AGENTS.md, CLAUDE.md, rules/memory | skill, prompt file |
| `workflow-pattern` | plan/research/iterate, routing, evaluator loop | custom agent, orchestration pattern |
| `library-api` | official API docs, framework guides, migration guides | ecosystem usage |
| `architecture-pattern` | reference architecture, ADR examples, production case studies | framework conventions |

규칙:

- 내부 대상이 로컬 파일/스킬/명령/문서라면 파일을 먼저 읽고 `대상 타입`을 판정한다.
- 같은 주제보다 같은 형태를 먼저 비교한다. "무슨 일을 하는가"와 "무슨 형태로 구현됐는가"를 분리한다.
- 1차 피어셋에서 충분한 신호가 없을 때만 인접 피어셋으로 넓힌다.
- 너무 넓은 일반론 소스는 "배경"으로만 쓰고, 핵심 evidence에는 넣지 않는다.
- 검색 쿼리는 주제어만 쓰지 말고 대상 타입을 함께 넣는다. 예: `intent alignment agent skills custom command planner skill`, `Claude Code skill versus custom command`.

## /discuss와의 관계

`/reference`는 `/discuss`의 ⑨ 외부 탐색 드릴다운이다.

- `/discuss`에서 외부 근거가 필요해지면 ⑨ 질문을 받아 reference map으로 확장한다.
- `/reference` 단독 호출도 가능하지만, 요청이 모호하면 먼저 `/discuss`식으로 질문을 1~2문장까지 좁힌다.
- reference 결과는 `/discuss`의 ⑨ 외부 탐색 근거와 ⑪ 해결 후보에만 넣는다. 외부 표준이 프로젝트 규칙을 자동으로 덮지 않는다.

## /explain, /research와의 구분

| | /explain | /reference |
|---|---|---|
| 소스 | 내부 코드, git, 프로젝트 문서 | 내부 감사 + 외부 표준/BP/de facto/frontier |
| 질문 | "우리가 왜 이렇게 했지?" | "세상은 어디로 수렴했고, 우리는 무엇을 채택할 수 있지?" |
| 산출물 | 내부 맥락 해설 | 적용 가능성까지 판정한 reference map |

`/research`는 과거 이름이다. 사용자가 `/research`, "리서치", "조사"라고 말해도 이 스킬을 사용하되, 산출물 이름은 reference map으로 둔다.

## 모드

요청을 하나 이상의 모드로 태깅한다. 모드를 섞어도 되지만, 출처와 결론에서 구분한다.

| Mode | 의미 | 주요 근거 |
|---|---|---|
| `standard` | 공식 표준 또는 공식 API 계약 | W3C, RFC, WHATWG, IETF, MDN, official docs |
| `bp` | 권위 있는 권장 방식 | framework guide, official examples, well-maintained engineering docs |
| `defacto` | 업계가 사실상 수렴한 관행 | major frameworks, common library APIs, ecosystem usage, migration guides |
| `frontier` | 아직 표준은 아니지만 최근 시도되는 수렴 후보 | recent posts, conference talks, RFC/proposal, experimental libraries, issue discussions |

`frontier`는 "아무 대안"이 아니다. 다음 중 하나가 있어야 한다.

- 여러 독립 주체가 비슷한 방향으로 실험한다.
- 기존 방식의 명확한 한계를 해결한다.
- 표준화, 메이저 프레임워크, 핵심 라이브러리 이슈에서 논의된다.

## Workflow

### 1. Intent Frame

사용자 발화와 대화/프로젝트 맥락에서 조사 배경과 목표를 먼저 세운다.

```markdown
## 조사 배경과 목표

| 항목 | 내용 |
|---|---|
| 사용자 발화 | ____ |
| 내가 추론한 숨은 의도 | ____ |
| 조사가 시작된 배경 | ____ |
| 이번 조사로 결정하려는 것 | ____ |
| 조사하지 않을 것 | ____ |
| 의도 추론 확신도 | high/medium/low — 이유 |
```

이 표는 최종 산출물 초반에 반드시 들어간다. 사용자가 "비교해보게", "이걸로 해봐"처럼 짧게 말해도 생략하지 않는다.

### 2. Reference Target Frame

비교 대상을 먼저 분류한다. 이 단계가 틀리면 이후 조사는 신뢰할 수 없다.

```markdown
## 비교 범주와 조사 축

| 항목 | 내용 |
|---|---|
| 내부 대상 | ____ |
| 구현 형태 | skill/custom-command/custom-agent/instruction-file/workflow-pattern/library-api/architecture-pattern |
| 표면 주제 | ____ |
| 1차 비교 피어셋 | ____ |
| 2차 인접 피어셋 | ____ |
| 제외할 넓은 축 | ____ |
| 검색 쿼리 기준 | ____ |
| 범주 판정 확신도 | high/medium/low — 이유 |
```

예:

```markdown
내부 대상: `/discuss`
구현 형태: skill
표면 주제: 의도 정렬, 실행 전 정렬
1차 비교 피어셋: Agent Skills, Claude/Codex skills, custom commands, prompt files
2차 인접 피어셋: custom planning agents, chat modes, handoff workflows
제외할 넓은 축: agent planning 일반론만 보는 조사
```

### 3. Sharpen

질문을 한 줄로 좁힌다.

```markdown
질문: ____
모드: standard | bp | defacto | frontier
결정에 쓸 것인가: yes/no
```

질문이 넓으면 먼저 범위를 좁힌다. 빈 질문을 던지지 말고 후보를 제시한다.

```markdown
제 해석: 지금은 A보다 B를 reference로 보는 게 맞습니다.
이유: [사용자 원문/프로젝트 맥락].

후보:
A) 표준/공식 권장 방식
B) 사실상 표준과 최근 수렴 방향
C) 우리 프로젝트에 적용 가능한 선택지 비교
```

### 4. Internal Audit

외부를 보기 전에 내부 자산을 먼저 본다.

```markdown
## Internal Audit

| 항목 | 확인할 것 | 결과 |
|---|---|---|
| 규칙 | AGENTS.md, CLAUDE.md, memory, repo rules | ____ |
| 기존 구현 | 관련 코드, 패턴, helpers, package usage | ____ |
| 기존 문서 | developer docs, ADR, prior research/reference | ____ |
| 금지/선호 | 이미 거부한 선택지, 선호하는 구조 | ____ |
```

내부에 이미 답이 있으면 외부 조사는 그 답을 검증하거나 보정하는 데만 쓴다.

### 5. Reference Scan

모드별로 출처를 나눠 확인한다. 외부 사실은 URL과 함께 남긴다.

```markdown
## Reference Scan

| Peer set | Mode | Source | 주장 | 강도 | 우리 맥락과의 관계 |
|---|---|---|---|---|---|
| primary/adjacent/background | standard/bp/defacto/frontier | URL/title | ____ | high/medium/low | align/partial/conflict |
```

강도 기준:

- `high`: 공식 표준, 공식 docs, 다수 생태계 수렴, 장기 유지되는 관행
- `medium`: 주요 라이브러리/프레임워크 관행, 널리 인용되는 문서
- `low`: 단일 글, 개인 의견, 실험 초기, 맥락 의존

조사 순서:

1. 1차 피어셋에서 official docs, authoring guides, examples를 먼저 본다.
2. 같은 형태의 신호가 약하면 인접 피어셋을 본다.
3. 일반론/도메인 글은 마지막에 배경으로만 본다.

### 6. Evidence Ledger

소스별로 "무엇을 증명하는지"를 먼저 뽑는다. 링크만 모으면 실패다.

```markdown
## Evidence Ledger

| ID | Source | Type | Date | 내가 읽은 핵심 | 이 근거가 증명하는 것 | 한계 |
|---|---|---|---|---|---|---|
| S1 | [제목](URL) | official/spec/docs/blog/code | YYYY-MM-DD 또는 n/a | 1~3문장 요약 | standard/bp/defacto/frontier 중 무엇을 지지 | 맥락 차이, 오래됨, vendor bias 등 |
```

규칙:

- 사용자가 핵심 결론을 믿기 위해 링크를 다시 열 필요가 없을 만큼 "내가 읽은 핵심"을 써야 한다.
- 단, 긴 원문 복붙은 금지한다. 짧은 인용이 필요하면 출처별 허용 범위 안에서만 쓴다.
- 읽지 않은 소스는 `Sources`에 넣지 않는다.
- 비교 범주가 다른 소스는 `background`로 표시하고 핵심 결론의 주근거로 쓰지 않는다.

### 7. Claim-Evidence-Fit

결론을 먼저 만들지 말고, claim마다 근거와 우리 맥락을 붙인다.

```markdown
## Claim-Evidence-Fit

| Claim | Mode | Evidence | Strength | Reference proximity | 차이/의미 |
|---|---|---|---|---|---|
| ____ | standard/bp/defacto/frontier | S1, S3 | high/medium/low | close/adjacent/different/unknown | ____ |
```

강도 기준:

- `high`: 공식 표준/공식 docs이거나, 독립 출처 3개 이상이 같은 방향을 가리키며 내부 제약과도 맞다.
- `medium`: 권위 있는 출처 1~2개가 있고 내부 적용 경로가 보인다.
- `low`: 단일 글, vendor claim, 초기 실험, 내부 적용성이 불명확하다.

Reference proximity 기준:

- `close`: 문제, 제약, 해결 모양이 BP/de facto와 대부분 같다.
- `adjacent`: 목표나 철학은 비슷하지만 구현 단위, 운영 조건, 사용자 맥락이 다르다.
- `different`: 표면 단어는 비슷하지만 핵심 문제나 제약이 다르다.
- `unknown`: 소스가 부족하거나 내부 맥락이 불명확해 거리를 말할 수 없다.

### 8. Difference-to-Reference

우리 안과 외부 기준점의 차이를 중립적으로 분해한다. 차이가 있으면 "틀렸다"가 아니라 더 가까운 레퍼런스를 찾아준다.

```markdown
## Difference-to-Reference

| 우리 안의 모양 | 가장 가까운 BP/de facto 기준점 | 유사한 점 | 다른 점 | 더 가까운 유사 레퍼런스 |
|---|---|---|---|---|
| ____ | S1/S2의 ____ | ____ | ____ | S4의 ____ |
```

규칙:

- "좋다/나쁘다"보다 "가깝다/멀다/결이 다르다"를 먼저 말한다.
- 차이를 발견하면 최소 1개 이상 "더 가까운 유사 레퍼런스"를 찾는다. 없으면 없다고 말하고, 어떤 쿼리로 더 찾아야 하는지 적는다.
- 유사 레퍼런스는 같은 키워드가 아니라 같은 문제 구조, 제약, 해결 모양을 공유해야 한다.

### 9. Convergence Shape

표준, BP, 사실상 표준, frontier가 어떻게 이어지는지 보여준다. 흐름이 없으면 "수렴"이라고 말하지 않는다.

```markdown
## Convergence Shape

| Layer | Stable Signal | Moving Signal | Local Meaning |
|---|---|---|---|
| Standard | 공식 계약/스펙 | 개정/제안 | 기준점 |
| BP | 공식 권장/유지보수자 가이드 | 권장 변화 | 가까운 정도를 볼 기준 |
| De facto | 생태계 반복 패턴 | migration/adoption 증가 | 차이가 있으면 설명할 기준 |
| Frontier | 최근 실험/제안 | 아직 실패 가능 | 유사 실험을 찾을 기준 |
```

필요할 때만 Mermaid를 붙인다. 다이어그램은 장식이 아니라 claim 간 관계를 설명해야 한다.

### 10. Synthesis

최종 산출물은 **읽히는 판단 문서**여야 한다. 표는 검증 도구일 뿐 본문 구조가 아니다. 초반의 `조사 배경과 목표`와 `비교 범주`가 빠지면 `/reference`가 아니라 일반 조사 보고서가 된다.

기본 비율:

- 본문 70%: 짧은 문단, 핵심 문장, 비교 서사
- 구조 20%: 불릿, 짧은 리스트
- 표 10%: 판정 요약 또는 근거 부록

표는 기본적으로 최대 2개만 쓴다. 더 필요하면 `Evidence Appendix`로 접는다.

```markdown
---
type: reference
query: "한 줄 질문"
modes: [standard, bp, defacto, frontier]
decisionUse: true | false
confidence: high | medium | low
sourceCount: 0
lastChecked: YYYY-MM-DD
---

# {주제} Reference

## 왜 이 조사를 했나

사용자 발화는 "__"였지만, 이 조사의 실제 목적은 ____로 봤다.
배경은 ____이고, 이번에 확인하려는 것은 ____이다.
이번 조사는 ____는 다루지 않는다.

## 먼저 비교 축을 고정하면

이 대상은 표면적으로는 ____ 이야기처럼 보이지만, 구현 형태는 ____다.
그래서 1차 비교군은 ____이고, ____ 같은 넓은 축은 배경으로만 둔다.

## 한 문장 판정

____는 ____ 기준점에는 `close/adjacent/different/unknown`이고, ____ 기준점에는 `close/adjacent/different/unknown`이다.

흥미로운 지점은 ____가 아니라 ____다.

## 읽어보니 갈리는 지점

첫 번째로, ____.
이 점은 ____ 레퍼런스와 가깝다.

두 번째로, ____.
여기서부터는 ____와 결이 갈린다.

세 번째로, ____.
이건 ____와 더 가까운 유사 레퍼런스를 봐야 한다.

## 가까운 레퍼런스는 무엇인가

- 가장 가까운 기준점: ____ — 이유: ____
- 인접하지만 다른 기준점: ____ — 다른 점: ____
- 배경으로만 볼 기준점: ____ — 이유: ____

## 근거 요약

| 판단 | 근거 | 거리 |
|---|---|---|
| ____ | S1, S2 | close/adjacent/different/unknown |

## 차이와 해석

차이는 ____다.
이 차이를 "틀림"으로 보기보다 ____로 보는 편이 맞다.
그래서 다음에 더 찾아볼 레퍼런스는 ____다.

## 반증 조건

- 이 결론이 틀리려면 어떤 사실이 나와야 하는가?
- 어떤 소스를 더 보면 확신도가 올라가는가?
- 어떤 내부 제약이 바뀌면 판정이 바뀌는가?

## Evidence Appendix

필요할 때만 붙인다.

| ID | Source | 내가 읽은 핵심 | 증명하는 것 | 한계 |
|---|---|---|---|---|
| S1 | [제목](URL) | ____ | ____ | ____ |
```

## Expected Result

좋은 결과는 아래처럼 읽힌다.

```markdown
이번 조사는 "의도정렬을 잘하는 법"을 보려는 게 아니었다.
`/discuss`가 SKILL.md로 구현되어 있기 때문에, 먼저 봐야 할 기준점은 Agent Skills, prompt files, custom agents다.

읽어보면 `/discuss`는 순수한 skill이라기보다 "meta-workflow skill"에 가깝다.
반복 가능한 절차를 담고 필요할 때 로드된다는 점은 skill과 가깝다.
하지만 사용자의 목적을 해석하고, 실행을 멈추고, 다른 스포크로 넘기는 성격은 custom planning agent나 handoff workflow에 더 가깝다.

그래서 흥미로운 결론은 "스킬로 만들면 된다/안 된다"가 아니다.
`/discuss`는 skill 형식으로 배포되어 있지만, 역할은 custom agent에 걸쳐 있다.
이 긴장을 인정하면 다음 개선 방향도 달라진다.
description은 skill trigger답게 좁히고, 13요소/FRT 같은 무거운 판단 프레임은 progressive disclosure로 나누는 쪽이 더 자연스럽다.
```

피해야 할 톤:

```markdown
agent planning best practice를 조사했습니다.
AGENTS.md와 plan mode가 정석입니다.
이게 정답입니다.
이 방식을 써야 합니다.
업계 표준은 이거니까 이렇게 하세요.

## 표
...
## 표
...
## 표
...
```

## Output Rules

### 금지 출력

아래 형태는 실패다.

```markdown
## TL;DR
대충 그럴듯한 결론.

## Sources
- 링크
- 링크
- 링크
```

왜 실패인가:

- 결론 옆에 근거가 없다.
- 소스를 사용자가 직접 읽어야 한다.
- BP, de facto, frontier가 섞인다.
- 강도와 한계가 없다.

### 좋은 출력의 최소 조건

최소한 아래 6개 정보 블록은 있어야 한다. 단, 표로 쓰지 않아도 된다.

1. **조사 배경과 목표** — 이 조사가 왜 시작됐고 무엇을 결정하려는지 보여준다.
2. **비교 범주와 조사 축** — 무엇과 비교해야 하는지 먼저 고정한다.
3. **한 문장 판정** — 답부터 보여준다.
4. **판단 내러티브** — 왜 그렇게 읽히는지 문단으로 설명한다.
5. **근거 요약** — 핵심 claim이 어떤 소스에서 나왔는지 보여준다.
6. **차이와 유사 레퍼런스** — BP/de facto와 다른 지점과 더 가까운 reference를 보여준다.

사용자가 "왜 믿어야 하지?"라고 물으면 `Claim-Evidence-Fit`과 `소스 카드`만으로 답할 수 있어야 한다.

표는 기본 2개 이하로 제한한다. `Evidence Appendix`의 근거 표는 길어도 되지만, 본문 앞부분을 표로 덮지 않는다.

## Reference Proximity 판정

| 판정 | 의미 |
|---|---|
| `close` | BP/de facto 기준점과 문제, 제약, 해결 모양이 대부분 같다 |
| `adjacent` | 결은 비슷하지만 구현 단위, 운영 조건, 대상 사용자가 다르다 |
| `different` | 표면 주제는 비슷하지만 핵심 문제나 선택 기준이 다르다 |
| `unknown` | 소스나 내부 맥락이 부족해 거리를 말할 수 없다 |

## Quality Gate

마무리 전에 자가 점검한다.

| Gate | 통과 조건 |
|---|---|
| Intent frame | 사용자 발화, 숨은 의도, 조사 배경, 결정 목표가 초반에 있다 |
| Reference target frame | 내부 대상의 구현 형태, 1차 피어셋, 제외할 넓은 축이 초반에 있다 |
| Source read-through | 출처 링크마다 "내가 읽은 핵심"이 있다 |
| Claim traceability | 모든 핵심 claim이 Evidence ID를 가진다 |
| Mode separation | standard/bp/defacto/frontier가 섞이지 않는다 |
| Peer-set discipline | 같은 형태의 피어셋을 먼저 보고, 인접 피어셋과 배경 소스를 구분한다 |
| Readability | 첫 60%는 문단 중심이고, 독자가 판단 흐름을 따라갈 수 있다 |
| Table restraint | 본문 표는 2개 이하이며, 긴 근거 표는 appendix로 내려간다 |
| Neutral calibration | "해야 한다"보다 기준점과의 거리, 유사점, 차이를 먼저 말한다 |
| Similar reference | 다른 점이 있으면 더 가까운 유사 레퍼런스나 추가 탐색 쿼리가 있다 |
| Local fit | 내부 규칙/구현/문서와의 관계가 있다 |
| Limits | 각 소스 또는 결론의 한계가 적혀 있다 |
| No naked links | 링크 목록만으로 끝나지 않는다 |

하나라도 실패하면 결론을 낮춘다. `confidence: low`로 표시하거나, 추가 조사를 한다.

## Rules

- 내부 감사 없이 외부 결론을 내지 않는다.
- 내부 대상이 로컬 파일/스킬/명령/문서라면 외부 검색 전에 해당 파일을 읽고 구현 형태를 판정한다.
- 표면 주제만으로 검색하지 않는다. 대상 타입과 피어셋을 쿼리에 포함한다.
- 출처 없는 외부 사실을 쓰지 않는다.
- 링크는 근거가 아니다. 링크에서 읽어낸 주장과 한계가 근거다.
- 표는 사고 보조 도구이지 산출물의 본문이 아니다. 표가 세 개 이상 필요하면 세 번째부터는 appendix로 보낸다.
- 흥미로운 긴장, 예외, 차이, 더 가까운 레퍼런스를 먼저 문장으로 설명한다.
- `standard`, `bp`, `defacto`, `frontier`를 한 덩어리로 말하지 않는다.
- "요즘 트렌드"는 `frontier`로 두되, 안정된 관행처럼 말하지 않는다.
- 외부 BP가 내부 규칙과 충돌하면 먼저 `차이와 유사 레퍼런스`에 거리와 다른 점을 적고, 규칙 변경 여부는 별도 논의로 분리한다.
- 가치판단 문장은 마지막에 짧게 둔다. 본문에서는 기준점과의 거리, 결의 유사성, 다른 점, 유사 레퍼런스를 우선한다.
- 저장 위치는 프로젝트 문서 관행을 따른다. 관행이 없으면 대화에 출력하고 파일 저장은 사용자에게 경로를 확인한다.
