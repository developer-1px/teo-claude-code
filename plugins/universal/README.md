# teo-universal

한국어 기반 **프로젝트 중립** 사고·문서 스킬 모음. 어떤 프로젝트·어떤 환경에서도 독립적으로 동작합니다.

## 스킬 7종

### Thinking (사고 도구)

| Skill | What | 설명 | 언제 |
|-------|------|------|------|
| `/ideal` | Outcome simulator | 이상적 결과를 구체 산출물(코드·표·다이어그램·저니맵)로 시뮬레이션 | 방향은 합의됐는데 "다 되면 어떤 모습인지"가 아직 추상적일 때 |
| `/conflict` | Evaporating Cloud | 대립 해소 다이어그램으로 숨겨진 전제를 찾아 돌파구(Injection) 도출 | A vs B 딜레마. 옹호자 A/B 서브에이전트로 양쪽 전제를 강화한 뒤 중재자가 균열을 찾음 |
| `/doubt` | Occam's Gate filter | 존재·적합·분량·효율 4단 필터로 불필요한 것 제거 | "이거 다 필요해?". 구현 후 정리, 새 개념(컴포넌트/플래그/타입) 도입 전 검증 |
| `/explain` | Minto Pyramid explainer | 답 먼저·Why 다음의 민토 피라미드 + Mermaid 2+ 필수 | "이게 뭐야", "왜 이렇게 했어". 프로젝트의 기존 문서 관행을 감지해 따름 |
| `/reframe` | Stop & redefine | 같은 불만이 반복되면 손 떼고 문제부터 다시 이해 | "그거 아니야", "왜 자꾸 그래". 반복된 패치가 먹히지 않을 때 |

### Documents (문서 구조화)

| Skill | What | 설명 | 언제 |
|-------|------|------|------|
| `/minto` | Pyramid structurer | 파편화된 생각을 민토 피라미드로 재배치하여 논리적 빈칸 발견 | 메모·강의 노트·아이디어를 구조화할 때. SCQA·연역·귀납 지원 |

### Research (외부 조사)

| Skill | What | 설명 | 언제 |
|-------|------|------|------|
| `/research` | BP/표준/대안 리서치 | 내부 감사→갭 추론→외부 조사→합성 4단. 병렬 에이전트로 Best Practice·de facto 표준·대안을 Why/How/What/What-if + Mermaid로 합성 | "조사해줘", "best practice", "사실상 표준 뭐야", "다른 접근 없나" |

## 설치

```bash
/plugin marketplace add developer-1px/teo-claude-code
/plugin install teo-universal@teo-marketplace
```

## 설계 원칙

- 프로젝트 고유 용어 0건
- frontmatter `name` + `description` 필수
- 다른 스킬 호출 의존 없음 (독립 실행)
- 저장 경로는 프로젝트 관행을 감지하거나 사용자 확인 후 결정

향후 승격 후보는 [`ROADMAP.md`](ROADMAP.md) 참조.
