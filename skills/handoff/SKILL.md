---
name: handoff
description: 작업을 깔끔하게 마무리하거나 다음 세션으로 이어 넘기는 단일 오케스트레이터. 산업 표준 GitHub Flow (branch → commit → push → PR → CI → merge → cleanup) 위에 프로젝트 특유의 A0 역PRD 감사 + A1 verify 6단 + A8~A9 미완료 계승을 덧댄다. Blueprint PRD가 있으면 역PRD 체크리스트를 먼저 채우고 Blueprint ⊃ Implementation 검증을 통과해야 나머지 단계가 진행된다. 세션 시작 시 `/handoff`를 치면 가장 최근 미소비 handoff를 이어받는다. "/handoff", "마무리", "닫자", "정리하자", "여기까지", "다음에 이어서", "중단" 등 명시적 의도 표현 시 사용. **사용자가 명시적으로 호출할 때만 실행한다. AI가 자율 판단으로 발동하지 않는다.**
---

## 역할

작업 단위의 **경계선 오케스트레이터**. 산업 표준 dev-completion 시퀀스 (test → review gate → branch → PR → CI → merge → cleanup) 위에 이 프로젝트 특유의 두 층을 덧댄다:

1. **A0 Blueprint ⊃ Implementation 감사** — 역PRD 체크리스트 통과 없이는 merge 불가.
2. **A8~A9 미완료 계승** — 다 못한 건 backlog로 빼고, 다음 세션이 읽을 handoff 문서를 남긴다.

- **나가는 길**: verify → branch 격리 → commit → push → PR → CI → merge → cleanup → backlog/handoff 기록.
- **들어오는 길**: 지난 세션 handoff 문서를 집어 컨텍스트 복원 + 이어서 작업.

방향은 작업 상태로 자동 판단하되, 스킬 자체는 사용자가 `/handoff`를 칠 때만 실행된다.

## 절대 규칙

- **자율 발동 금지** — 대화 흐름만 보고 handoff 시점을 판단하지 않는다. 사용자의 명시적 트리거가 있을 때만.
- **SessionStart 훅은 알림만** — 미소비 handoff 감지 시 알림만. 자동 호출 금지.
- **main 직접 커밋/푸시 금지** — 로컬 main에 직접 commit하거나 `git push origin main` 하지 않는다. 언제나 feature branch + PR.
- **파괴적 작업은 확인** — main force-push, 대량 backlog 이동 등은 사용자 확인.

## Step 0: 방향 판단

```
dirty working tree / 내 커밋이 origin/main 에 미반영 → 나가는 길 (Step A)
working tree clean + mddb에 type=handoff, status!=consumed 파일 존재 → 들어오는 길 (Step B)
양쪽 다 해당 → 사용자에게 질문 ("이어받기 먼저? 마무리 먼저?")
양쪽 다 아님 → "마무리할 변경도, 이어받을 handoff도 없습니다" 보고 후 종료
```

---

## Step A: 나가는 길

### A0. Retrospect + 역PRD 감사 (**필수 선행 게이트**) — SPECIAL

verify/commit 이전에 Blueprint PRD와의 정합을 먼저 회고한다. 비어 있거나 위반이면 handoff는 여기서 멈춘다. **Blueprint ⊃ Implementation 불변**이 handoff의 1차 책임이다.

#### A0-1. 활성 Blueprint 탐지

세션 중 참조/수정된 Blueprint PRD — `docs/YYYY/YYYY-MM/YYYY-MM-DD/*Prd.md` 중 frontmatter `type: prd`에 `project`/`layer` 필드가 있는 것 (mddb 쿼리). 없으면 A0 전체 skip, A1로.

#### A0-2. 역PRD 체크리스트 채우기 (§7)

