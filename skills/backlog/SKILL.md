---
description: 작업 중 발견한 "지금은 아닌 것"을 백로그로 저장·조회·꺼내기. "백로그에 두자", "나중에 하자", "일단 넘어가자", "/backlog", "/backlog list", "/backlog pick" 등을 말할 때 사용. 작업 흐름을 끊지 않으면서 할 일을 잃지 않는 것이 목적이다.
---

## /backlog — 저장·조회·꺼내기

작업 중 "이건 지금 할 게 아닌데 잊으면 안 돼"를 잡아두는 스킬이다. 대화에서 휘발되는 것을 방지한다.

## 저장 위치

| 규모 | 위치 | 용도 |
|------|------|------|
| 간단 | `docs/BACKLOGS.md` | 맥락 없이 한 줄로 충분한 항목 |
| 상세 | `docs/5-backlogs/{제목}.md` | 배경·조건·검증 방법이 필요한 항목 |

판단 기준: **"이 항목을 3일 후에 봤을 때 맥락 없이 이해할 수 있는가?"**
- 이해 가능 → `BACKLOGS.md` 한 줄
- 맥락 필요 → `5-backlogs/` 독립 문서

## 명령

### 1. 저장 (기본)

트리거: "백로그에 두자", "나중에 하자", "일단 넘어가자", `/backlog`

**간단 항목 → BACKLOGS.md**

```markdown
## Backlog

- [ ] {항목} — {출처: 대화 요약 또는 retro 보고서 경로} ({YYYY-MM-DD})
```

- 파일이 없으면 생성, 있으면 append
- 체크박스 형식 (`- [ ]`)
- 날짜는 작성일

**상세 항목 → docs/5-backlogs/{제목}.md**

```markdown
# {제목} — {YYYY-MM-DD}

## 배경

{왜 이게 필요한가, 어떤 맥락에서 나왔는가}

## 내용

{구체적으로 무엇을 해야 하는가}

## 검증

{이게 제대로 됐는지 어떻게 확인하는가}

## 출처

{대화 요약 또는 retro 보고서 경로}
```

파일명은 camelCase, 내용을 대표하는 이름으로 짓는다 (예: `eventBubblingGuard.md`, `axisCompleteness.md`).

저장 후 파일 경로만 알려주고, 현재 작업 흐름으로 바로 복귀한다. 백로그 저장이 작업을 끊어서는 안 된다.

### 2. 조회 (`/backlog list`)

트리거: `/backlog list`, "백로그 뭐 있어", "밀린 거 보여줘"

1. `docs/BACKLOGS.md`에서 미완료 항목(`- [ ]`)을 읽는다
2. `docs/5-backlogs/` 파일 목록을 읽는다
3. 통합 목록을 보여준다:

```
## 백로그 현황

### 간단 (BACKLOGS.md)
- [ ] 항목1 (2026-03-15)
- [ ] 항목2 (2026-03-18)

### 상세 (5-backlogs/)
- eventBubblingGuard.md — 중첩 렌더링 이벤트 버블링 가드 적용
- axisCompleteness.md — 축 완전성 점검
```

### 3. 꺼내기 (`/backlog pick`)

트리거: `/backlog pick`, "백로그에서 하나 하자", "밀린 거 하나 꺼내자"

1. 전체 백로그를 읽는다 (list와 동일)
2. **현재 브랜치·작업 맥락**을 파악한다 (git branch, 최근 커밋, 진행 중인 작업)
3. 맥락과 관련성이 높은 항목을 추천한다. 각 항목에 **다음 행동**을 명시한다:

```
현재 브랜치: feat/kanban-showcase

추천:
1. ⭐ eventBubblingGuard.md — 칸반에서 중첩 렌더링 사용 중, 지금 같이 처리하면 효율적
   → /discuss로 범위 확정 후 /go
2. axisCompleteness.md — 축 작업과 관련 있지만 별도 브랜치가 나을 수 있음
   → /discuss로 스코프 논의

번호를 선택하면 바로 연결합니다.
```

4. 사용자가 선택하면 **즉시 해당 스킬을 호출**한다:
   - 상세 항목 → 문서를 읽고 `/discuss` 호출
   - 간단 항목 → 바로 `/go` 호출
5. 완료 후 해당 항목을 체크한다:
   - `BACKLOGS.md`: `- [ ]` → `- [x]`
   - `5-backlogs/`: 파일 상단에 `> ✅ 완료 — {YYYY-MM-DD}` 추가

## retro 연동

`/retrospect`가 L1(코드 갭)을 발견했을 때, 즉시 수정하지 않는 항목은 이 스킬로 백로그에 저장한다. retro 보고서 경로를 출처에 기록한다.

## PRD 보류 연동

백로그에 넣는 항목이 `docs/superpowers/specs/`에 PRD가 있는 경우, 해당 PRD를 backlog 문서로 이동한다. specs/에는 구현할 것만 남겨야 하므로, 보류 결정 = PRD를 specs/에서 내리는 것이다.

```bash
git mv docs/superpowers/prds/YYYY-MM-DD-feature-prd.md docs/5-backlogs/
```

## 규칙

- 저장 후 현재 작업을 이어간다. 백로그 저장 때문에 흐름이 끊기면 안 된다.
- `/backlog list`와 `/backlog pick`은 대화 응답으로 보여준다 (파일 생성 아님).
- 완료된 항목은 삭제하지 않고 체크 표시로 남긴다 (이력 추적).
- specs/에 있던 PRD를 백로그로 내릴 때는 반드시 `git mv`로 이동한다.
