---
name: para
description: docs/0-inbox/ 문서를 PARA 원칙에 따라 분류하고 이동한다. "inbox 정리", "문서 정리", "para", "/para" 등 inbox 관리 의도가 보이면 사용. inbox에 문서가 쌓여있을 때 주기적으로 사용을 제안해도 좋다.
---

## 목적

`docs/0-inbox/`는 빠르게 기록하기 위한 임시 착지점이다. 시간이 지나면 문서가 쌓이고, 찾기 어려워지고, 사용되지 않는다. 이 스킬은 inbox 문서를 읽고 PARA 분류에 따라 올바른 위치로 이동시켜 — 지식을 찾을 수 있는 곳에 둔다.

**inbox를 전부 비우는 것이 목표가 아니다.** 판단이 애매하거나, 아직 진행 중이거나, pending 액션이 남아있는 문서는 inbox에 그대로 둔다. 확실히 역할이 끝났거나 명확히 다른 곳에 속하는 것만 이동한다.

## PARA 폴더 매핑

| 분류 | 폴더 | 기준 |
|------|-------|------|
| **Areas** | `docs/2-areas/` | 지속적으로 유지·갱신하는 living doc. 모듈/레이어 문서, 아키텍처 비전, 설계 원칙 |
| **Resources** | `docs/3-resources/` | 참고용 지식. 외부 조사, 방법론, 디자인 토큰 분석, 패턴 비교 |
| **Archive** | `docs/4-archive/` | 역할이 끝난 문서. retro(액션 추출 완료), 기각된 제안, 완료된 일회성 분석 |
| **Inbox 유지** | `docs/0-inbox/` | 아직 판단 불가하거나, 진행 중인 논의의 일부 |

## 태그별 기본 분류 힌트

태그는 판단의 출발점이지 결정이 아니다. 내용을 읽고 최종 판단한다.

| 태그 | 경향 | 판단 포인트 |
|------|------|------------|
| `[retro]` | Archive | BACKLOGS.md에 액션이 이미 추출됐으면 → archive. 미추출 액션이 있으면 먼저 추출 후 archive |
| `[explain]` | Areas | 특정 모듈/개념의 해설이면 해당 area 하위로. 범용 개념이면 resources |
| `[vision]` | Areas | 현행 방향이면 areas. 기각/대체됐으면 archive |
| `[decision]` | Areas | 설계 결정 기록 — 해당 모듈 area에 병합 또는 독립 유지 |
| `[sample]` | Archive | 일회성 예시면 archive. 참고 가치가 높으면 resources |
| `[resource]` | Resources | 거의 항상 resources |

## 실행 절차

### Step 1: 스캔

`docs/0-inbox/` 전체를 읽고 분류 테이블을 만든다.

```markdown
| # | 파일 | 태그 | 제안 | 이동 경로 | 근거 |
|---|------|------|------|-----------|------|
| 1 | 29-[retro]history-delta.md | retro | Archive | docs/4-archive/ | BACKLOGS.md에 액션 추출 완료 |
| 2 | 32-[explain]useAria.md | explain | Areas | docs/2-areas/primitives/ | useAria 모듈 해설 |
| ... | | | | | |
```

**분류 판단 시 확인할 것:**
- `[retro]` 문서: BACKLOGS.md에서 해당 retro를 출처로 하는 항목 검색. 모든 액션이 추출됐는지 확인
- `[explain]` 문서: `docs/2-areas/` 하위에 대응하는 파일이 있는지 확인. 있으면 병합 후보
- 내용이 현재 코드베이스와 괴리가 크면 archive 후보 (예: 삭제된 모듈 해설)

### Step 2: 사용자 확인

테이블을 보여주고 사용자 피드백을 받는다. 사용자가 행 단위로 수정할 수 있다.

"제안대로 진행할까요? 수정할 항목이 있으면 번호로 알려주세요."

### Step 3: 실행

승인된 항목을 `git mv`로 이동한다.

- **Areas 이동 시**: 대상 area 폴더 경로를 정확히 확인. 없으면 새 하위 폴더 생성 여부를 사용자에게 확인
- **Resources 이동 시**: `docs/3-resources/` 파일명 규칙 준수 — `{순번}-[{태그}]{제목}.md` (순번은 폴더 내 마지막 번호 + 1)
- **Archive 이동 시**: `docs/4-archive/`로 이동. 원본 파일명 유지
- **병합 대상**: area 문서에 내용을 병합하고, inbox 원본은 archive로 이동

### Step 4: 결과 보고

이동 결과를 요약하고, inbox에 남은 문서 수를 보고한다.

```
완료: 15개 이동 (Areas 4, Resources 3, Archive 8)
inbox 잔여: 12개
```
