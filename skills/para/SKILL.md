---
name: para
description: 오래된 inbox 문서(type=inbox, status 미소비)를 읽고 frontmatter의 type/status/project/layer/tags를 적절히 승격시켜 지식으로 편입시킨다. "inbox 정리", "문서 정리", "para", "/para" 등 inbox 관리 의도가 보이면 사용. inbox 문서가 쌓여있을 때 주기적으로 사용을 제안해도 좋다.
---

## 목적

mddb 쿼리 `type=inbox` 문서는 빠르게 기록하기 위한 임시 상태이다. 시간이 지나면 쌓이고, 찾기 어려워지고, 사용되지 않는다. 이 스킬은 inbox 문서를 읽고 frontmatter를 **승격 분류**(resource/area/archive/prd 등)로 갱신해 지식을 찾을 수 있는 의미 필드로 옮긴다.

**모든 inbox를 다 승격시키는 것이 목표가 아니다.** 판단이 애매하거나, 아직 진행 중이거나, pending 액션이 남아있는 문서는 `type: inbox` 그대로 둔다. 확실히 역할이 끝났거나 명확히 다른 범주에 속하는 것만 승격한다.

## 승격 매핑

폴더는 이미 날짜(생성일)로 고정되어 있다. 이동은 없고 **frontmatter만 갱신**한다.

| 승격 대상 | frontmatter 변경 | 기준 |
|----------|-----------------|------|
| Area (지속 갱신 living doc) | `type: area` + `layer: <layer>` 또는 `project: <project>` | 모듈/레이어 문서, 아키텍처 비전, 설계 원칙 |
| Resource (참고 자료) | `type: resource` + 관련 tags | 외부 조사, 방법론, 디자인 토큰 분석, 패턴 비교 |
| Archive (역할 종료) | `status: archived` 또는 `type: archive` | retro(액션 추출 완료), 기각된 제안, 완료된 일회성 분석 |
| Inbox 유지 | 그대로 | 아직 판단 불가하거나, 진행 중인 논의의 일부 |

## 태그/내용별 기본 승격 힌트

내용을 읽고 최종 판단한다. 아래는 출발점.

| 시그널 | 경향 | 판단 포인트 |
|-------|------|-------------|
| retro 관련 | Archive | 파생된 backlog(`type=backlog`) 항목이 모두 생성됐으면 → `status: archived`. 아직이면 backlog부터 추출 |
| 모듈/개념 해설 | Area | 해당 layer/project의 기존 area 문서가 있는지 확인. 있으면 병합 후 원본은 `status: archived` |
| vision/방향 | Area | 현행 방향이면 `type: area`. 기각/대체됐으면 `status: archived` |
| decision (설계 결정) | Area 또는 별도 유지 | 해당 모듈 area에 병합 또는 `type: decision` 독립 유지 |
| 일회성 예시/샘플 | Archive | 참고 가치가 높으면 `type: resource`로 |
| 외부 조사/자료 | Resource | 거의 항상 `type: resource` |

## 실행 절차

### Step 1: 스캔

mddb 쿼리 `type=inbox`로 inbox 문서 전체를 얻고 분류 테이블을 만든다.

```markdown
| # | 파일 | 현재 tags | 제안 type | 추가 필드 | 근거 |
|---|------|----------|-----------|-----------|------|
| 1 | docs/2026/.../historyDelta.md | [retro] | archive (status: archived) | — | 파생 backlog 전부 추출 완료 |
| 2 | docs/2026/.../useAriaExplain.md | [explain] | area | layer: primitives | useAria 모듈 해설 |
| ... | | | | | |
```

**분류 판단 시 확인할 것:**
- retro 문서: `type=backlog`인 항목 중 이 retro를 출처로 하는 것이 모두 있는지 확인
- explain 문서: mddb 쿼리 `type=area, layer=<layer>`로 대응 area 존재 확인 → 있으면 병합 후보
- 내용이 현재 코드베이스와 괴리가 크면 archive 후보 (예: 삭제된 모듈 해설)

### Step 2: 사용자 확인

테이블을 보여주고 사용자 피드백을 받는다. 행 단위 수정 가능.

"제안대로 frontmatter 갱신할까요? 수정할 항목이 있으면 번호로 알려주세요."

### Step 3: 실행

승인된 항목의 frontmatter를 Edit으로 갱신한다. 파일 이동은 없다.

- **Area 승격**: `type: area` + `layer` 또는 `project` 필드 추가. 기존 area 문서와 내용 병합 가능한 경우 병합 후 원본은 `status: archived`
- **Resource 승격**: `type: resource` + 분류 tags 보강
- **Archive 전환**: `status: archived` 또는 `type: archive` 설정
- **병합**: 대상 area 파일에 내용 추가하고 원본은 `status: archived, consumed_by: <대상 파일>`

### Step 4: 결과 보고

```
완료: 15건 frontmatter 갱신 (Area 4, Resource 3, Archive 8)
남은 inbox (type=inbox): 12건
```
