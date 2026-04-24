# teo-stack

한국어 기반 **`/discuss` 허브 + TOC/민토 사고 스킬** 모음. [superpowers](https://github.com/obra/superpowers)와 **보완** 관계로, 공식 플러그인이 다루지 않는 축을 담당합니다.

## 포지셔닝

```
superpowers가 담당 →  brainstorming · debugging · TDD · planning · verification · code-review
teo-stack이 담당   →  논의 구조화 · 대립 해소 · 뺄셈 사고 · 민토 해설 · 외부 리서치
                       (모두 /discuss 허브 주변에 정렬)
```

## 허브-스포크 구조

```
                   ┌──────────────┐
                   │   /discuss   │  ← 허브 (TOC 13요소 + FRT 게이트)
                   │  판단 제시형  │
                   └──────┬───────┘
                          │
       ┌──────────┬───────┼───────┬──────────┐
       ▼          ▼       ▼       ▼          ▼
    /ideal    /conflict /doubt /explain   /research
   (시뮬)     (대립)   (뺄셈)  (해설)     (외부조사)

                          ─── 독립 스킬 ───
                       /minto   /reframe
```

`/discuss`에서 특정 요소가 막히면 스포크 스킬로 드릴다운, 결과를 허브에 반영하여 복귀. 스포크 스킬은 단독 호출도 가능.

## 스킬 12종

### 허브

| Skill | 설명 | 언제 |
|-------|------|------|
| `/discuss` | TOC 13요소 + FRT 게이트 기반 **판단 제시형** 업무 파트너 | 요청이 모호하거나 "왜 하는지"부터 정리가 필요할 때. superpowers:brainstorming이 소크라틱 질문형이라면 `/discuss`는 "제 판단: A, 이유: …" 선(先)제시형 |

### 드릴다운 스포크

| Skill | 설명 | 언제 |
|-------|------|------|
| `/ideal` | 이상적 결과를 구체 산출물(코드·표·다이어그램·저니맵)로 시뮬레이션 | 방향은 잡혔는데 "다 되면 어떤 모습"이 추상적일 때 |
| `/conflict` | 대립 해소 다이어그램(Evaporating Cloud)으로 숨은 전제 찾아 돌파구 도출 | A vs B 딜레마, 양립 불가처럼 보이는 교착 |
| `/doubt` | 존재·적합·분량·효율 4단 필터 + Occam Gate로 뺄셈 사고 | "이거 다 필요해?", 새 개념(컴포넌트/플래그/타입) 도입 전 |
| `/explain` | 민토 피라미드 + Mermaid 다이어그램 2+ 필수 해설 문서 | "이게 뭐야", "왜 이렇게 했어". 프로젝트 문서 관행 감지 |
| `/research` | 병렬 에이전트로 Best Practice·표준·대안 조사 + Mermaid 합성 | "BP 찾아줘", "사실상 표준 뭐야" |

### 독립 스킬

| Skill | 설명 | 언제 |
|-------|------|------|
| `/minto` | 파편화된 생각을 민토 피라미드로 재배치, 논리적 빈칸 발견 | 메모·노트·아이디어 구조화 |
| `/reframe` | 반복된 패치가 먹히지 않을 때 손 떼고 문제부터 다시 이해 | "왜 자꾸 그래". superpowers:systematic-debugging과 차별 — 버그 진단이 아니라 **문제 재진단** |
| `/team` | 에이전트 팀 편성 (계획자/실행자/평가자 3역할 + 특화 페르소나) | 병렬 에이전트 실행 전 편성표가 필요할 때. Task/Agent 디스패치 전 역할·소통 프로토콜 설계 |

### Code Quality (코드 리팩토링)

| Skill | 설명 | 언제 |
|-------|------|------|
| `/srp` | 단일 책임 원칙(SRP) 감사·리팩토링 — 파일명과 실제 책임의 불일치를 Cynefin(Clear/Complicated/Complex) 확신도로 분류 | "파일이 너무 크다", "이 파일 쪼개자". 파일 단위 책임 경계 점검 |
| `/ocp` | 개방-폐쇄 원칙(OCP) 감사·리팩토링 — switch/if 분기를 Co-location·defineXxx·Strategy 등의 패턴으로 수정 지점 1곳화 | "switch 너무 많다", "분기 정리". 새 항목 추가 시 여러 곳이 동시에 바뀌는 구조를 발견했을 때 |
| `/naming-audit` | 네이밍 일관성(consistency)·적합성(aptness) 감사 — 동의어 드리프트, 형식 불일치, 패턴 과적(한 접두사 과다 역할), 역할 분산 감지 | "이름 점검", "네이밍 확인". ripgrep 기반, 프로젝트 전용 수집 스크립트 있으면 우선 사용 |

## superpowers와의 경계 (겹침 방지)

| 상황 | 써야 할 스킬 |
|------|-----------|
| 버그·테스트 실패·예상치 못한 동작 진단 | `superpowers:systematic-debugging` |
| 창의 작업·기능 설계 시작점 | `superpowers:brainstorming` |
| 구현 플랜 작성 | `superpowers:writing-plans` |
| 테스트 주도 개발 | `superpowers:test-driven-development` |
| 완료 전 검증 | `superpowers:verification-before-completion` |
| **요청 자체가 모호·진짜 동기 불명** | `/discuss` |
| **두 방향 딜레마** | `/conflict` |
| **구현 완료 후 불필요 제거** | `/doubt` |
| **코드/설계 해설 문서 생성** | `/explain` |
| **Best Practice·표준 외부 조사** | `/research` |

## 설치

```bash
/plugin marketplace add developer-1px/teo-claude-code
/plugin install teo-stack@teo-marketplace
```

## 설계 원칙

- 프로젝트 고유 용어 없음 (interactive-os 컨벤션은 `teo-project`에 격리)
- 한국어 기본, 프로젝트 무관 동작
- `/discuss` 허브-스포크 관계는 유지하되, 각 스포크 스킬은 단독 호출도 가능
- superpowers와 겹치지 않음

향후 `teo-project` → `teo-stack` 승격 후보는 [`ROADMAP.md`](ROADMAP.md).
