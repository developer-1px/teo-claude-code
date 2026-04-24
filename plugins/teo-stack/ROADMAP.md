# teo-stack 승격 로드맵

범용 플러그인에 포함될 후보 스킬을 티어로 관리합니다. 티어가 올라올 때마다 `plugins/teo-stack/skills/`로 `git mv`합니다.

## 승격 기준

스킬이 아래 3조건을 모두 만족하면 승격 가능:

1. **프로젝트 고유 용어 0건** — `interactive-os`, `ax()`, `module.css`, `PROGRESS`, MDX, PARA, `docs/0-inbox`, `L1/L2/L3` 등 금지어 없음
2. **frontmatter 완비** — `name`과 `description` 둘 다 존재, description은 "트리거 신호 + 무엇을 + 산출물" 3요소로 구성
3. **독립 실행** — 다른 내부 스킬 호출(`/discuss`, `/go`, `/prd`, `/fix` 등)에 의존하지 않음

## Tier 1 — 다음 배치

가벼운 리팩토링(프로젝트 전제 제거)만 하면 승격 가능.

| Skill | 현재 위치 | 필요 작업 |
|-------|----------|----------|
| `design-extract` | teo-project | 토큰 저장 경로 하드코딩 제거, 사용자 확인 후 저장 |
| `story` | teo-project | 후속 `/prd` 의존 언급 완화 |
| `ia` | teo-project | `/wireframe` 연결 문구 일반화 |
| `prd` | teo-project | CLAUDE.md FE 책임 맵 의존 → 일반 "프로젝트 파일 구조" 인터뷰로 |
| `improve` | teo-project | 프로젝트별 Job 정의 훅으로 분리 |
| `antipattern` | teo-project | 특정 훅 파일명(`guardOsPatterns.mjs` 등) → 일반 예시로 |

### 승격 완료 (참고)

- `v0.1.0` — Thinking 5 + minto + research (초기 7개)
- `v0.2.0` — `/discuss` 허브 승격, 허브-스포크 관계 복원
- `v0.3.0` — `/team` 승격 (teo-universal → teo-stack 네이밍 변경 포함)
- `v0.4.0` — Code Quality 3종(`/srp`, `/ocp`, `/naming-audit`) 승격

## Tier 2 — 중간 리팩토링 필요

| Skill | 필요 작업 |
|-------|----------|
| `inbox` | 날짜 폴더 규약(`docs/YYYY/YYYY-MM/YYYY-MM-DD/`) 하드코딩 제거, 적응형 저장 |
| `para` | PARA 전제 완화 또는 PARA 선택 사항화 |
| `story` | 유저스토리 맵을 프로젝트 파이프라인(`/discuss`→`/prd`)과 분리 |

## Tier 3 — 승격 보류

파이프라인 오케스트레이션 계층이라 범용화해도 가치가 적거나 구조 자체가 프로젝트 전제.

- `discuss`, `go`, `do`, `close`, `team`, `auto`, `handoff`
- `area`, `publish`, `archive`, `backlog`
- `ia`, `wireframe`, `blueprint`, `design-think`, `design-think-v2`, `mockup`, `layout-score`
- `antipattern`, `improve`, `improve-skill`, `use`, `screen-test`

## 작업 방식

1. 후보 스킬 하나를 선택해 범용화 감사(에이전트 또는 수동)로 프로젝트 의존 지점을 모두 나열
2. SKILL.md를 범용화 편집 (Thinking 5 때와 동일한 규칙)
3. 정적 검사: 금칙어 grep 0건
4. `git mv plugins/teo-project/skills/<name> plugins/teo-stack/skills/<name>`
5. `plugins/teo-stack/README.md`에 추가, 본 ROADMAP에서 해당 행 제거
6. 버전 bump: `teo-stack`의 `plugin.json` minor +1