| 대상 섹션 | 확인 | 채울 필드 |
|----------|------|----------|
| 데이터 (§1) | 타입 실제 존재 | `file::TypeName` |
| 파일 (§2) | 파일 존재 + LOC | 실제 경로 + 라인 수 |
| Export (§3) | export 존재 + 시그니처 | `file::exportName` + 일치 여부 |
| 흐름 (§4) | 구현 vs pseudo-code | diff 요약 (없으면 "그대로") |
| 경계 (§5) | 각 경계 처리 여부 | ✅ / ❌ + 비고 |
| 검증 (§6) | 테스트 위치 | `file::testName` |

#### A0-3. Blueprint ⊃ Implementation 검증

- **§2 반증**: 파일 맵 외 경로에 구현이 나타났는가?
- **§3 반증**: §3에 없는 export가 구현에 등장했는가?
- **§4 반증**: 흐름도에 없는 경로가 있는가?
- **§5 반증**: §5 경계가 §6 시나리오에 모두 매핑되는가?
- **§1 불변식**: I1~I6 중 구현에서 강제되지 않는 것이 있는가?

#### A0-4. 판정

| 판정 | 조건 | 다음 |
|------|------|------|
| 🟢 통과 | 체크리스트 채워짐 + 반증 0 | A1로 |
| 🟡 경미 편차 | 일부 `(?)` 또는 Phase 1 skip 존재 | 사용자 승인 후 A1 |
| 🔴 위반 | 반증 발동 (§3 외 export 등) | **중단**, 수정 또는 Blueprint 갱신 후 재시도 |

### A1. Verify 게이트 — SPECIAL (강화)

표준 DoD는 "tests pass"가 최소이지만, 이 프로젝트는 verify 체인을 더 강하게 묶는다. 아래 순서대로 실행, 실패 발생 시 에이전트가 자율 수정 후 재검증:

1. `pnpm typecheck` — TS 에러 0
2. `pnpm lint` — eslint 에러 0
3. `pnpm test` — vitest 전체 통과
4. `pnpm check:deps` — 레이어 의존 위반 0
5. `/simplify` — 변경 코드 리뷰 + 자동 수정 (변경 시 1~4 재검증)
6. `/naming-audit` — 네이밍 점검 (변경 시 1~4 재검증)

**검증 범위**: 내 파일이 아닐 가능성이 있으면 `scripts/activeSessions.sh $SESSION_ID`로 동시 작업 확인. 타 세션의 기존 실패는 이 사이클 책임 아님.

### A2. Branch 격리

현재 git 상태에 따라 분기:

| 상태 | 조치 |
|------|------|
| 현재 브랜치가 main이고 로컬 main이 origin/main과 동일 | 새 feature branch 만들고 그 위에서 작업: `git switch -c fix/{slug}` |
| 현재 브랜치가 main이고 로컬 main이 **origin/main보다 앞서 있음** | **worktree + cherry-pick** 루트 — 내 커밋만 격리. 타 세션 커밋 혼입 방지. `git worktree add -b fix/{slug} ../{proj}-{slug} origin/main` + `git cherry-pick <내 커밋들>` |
| 현재 브랜치가 feature branch | 그대로 진행 |
| working tree dirty (uncommitted) | 내 파일만 명시 add (A3에서). `git add -A` 금지 — 타 세션 변경 섞임 방지 |

**왜 worktree인가**: 프로젝트 훅이 `git stash`와 `git branch -D`를 차단한다. worktree는 이 제약을 우회하면서 현재 작업 공간을 보존하는 표준 git 기능이다. 완료 후 A7에서 정리.

### A3. Commit

uncommitted 변경이 있으면 feature branch 위에서 커밋한다.

- `git status`로 내 파일 식별 후 **개별 add**. `git add -A`·`git add .` 금지.
- 커밋 메시지는 의도 중심. 형식은 프로젝트 CLAUDE.md 관례 (Conventional Commits 스타일: `fix(...)`, `feat(...)`).
- retro 보고서가 있으면 같은/별도 커밋으로 포함.
- **handoff 문서는 아직 커밋 금지** — A9에서 최종 내용(PR URL, merge hash)을 담아 커밋한다.

