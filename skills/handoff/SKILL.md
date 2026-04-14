---
name: handoff
description: 작업을 깔끔하게 마무리하거나 다음 세션으로 이어 넘기는 단일 오케스트레이터. verify(typecheck/lint/test/simplify/naming-audit) → commit → push → 남은 것 backlog화 → handoff 문서 생성을 한 번에 처리한다. 세션 시작 시 `/handoff`를 치면 가장 최근 미소비 handoff를 이어받는다. "/handoff", "마무리", "닫자", "정리하자", "여기까지", "다음에 이어서", "중단" 등 명시적 의도 표현 시 사용. **사용자가 명시적으로 호출할 때만 실행한다. AI가 자율 판단으로 발동하지 않는다.**
---

## 역할

작업 단위의 **경계선 오케스트레이터**. 기존 close/handoff/backlog 3개 스킬이 담당하던 것을 하나로 수렴한다.

- **나가는 길**: 지금까지 한 일을 검증·커밋·push하고, 끝내지 못한 것은 backlog로 빼고, 다음 세션이 읽을 컨텍스트 문서를 남긴다.
- **들어오는 길**: 지난 세션이 남긴 handoff를 읽어 컨텍스트를 복원하고 이어서 작업한다.

방향(나가는/들어오는)은 작업 상태를 보고 자동 판단하되, 스킬 자체는 사용자가 `/handoff`를 칠 때만 실행된다.

## 절대 규칙

- **자율 발동 금지** — 대화 흐름만 보고 "지금 handoff할 시점이야"라고 판단해 실행하지 않는다. 사용자의 명시적 트리거가 있을 때만.
- **SessionStart 훅은 알림만** — 훅이 미소비 handoff를 감지해도 자동으로 스킬을 호출하지 않는다. 사용자에게 "미소비 handoff 있음"을 보고할 뿐이다.
- **파괴적 작업은 확인** — main 브랜치 push, 대량 backlog 이동 등은 사용자 확인 후 진행한다.

## Step 0: 방향 판단

```
git status가 dirty이거나 세션 시작 후 새 커밋이 있다 → 나가는 길 (Step A)
working tree가 깨끗하고 docs/0-inbox/handoff-*.md 중 consumed_by 없는 파일이 있다 → 들어오는 길 (Step B)
양쪽 다 해당 → 사용자에게 질문 ("이어받기 먼저? 아니면 지금까지 한 일 먼저 마무리?")
양쪽 다 아님 → "마무리할 변경도, 이어받을 handoff도 없습니다" 보고 후 종료
```

---

## Step A: 나가는 길 (end-of-work)

### A1. Verify 게이트

아래 체인을 순서대로 실행. 각 단계에서 실패 발생 시 에이전트가 자율적으로 수정한 후 재검증한다. 수정이 스킬/스펙 수준 변경을 요구하면 멈추고 사용자에게 보고.

1. `pnpm typecheck` — TypeScript 에러 0
2. `pnpm lint` — eslint 에러 0
3. `pnpm test` — vitest 전체 통과
4. `pnpm check:deps` — 레이어 의존 위반 0
5. `/simplify` — 변경 코드 품질·재사용·효율 리뷰 + 자동 수정 (수정 발생 시 1~4 재검증)
6. `/naming-audit` — 네이밍 일관성/적합성 점검 (수정 발생 시 1~4 재검증)

**검증 범위**: 세션 중 변경된 파일이 내 것이 아닐 가능성이 있으면 `scripts/activeSessions.sh $SESSION_ID`로 동시 작업 여부를 확인하고, 타 세션의 기존 실패는 이 사이클의 책임이 아니다.

### A2. Commit

uncommitted 변경이 있으면 커밋한다.

- `git status`로 대상 파일 식별. 타 세션이 같이 작업 중이면 **내 파일만 명시적으로 add**한다 (`git add -A` 금지).
- 커밋 메시지는 변경의 의도 중심으로 작성. 형식은 프로젝트 CLAUDE.md의 관례를 따른다.
- retro 보고서(`docs/**/retrospect-*.md` 또는 대화 중 생성된 L2~L4 수정)가 있으면 같은 커밋 또는 별도 커밋으로 포함.

변경이 없으면 건너뛴다.

### A3. retro 산출물 반영 (조건부)

retro 보고서가 존재하거나 대화 중 retro가 수행됐으면:

1. **L1 코드 갭** — 즉시 수정 가능한 건 지금 수정 + 재검증 + 커밋. 별도 사이클이 필요한 건 A5의 backlog로 넘긴다.
2. **PROGRESS.md** — 모듈 추가/삭제, Maturity, Gaps 갱신.
3. **ARCHITECTURE.md** — 레이어 경계가 바뀐 경우에만 갱신.
4. **`/publish`** — Living Documentation 파이프라인. module 단위 문서 완전성 감사 + area MDX 갱신.

retro가 없으면 이 단계 전체를 건너뛴다.

### A4. Push

- 현재 브랜치가 **feature/topic 브랜치**면 → `git push`를 바로 실행.
- 현재 브랜치가 **main/master**이면 → 사용자에게 먼저 확인 후 push.
- 원격 추적이 없으면 `-u origin <branch>`로 upstream 설정.
- 실패 시 원인을 보고하고 멈춘다. 강제 push, `--no-verify`는 금지.

### A5. 남은 것 → backlog

대화 컨텍스트와 산출물에서 미완료 신호를 추출한다:

- 사용자가 말한 "다음에", "남은 것", "나중에", "일단 넘어가자", "TODO"
- 활성 PRD 중 역PRD 열이 비어있는 항목
- retro L1 중 이번에 수정하지 않은 항목
- verify 게이트가 발견했지만 타 세션 영역이라 미뤄둔 것

각 항목을 **맥락 없이 이해 가능한가**로 분류한다:

| 분류 | 위치 | 형식 |
|------|------|------|
| 한 줄로 충분 | `docs/BACKLOGS.md` | `- [ ] {항목} — {출처} ({YYYY-MM-DD})` |
| 배경/조건/검증 필요 | `docs/5-backlogs/{camelCase}.md` | 배경·내용·검증·출처 4섹션 |

PRD가 있던 항목을 보류하는 경우 `git mv`로 `docs/5-backlogs/`에 옮겨 prds/에는 구현할 것만 남긴다.

**원칙**: 이 단계는 다음 Step A6 handoff 문서에 "남은 것"으로 반영되기 위한 전처리다. backlog 저장 자체가 작업 흐름을 끊어서는 안 되며, 추출한 항목을 사용자에게 장황하게 나열하지 말고 최종 handoff 문서에서 링크로 보여준다.

### A6. Handoff 문서 생성

`docs/0-inbox/handoff-{YYYY-MM-DD}-{slug}.md` 파일을 생성한다. `{slug}`는 세션 주제를 대표하는 camelCase/kebab-case 짧은 이름.

```markdown
---
created_at: {YYYY-MM-DD}
session_id: {세션 식별자 — 가능한 경우}
---

# Handoff: {제목}

> {한 줄 요약 — 이 세션에서 무엇을 했고 어디까지 갔는가}

## 완료

| 커밋 | 내용 |
|------|------|
| `abc1234` | 설명 |

## 남은 것

### 즉시 (다음 세션 첫 작업)
1. [구체적 작업] — [관련 파일 경로 또는 PRD 경로]

### 이후 (backlog 링크)
- [항목] → `docs/5-backlogs/xxx.md` 또는 `docs/BACKLOGS.md#항목`

## 컨텍스트

- **PRD**: `docs/2-areas/.../xxx-prd.md`
- **관련 memory**: (있으면 파일명)
- **주의**: 다음 세션이 놓치면 안 되는 것 (디자인 의도, 실패했던 접근, 미해결 질문)

## 이어받는 법

다음 세션에서 `/handoff`를 치면 이 파일을 자동으로 찾아 읽는다.
구체적 첫 행동: [한 줄]
```

### A7. memory 노트 (선택)

handoff의 핵심을 memory에 project 타입으로 저장. 다음 세션 memory 로드 시 "최근 handoff 있음"을 AI가 인지할 수 있는 짧은 포인터. 본문은 handoff 파일에 있으므로 memory에는 파일명과 한 줄 요약만.

### A8. 결과 보고

```markdown
## /handoff (나가는 길) 완료

- [x] verify: typecheck · lint · test · deps · simplify · naming-audit
- [x] commit: {해시} {메시지}
- [x] push: {브랜치} → origin
- [x] backlog: {N}건 이동 (간단 M건, 상세 K건)
- [x] handoff 문서: docs/0-inbox/handoff-{date}-{slug}.md

