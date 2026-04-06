---
description: 구현 사이클 마무리 오케스트레이터. retrospect 완료 후 실행하여 L1 처리, PROGRESS/ARCHITECTURE 갱신, area 누적, 커밋, 다음 행동 제안을 순서대로 수행한다. "/close", "마무리", "정리하자", "닫자" 등을 말할 때 사용. retrospect 완료 후 자동으로 제안한다.
---

## 역할

구현 사이클의 **마무리 오케스트레이터**다. retrospect가 "뭘 했고 뭘 빠뜨렸나"를 분석하는 역할이라면, close는 "분석 결과를 반영하고 깔끔하게 닫는" 역할이다.

구현 코드의 test/simplify/commit은 이미 `/go`에서 완료된 상태다. `/close`가 다루는 건 **retrospect가 만든 변경분**(L1 수정, L2~L4 스킬/메모리 수정, docs 갱신, area MDX)의 마무리다.

## 파이프라인 위치

```
/go(implement → test → simplify → commit) → /retrospect(분석 + L2~L4 수정) → /close(마무리)
```

/go가 구현을 오케스트레이션하고, /retrospect가 분석과 자기 수정을 하고, /close가 남은 정리를 한다.

## Step 1: L1 코드 처리

retro 결과에 L1(코드 수정) 항목이 있으면:

- **즉시 수정 가능한 것** (작은 버그, 누락된 엣지케이스) → 수정 + test + simplify + commit (미니 /go 사이클)
- **별도 사이클이 필요한 것** → `/backlog`에 저장

retro 결과가 없으면 건너뛴다.

## Step 2: PROGRESS.md 갱신

`docs/PROGRESS.md`는 concept map이다. retro 결과를 반영한다:

- **모듈 추가/삭제** → 행 추가/제거
- **Maturity 변경** → retrospect가 판정한 수준으로 갱신
- **Gaps** → retrospect가 발견한 갭 기록

변경이 없으면 건너뛴다.

## Step 3: ARCHITECTURE.md 갱신

이번 사이클이 **레이어 경계를 바꿨을 때만** 갱신한다:

- 새 레이어/축/플러그인 추가
- 레이어 간 의존 방향 변경
- 모듈이 다른 레이어로 이동

단순 기능 추가/버그 수정 → 건너뛴다.

## Step 4: /publish 실행

`/publish` 스킬을 호출하여 Living Documentation 파이프라인을 실행한다:

- 7섹션 완전성 감사
- 역PRD → MD 이식 (retro 결과가 있으면)
- 데모·registry 완전성 확인
- /area 위임 (L2 ⬜→🟢 전환, L3 생성/갱신, 구조적 빈칸 발견)

변경된 module이 없으면 건너뛴다.

## Step 5: 커밋

retro + close에서 만든 변경분을 커밋한다:

- L1 수정 (Step 1에서 미니 사이클로 이미 커밋했으면 제외)
- L2~L4 스킬/메모리 수정 (retrospect가 만든 것)
- docs 갱신 (PROGRESS, ARCHITECTURE)
- Area MDX 갱신

```
docs: close cycle — [사이클 요약]
```

## Step 6: Push

커밋 완료 후 원격에 push한다.

```bash
git push
```

## Step 7: 다음 행동 제안

| 상황 | 제안 |
|------|------|
| L1 backlog 항목 생김 | "`/backlog pick`으로 다음 작업 선택" |
| L3 스킬 수정됨 | "스킬이 개선됐습니다. 다음 사이클에서 효과 확인" |
| 새 ⬜ 빈칸 발견 | "새 빈칸 N개: [목록]. backlog에 추가" |
| 경험 DB 승격 발생 | "경험 [N]이 feedback으로 승격됨 — [교훈 한 줄]" |
| 깔끔 | "사이클이 깔끔하게 닫혔습니다." |

## 산출물 요약

```markdown
## /close 결과

### 처리 내역
- [x] L1: [수정 N개 / backlog N개 / 해당 없음]
- [x] PROGRESS.md: [변경 내용 / 변경 없음]
- [x] ARCHITECTURE.md: [변경 내용 / 해당 없음]
- [x] /area: [갱신 내용 / 해당 없음]
- [x] 커밋: [해시] [메시지]

### 다음 행동
- [제안]
```

## 종료 조건

- 모든 단계 완료 (해당 없는 단계는 건너뜀)
- 커밋 성공
- 산출물 요약 제시