커밋이 이미 다 되어 있으면 skip.

### A4. Push + PR

feature branch를 원격에 올리고 PR 생성.

```bash
git push -u origin {feature-branch}
gh pr create --title "{제목}" --body "$(cat <<'EOF'
## Summary
- {1~3줄, "왜"와 "뭐" 중심}

## Changes
- {신규/수정/삭제 파일 요점}

## Verification
- {A1에서 통과한 체크 + 관찰된 동작}

## Test plan
- [ ] {수동 재현 단계}
- [ ] {엣지 케이스}
- [ ] {회귀 대상 기능}
EOF
)"
```

**Push 실패 시 원인을 보고하고 멈춘다.** `--force`·`--no-verify`·hook 우회는 금지. 하네스가 막는 이유가 있다.

PR URL을 기록한다 (A9에서 handoff 문서에 삽입).

### A5. CI 대기

GitHub Flow의 표준 gate. `gh pr checks <PR>`로 상태 확인:

| 상태 | 조치 |
|------|------|
| 모두 pass | A6로 |
| pending | **ScheduleWakeup 1200s** 후 1회 재확인. 여전히 pending이면 사용자에게 "CI 진행 중, 나중에 `/handoff` 재실행" 보고 후 세션 종료 (A9만 먼저 작성하여 다음 세션이 이어갈 수 있게) |
| fail | 원인 보고 후 중단. 수정 후 A3부터 재시도 |

**왜 1200s인가**: 프롬프트 캐시 TTL(5분)을 넘기는 대신 1회로 끝내는 트레이드오프. CI가 통상 1~3분이면 1200s 안에 거의 끝난다.

### A6. Merge strategy 결정 + 실행

커밋 수·성격으로 추천하되 **사용자 confirm 필수**.

| 휴리스틱 | 추천 | 이유 |
|---------|------|------|
| 1커밋 or WIP iterative 이력 | `--squash` | 메인 히스토리에 1 PR = 1 commit |
| 2~N개, 의미 분리 (feat + docs 등) | `--rebase` | 선형 히스토리 + 커밋 의도 보존 |
| 큰 도메인 변경 + merge commit 보존 필요 | `--merge` | bubble 남겨 컨텍스트 유지 |

```bash
gh pr merge <PR> --{strategy} --delete-branch
```

`--delete-branch`는 원격 브랜치 자동 삭제. merge 후 origin/main에서 merge commit hash를 확보 (`gh pr view <PR> --json mergeCommit -q .mergeCommit.oid`).

### A7. Cleanup

```bash
git worktree remove ../{proj}-{slug} --force   # A2에서 만든 worktree (있었으면)
git switch main                                 # 기존 브랜치로 복귀
git fetch origin                                # 원격 최신 상태
git branch -d {feature-branch}                  # 로컬 branch 삭제 (-d 소문자만 허용)
```

`git branch -d`가 "not fully merged"로 거부하면: rebase/squash merge로 해시가 달라져서 그럴 수 있다. 그 경우 사용자에게 보고하고 `-D` 금지 규칙 하에 판단을 맡긴다 (브랜치 남겨둬도 무해).

### A8. 남은 것 → backlog

대화와 산출물에서 미완료 신호 추출:

- 사용자가 말한 "다음에", "남은 것", "나중에", "일단 넘어가자", "TODO"
- 활성 PRD 중 역PRD 열이 비어있는 항목
- retro L1 중 이번에 수정하지 않은 항목
- verify 게이트가 발견했지만 타 세션 영역이라 미뤄둔 것
- CI가 실패했지만 내 범위 밖이었던 테스트

분류:

| 분류 | 위치 | 형식 |
|------|------|------|
| 한 줄로 충분 | `docs/YYYY/YYYY-MM/YYYY-MM-DD/{slug}.md` + `type: backlog` | 1~2줄 본문 + frontmatter |
| 배경·조건·검증 필요 | 위 경로 | 배경·내용·검증·출처 4섹션 + frontmatter |