다음 세션에서 `/handoff`로 이어받을 수 있습니다.
```

---

## Step B: 들어오는 길 (resume)

### B1. 가장 최근 미소비 handoff 선택

`docs/0-inbox/handoff-*.md` 중 frontmatter에 `consumed_by`가 없는 것만 대상. 여러 개면 `created_at` 최신 1개를 기본 선택하고 나머지를 목록으로 보여준다.

```
미소비 handoff:
  1. 2026-04-14 theme-merge (가장 최근) ← 기본 선택
  2. 2026-04-12 composites-gap
  3. ...

1번으로 이어받을까요? 다른 걸 고르려면 번호를 지정하세요.
```

사용자가 명시하지 않으면 1번으로 진행.

### B2. 컨텍스트 복원

선택된 handoff 파일을 읽고:

1. "완료" 섹션 — 지난 커밋 요약. 필요하면 `git show` / `git log`로 실제 변경 확인.
2. "남은 것" > "즉시" — 다음 첫 행동.
3. "컨텍스트" — PRD, memory 포인터, 주의사항. 필요한 파일을 Read한다.
4. "이후" 백로그 링크 — 지금 이어받을 세션에서 같이 처리할지 사용자에게 선택권을 준다.

현재 working tree가 깨끗한지 재확인. 사전에 다른 세션이 손댄 흔적이 있으면 사용자에게 보고.

### B3. 소비 표기

선택된 handoff 파일의 frontmatter에 다음 필드를 추가한다:

```yaml
consumed_by: {세션 식별자 또는 YYYY-MM-DD-HHMM}
consumed_at: {YYYY-MM-DD}
```

이후 훅과 Step B1의 목록에서 자동으로 필터링된다. 파일 삭제는 하지 않는다 — 이력 자료로 남긴다.

### B4. 이어서 작업

"즉시" 항목을 현재 세션의 첫 할 일로 TaskCreate에 올리고, 사용자가 `/go`든 일반 대화든 편한 방식으로 이어갈 수 있게 컨텍스트만 깔아둔 상태에서 스킬을 종료한다. handoff 스킬은 이어받기의 시작만 담당한다 — 구현 오케스트레이션은 `/go`나 다른 스킬로 넘긴다.

### B5. 결과 보고

```markdown
## /handoff (들어오는 길) 완료

- 이어받은 handoff: `docs/0-inbox/handoff-{date}-{slug}.md`
- 세션 주제: {제목}
- 첫 행동: {즉시 항목 1번}
- 관련 PRD/memory: (목록)

이어서 작업을 시작하세요.
```

---

## 기존 스킬과의 관계

이 스킬은 다음 3개 스킬의 역할을 흡수한다. 개별 스킬은 제거된다.

| 기존 | 흡수 위치 |
|------|---------|
| `/close` | Step A 전체 (특히 A3의 retro 반영, A4 push) |
| `/handoff` (구) | Step A6 문서 생성 + Step B 수신 |
| `/backlog` (저장) | Step A5 자동화 (대화·retro 시그널에서 추출) |
| `/backlog list` | Step B1 미소비 handoff 목록 + handoff 문서의 "이후" 섹션 |
| `/backlog pick` | Step B2 컨텍스트 복원 + 사용자 선택 |

조회·꺼내기를 별도 커맨드로 분리하지 않은 이유: 작업 재개는 곧 가장 최근 handoff를 이어받는 것과 같고, 그 안에 backlog 링크가 이미 포함되어 있다. 사용자가 따로 "뭐 밀렸더라?" 하고 묻는 상황이 있으면 그때 평소 대화로 파일을 열어보면 된다 — 전용 커맨드가 작업 흐름을 더 매끄럽게 하지 않는다.

## SessionStart 훅

기존 `detectHandoff.mjs` 훅은 유지한다. 역할만 명확히 한다:

- 미소비 handoff 파일 목록을 세션 시작 알림으로 출력한다.
- 이 스킬을 자동 호출하지 않는다.
- 사용자가 직접 `/handoff`를 치기 전까지 아무 동작도 하지 않는다.

## 실패 모드 체크리스트

스킬 완료 전에 AI가 스스로 확인할 것:

- [ ] verify 체인 중 하나라도 실패인데 "통과"라고 쓰지 않았는가
- [ ] push가 실제로 성공했는가 (`git log @{u}..` 비어있는지)
- [ ] "남은 것"에 실제로 있는 미완료를 빠뜨리지 않았는가
- [ ] handoff 파일의 "즉시" 항목이 다른 AI가 읽어도 재현 가능한 수준으로 구체적인가
- [ ] Step B에서 `consumed_by` 표기를 실제로 썼는가
