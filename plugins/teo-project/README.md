# teo-project [PRIVATE]

> ⚠️ **타 프로젝트 비호환**. interactive-os 컨벤션(`os 부품`, `ax()` 12축, `FlatLayout`, PARA 문서 규약, `L1/L2/L3` 이해도 레벨 등)을 전제로 작성됐습니다. 개인·팀 내부 용도로만 쓰입니다.
>
> 프로젝트 중립 사고 스킬이 필요하면 [`teo-stack`](../teo-stack/)을 사용하세요 — `/discuss` 허브 + TOC/민토 도구가 모여 있습니다.

## Skills Cheat Sheet

### Pipeline (파이프라인)

| Skill | What | 설명 | When / Why |
|-------|------|------|------------|
| `/story` | User story map builder | 유저스토리 맵 인터뷰 | `/discuss`(teo-stack) 이후, PRD 이전. 구현 단위를 사용자 체감 언어로 도출 |
| `/prd` | Implementation spec writer | 구현 명세 작성 | 방향은 잡혔는데 구체 동작이 미정일 때 |
| `/go` | Autonomous executor | 자율 실행 오케스트레이터 | "실행해", "만들어줘". Plan→Execute→Verify |
| `/do` | OS-based dev pipeline | os 기반 8단계 파이프라인 | "구현해", "코딩해" |
| `/close` | Cycle closer | 구현 사이클 마무리 | retrospect 완료 후 |
| `/auto` | Autonomous pipeline | 자율 파이프라인 트리거 | "끝까지 알아서", "무인 실행" |
| `/handoff` | Session bridge | 마무리·이어넘김 오케스트레이터 | "마무리", "닫자", "다음에 이어서" |

### Thinking (사고 도구 — 특화)

| Skill | What | 설명 |
|-------|------|------|
| `/design-think` | Design-first thinking | 디자이너 사고 순서로 시각 결정 (구버전) |
| `/design-think-v2` | Design-first thinking v2 | 같은 목적, 화면 단위 대화형 |

> 범용 사고 스킬(`/ideal`, `/conflict`, `/doubt`, `/explain`, `/reframe`, `/minto`, `/research`)은 [`teo-universal`](../universal/)에 있습니다.

### Quality (품질 루프)

| Skill | What | 설명 |
|-------|------|------|
| `/fix` | Auto reproduce & debug | 자동 재현→디버깅→수정 |
| `/improve` | Release quality loop | 사용자 Job 기준 품질 평가·개선 |
| `/improve-skill` | Skill & hook patcher | retrospect 후 스킬·훅 패치 |
| `/use` | Browser QA agent | 브라우저로 실사용 테스트 |
| `/screen-test` | Screen test writer | 화면 수준 통합 테스트 작성 |
| `/layout-score` | Layout evaluator | definePage 레이아웃 평가·수렴 |

### Code Quality

| Skill | What | 설명 |
|-------|------|------|
| `/srp` | SRP audit | 단일 책임 원칙 점검·리팩토링 |
| `/ocp` | OCP audit | 개방-폐쇄 원칙 점검·리팩토링 |
| `/naming-audit` | Naming consistency | 네이밍 일관성·적합성 감사 |
| `/antipattern` | Hook harness converter | 안티패턴을 훅 정적 검사로 전환 |

### Design

| Skill | What | 설명 |
|-------|------|------|
| `/blueprint` | Layout designer | FlatLayout definePage 설계 |
| `/ia` | Information architect | 사이트맵·네비게이션 구조 |
| `/wireframe` | Component matcher | 화면별 os 부품 매칭 |
| `/mockup` | Fidelity-ladder mockup | Data→Low-fi→Hi-fi 시각 프로토타입 |
| `/design-extract` | Reference token extractor | 레퍼런스 사이트 토큰 실측 추출 |

### Documents (PARA 기반)

| Skill | What | 설명 |
|-------|------|------|
| `/inbox` | Save to inbox | 요청을 날짜 폴더에 저장 |
| `/para` | PARA classifier | inbox 문서를 PARA로 분류 |
| `/area` | Area MDX updater | Area MDX 갱신·누적 |
| `/publish` | Living docs orchestrator | 문서 완전성 감사·빈 곳 채우기 |
| `/archive` | Archive compressor | 완료 문서 SCQA+mermaid 압축 후 이동 |

## Agents

| Agent | 용도 |
|-------|------|
| `naming-audit` | /go verify phase 네이밍 감사 에이전트 |
| `resource` | 리소스 탐색 에이전트 |
| `retrospect` | 구현 사이클 회고 에이전트 |
| `screen-test` | 화면 테스트 작성 에이전트 |

## 설치

```bash
/plugin marketplace add developer-1px/teo-claude-code
/plugin install teo-stack@teo-marketplace
```