PRD를 보류하는 경우 원본 frontmatter `type`을 `backlog`로 전환하거나 새 파일로 재생성. PARA 폴더 이동 불필요 — frontmatter가 SSOT.

**원칙**: 사용자에게 장황하게 나열하지 말고 A9 handoff 문서에서 링크로 보여준다.

### A9. Handoff 문서 생성 + 커밋 + Push

`docs/YYYY/YYYY-MM/YYYY-MM-DD/handoff{PascalCaseSlug}.md` 파일을 생성한다.

```markdown
---
id: handoff{PascalCaseSlug}
type: handoff
slug: handoff{PascalCaseSlug}
title: "Handoff: {제목}"
tags: [handoff, {domain}]
created: {YYYY-MM-DD}
updated: {YYYY-MM-DD}
status: open
summary: "한 줄 요약"
pr: "{PR URL}"
merge_commit: "{hash}"
---

# Handoff: {제목}

> {한 줄 요약 — 이 세션이 무엇을 했고 어디까지 갔는가}

## 완료

| 커밋 | 내용 |
|------|------|
| `{merge-commit-hash}` | {squash/rebase merge 제목} |

- PR: {URL}
- Merge strategy: {squash/rebase/merge}

## 남은 것

### 미완료 (다음 세션 첫 작업)
1. {구체 작업} — {관련 파일/PRD 경로}

### 이후 (backlog 링크)
- {항목} → `docs/YYYY/YYYY-MM/YYYY-MM-DD/{slug}.md` (type=backlog)

## 컨텍스트

- **PRD**: `docs/YYYY/YYYY-MM/YYYY-MM-DD/{slug}Prd.md`
- **관련 memory**: {있으면 파일명}
- **주의**: 다음 세션이 놓치면 안 되는 것 (디자인 의도, 실패한 접근, 미해결 질문)

## 이어받는 법

세션 교체 시 새 세션이 `/handoff`를 치면 Step B가 이 파일을 자동 집어간다.
구체적 첫 행동: {한 줄}
```

문서 작성 후:
- handoff 문서는 **별도 커밋으로 main에 바로 기록**할 수 없다 (main guard). 옵션:
  - **옵션 A**: 새 소규모 PR로 handoff 문서만 push/merge. 품이 크지만 깔끔.
  - **옵션 B**: 로컬에만 두고 다음 세션이 집어갈 수 있게 untracked로 유지. 원격과 어긋남.
  - **기본**: 옵션 A. handoff 문서는 "메타 작업" branch (`chore/handoff-{slug}`)로 별도 PR. 리뷰 불필요하면 self-merge (squash) 후 branch 삭제.

### A10. memory 노트 (선택)

handoff 핵심을 memory에 `project` 타입으로 저장. 포인터만 (파일명 + 한 줄). 본문은 handoff 파일에.

### A11. 결과 보고

```markdown
## /handoff (나가는 길) 완료

- [x] A0 역PRD 감사: {🟢/🟡}
- [x] A1 verify: typecheck · lint · test · deps · simplify · naming-audit
- [x] A2 branch: {feature-branch} ({worktree/in-place})
- [x] A3 commit: {해시} {메시지}
- [x] A4 push + PR: {URL}
- [x] A5 CI: {pass/timed-out}
- [x] A6 merge: {strategy} → {merge-commit}
- [x] A7 cleanup
- [x] A8 backlog: {N}건
- [x] A9 handoff 문서: {경로}

다음 세션이 `/handoff`를 치면 Step B가 이 파일을 집어갑니다.
```

---

## Step B: 들어오는 길

### B1. 가장 최근 미소비 handoff 선택

