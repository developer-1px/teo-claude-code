# teo-stack

한국어 기반 **의도 정렬 + reference map + 리팩토링 감사 스킬** 모음.

이 플러그인은 Matt Pocock 계열 개발 플로우 스킬을 포함하지 않습니다. `teo-stack`에서 직접 만든 오리지널 스킬만 보관합니다.

## 스킬 15종

### 허브

| Skill | 설명 | 언제 |
|-------|------|------|
| `/discuss` | TOC 13요소 + FRT 게이트 기반 판단 제시형 업무 파트너 | 요청이 모호하거나 "왜 하는지"부터 정리가 필요할 때 |

### 드릴다운 스포크

| Skill | 설명 | 언제 |
|-------|------|------|
| `/ideal` | 이상적 결과를 구체 산출물로 시뮬레이션 | 방향은 잡혔는데 결과 모습이 추상적일 때 |
| `/conflict` | 대립 해소 다이어그램으로 숨은 전제와 돌파구 도출 | A vs B 딜레마, 양립 불가처럼 보이는 교착 |
| `/doubt` | Occam Gate와 4단 필터로 불필요한 개념·구조 제거 | "이거 다 필요해?", 새 개념 도입 전 |
| `/explain` | 민토 피라미드 + 다이어그램 중심 해설 문서 | "이게 뭐야", "왜 이렇게 했어" |
| `/reference` | 내부 맥락 감사 후 standard·BP·de facto·frontier 기준 합성 | "BP 찾아줘", "사실상 표준 뭐야", "요즘 트렌드 뭐야" |

### 독립 스킬

| Skill | 설명 | 언제 |
|-------|------|------|
| `/minto` | 파편화된 생각을 민토 피라미드로 재배치 | 메모·노트·아이디어 구조화 |
| `/reframe` | 반복된 패치 실패 후 문제 정의를 다시 잡음 | "이게 아니야", "다시 생각해" |
| `/team` | 에이전트 팀 편성 | 병렬 실행 전 역할·소통 프로토콜이 필요할 때 |
| `/glossary` | 도메인 용어와 관계를 `./glossary.md`에 누적 | 용어 정리, 도메인 분석, 유비쿼터스 언어 |

### Code Quality

| Skill | 설명 | 언제 |
|-------|------|------|
| `/srp` | 파일 단위 단일 책임 원칙 점검·분리 | 파일이 너무 크거나 책임이 섞였을 때 |
| `/ocp` | 개방-폐쇄 원칙 점검·분기 구조 리팩토링 | 새 항목 추가 때 여러 곳이 동시에 바뀔 때 |
| `/naming-audit` | 네이밍 일관성·적합성 감사 | 이름 점검, 동의어 드리프트, 형식 불일치 |
| `/app-owned-boundary-refactor` | 프론트엔드 layer/slice/segment 책임 경계 정리 | app-owned UI, page/widget/feature/entity 경계가 흐릴 때 |
| `/entity-interface-refactor` | entity 폴더·type prefix·viewModel props 응집도 정리 | FSD entity/feature 경계, props shredding, entity surface가 흐릴 때 |

## 설치

```bash
/plugin marketplace add developer-1px/teo-claude-code
/plugin install teo-stack@teo-marketplace
```

## 운영 메모

- 외부 개발 플로우 스킬은 이 repo에 vendoring하지 않습니다.
- 과거 승격 기록은 [`ROADMAP.md`](ROADMAP.md)에 보관합니다.
