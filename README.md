# teo-claude-code

Claude Code skills & hooks plugin for interactive-os development.

## Skills Cheat Sheet

### Pipeline (파이프라인)

| Skill | What (EN) | 설명 (KR) | When / Why |
|-------|-----------|-----------|------------|
| `/discuss` | Structured work discussion | 업무 논의 구조화 | 요청이 모호할 때. "왜 하는지, 뭘 모르는지"를 TOC 11요소로 정리하여 방향부터 맞춤 |
| `/story` | User story map builder | 유저스토리 맵 인터뷰 | discuss 이후, PRD 이전. "어떤 구현 단위가 필요한가"를 사용자 체감 언어로 도출 |
| `/prd` | Implementation spec writer | 구현 명세(PRD) 작성 | 방향은 잡혔는데 구체적 동작이 미정일 때. 실행 전 디테일을 파일로 채움 |
| `/cast` | Agent team composer | 에이전트 편성표 산출 | 실행 전. 과제의 복잡도를 판단하여 서브에이전트 편성 또는 단독 실행 결정 |
| `/go` | Autonomous executor | 자율 실행 오케스트레이터 | "실행해", "만들어줘". 상황 판단 후 Plan→Execute→Verify 자율 완주 |
| `/do` | OS-based dev pipeline | os 기반 8단계 파이프라인 | "구현해", "코딩해". os 부품 조립 패러다임으로 요구사항을 분해·실행 |
| `/close` | Cycle closer | 구현 사이클 마무리 | retrospect 완료 후. L1 처리, PROGRESS 갱신, area 누적, 커밋, 다음 행동 제안 |

### Thinking (사고 도구)

| Skill | What (EN) | 설명 (KR) | When / Why |
|-------|-----------|-----------|------------|
| `/ideal` | Outcome simulator | 이상적 결과를 산출물로 시뮬레이션 | "다 되면 어떤 모습?"이 추상적일 때. 코드/다이어그램/저니맵으로 구체화 |
| `/conflict` | Evaporating Cloud | 대립해소도로 숨겨진 전제 발견 | A vs B 딜레마. 양립 불가 상황에서 전제를 찾아 돌파구를 만듦 |
| `/doubt` | Occam's Gate filter | 4단 필터로 불필요한 것 제거 | "이거 다 필요해?". 구현 후 정리, 새 추상화 도입 전 검증 |
| `/explain` | Minto Pyramid explainer | 민토 피라미드 원칙으로 해설 문서 생성 | "이게 뭐야", "왜 이렇게 했어". 답 먼저, Why 그 다음, Mermaid 다이어그램 필수 |
| `/reframe` | Stop & redefine | 반창고 수정 중단, 문제 재이해 | "그거 아니야", "왜 자꾸 그래". LLM이 문제를 잘못 이해한 채 패칭할 때 |

### Quality (품질 루프)

| Skill | What (EN) | 설명 (KR) | When / Why |
|-------|-----------|-----------|------------|
| `/fix` | Auto reproduce & debug | 자동 재현→디버깅→수정 | "안 돼", "고장". 최근 작업물이 깨졌을 때 |
| `/improve` | Release quality loop | 릴리즈 품질 루프 | "개선해", "더 다듬어". 기능이 아닌 사용자 Job 기준으로 제품 평가·개선 |
| `/improve-design` | Screenshot design loop | 스크린샷 기반 디자인 검증 루프 | "디자인 개선". 위반 채점→수정→재촬영→9/10+ 달성까지 반복 |
| `/improve-skill` | Skill & hook patcher | 스킬/훅 패치 | retrospect 후. 판정 결과를 받아 스킬과 훅을 구체적으로 개선 |
| `/use` | Browser QA agent | 브라우저로 직접 사용하여 QA | "써봐", "테스트해봐". 에이전트가 제품을 실사용하여 문제 발견·개선 |
| `/demo-coverage` | Branch map → demo + test | 분기 맵 추출→데모·테스트 생성 | "데모 만들어", "커버리지 올려". 소스 코드 기반 code-first 루프 |

### Code Quality (코드 품질)

| Skill | What (EN) | 설명 (KR) | When / Why |
|-------|-----------|-----------|------------|
| `/srp` | Single Responsibility audit | 단일 책임 원칙 점검·리팩토링 | "파일이 너무 크다", "쪼개자". 파일명과 실제 책임의 불일치를 찾음 |
| `/ocp` | Open-Closed audit | 개방-폐쇄 원칙 점검·리팩토링 | "switch 너무 많다", "분기 정리". 수정 지점을 1곳으로 줄이는 확장 구조 설계 |
| `/refactor-collect` | Convention collector | 프로젝트 전용 리팩토링 컨벤션 수집 | 코드리뷰 중. 사용자의 개선 요청을 추상화하여 누적 |
| `/antipattern` | Hook harness converter | 안티패턴을 훅 하네스로 전환 | "이거 하지 마". 메모리가 아닌 정적 검사 규칙으로 재발 구조적 차단 |

### Design (디자인)

| Skill | What (EN) | 설명 (KR) | When / Why |
|-------|-----------|-----------|------------|
| `/design-implement` | ax() axis system UI | ax() 12축으로 UI 구현 | CSS 작성 시. ax() 사용 강제, module.css는 last-mile만 |
| `/design-extract` | Reference token extractor | 레퍼런스 사이트 디자인 토큰 실측 추출 | "이 사이트 디자인 따라해". 생성이 아닌 실측 수치 추출 |

### Documents (문서 관리)

| Skill | What (EN) | 설명 (KR) | When / Why |
|-------|-----------|-----------|------------|
| `/inbox` | Save to inbox | 요청을 docs/0-inbox/ 문서로 저장 | "메모해줘", "문서로 남겨". 답변 대신 기록 |
| `/para` | PARA classifier | inbox 문서를 PARA 원칙으로 분류·이동 | "inbox 정리". 쌓인 문서를 주기적으로 정리 |
| `/area` | Area MDX updater | Area MDX 문서 갱신·누적 | retrospect 후. ⬜→🟢 전환, 새 L3 MDX 생성 |
| `/publish` | Living docs orchestrator | 문서 완전성 감사·빈 곳 채우기 | "문서 완전한가". module/layer 단위로 역PRD 이식, 데모·registry 확인 |
| `/backlog` | Parking lot | "지금은 아닌 것" 저장·조회·꺼내기 | "나중에 하자". 작업 흐름을 끊지 않으면서 할 일을 잃지 않음 |