mddb 쿼리: `type=handoff, status!=consumed`. 여러 개면 `created` 최신을 기본 선택하고 목록을 보여준다. 사용자가 명시하지 않으면 최신으로 진행.

### B2. 컨텍스트 복원

선택된 handoff 파일을 읽고:
1. "완료" 섹션 — 지난 커밋/PR. 필요 시 `gh pr view` / `git show`로 실제 변경 확인.
2. "남은 것 > 미완료" — 다음 첫 행동.
3. "컨텍스트" — PRD·memory·주의사항. 필요한 파일 Read.
4. "이후" backlog — 이어받을지 사용자 선택.

working tree 깨끗한지 재확인. 다른 세션 흔적 있으면 사용자에게 보고.

### B3. 소비 표기

선택된 handoff 파일의 frontmatter 갱신:

```yaml
status: consumed
consumed_by: {세션 식별자 또는 YYYY-MM-DD-HHMM}
updated: {YYYY-MM-DD}
```

파일 삭제하지 않는다 — 이력 보존. mddb 쿼리(`status!=consumed`)에서 자동 필터링.

### B4. 이어서 작업

"미완료" 항목을 TaskCreate에 올리고, 사용자가 `/go`든 일반 대화든 편한 방식으로 이어가게 컨텍스트만 깔고 종료. 구현 오케스트레이션은 `/go`나 다른 스킬에 넘긴다.

### B5. 결과 보고

```markdown
## /handoff (들어오는 길) 완료

- 이어받은 handoff: {경로}
- 세션 주제: {제목}
- 첫 행동: {미완료 1번}
- PR(이전): {URL}

이어서 시작하세요.
```

---

## 기존 스킬과의 관계

이 스킬은 다음 3개 스킬을 흡수했다. 개별 스킬은 제거.

| 기존 | 흡수 위치 |
|------|---------|
| `/close` | Step A 전체 (A3 retro 반영, A4 push, A6 merge) |
| `/handoff` (구) | Step A9 문서 + Step B 수신 |
| `/backlog` (저장) | Step A8 (대화·retro 시그널 자동 추출) |
| `/backlog list` | Step B1 미소비 handoff 목록 + "이후" 섹션 |
| `/backlog pick` | Step B2 컨텍스트 복원 + 사용자 선택 |

## SessionStart 훅

`detectHandoff.mjs`는 미소비 handoff 목록만 세션 시작 알림으로 출력한다. 자동 호출 없음. 사용자가 직접 `/handoff`를 치기 전까지 조용하다.

## 외부 참고 (de facto 시퀀스)

이 스킬의 A2~A7은 **GitHub Flow + Definition of Done** 표준 시퀀스 그대로다:

- test pass (A1) → branch (A2) → commit (A3) → push + PR (A4) → CI (A5) → review (생략 가능) → merge (A6) → delete branch (A7).

프로젝트 특화 추가분은 A0(Blueprint 역검증)·A1 확장(typecheck 외 5 gate)·A8~A9(미완료 계승 문서)뿐. 나머지는 GitHub 공식 가이드와 일치한다. 특출난 절차를 만들지 말고 표준을 지키는 것이 협업의 비용을 최소화한다.

## 실패 모드 체크리스트

스킬 완료 전 AI가 스스로 확인:

- [ ] A1 verify 중 하나라도 실패인데 "통과"라고 쓰지 않았는가
- [ ] A4 push가 실제로 성공했는가
- [ ] A5 CI가 실제로 green인가 (`gh pr checks` 결과 확인)
- [ ] A6 merge가 실제로 완료됐는가 (`gh pr view --json state` = MERGED)
- [ ] A8 "남은 것"에 실제 미완료 빠뜨리지 않았는가
- [ ] A9 "미완료 첫 행동"이 다른 AI가 읽어도 재현 가능한 수준으로 구체적인가
- [ ] Step B에서 `consumed_by` 표기 실제로 썼는가
- [ ] main을 직접 건드리지 않았는가 (feature branch + PR 경유만)
