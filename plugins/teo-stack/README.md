# teo-stack

현재 사용하는 Codex 개인 스킬 등록본을 미러링하는 플러그인.

## 구성

- Codex 등록본 미러: 현재 실행 계정의 skills 디렉터리에서 `.system`을 제외해 이 repo에 미러한 19개 스킬
- repo-only 활성 스킬: 없음
- 전체: 19개 활성 스킬

## 동기화 기준

현재 실행 계정의 Codex 등록본을 기준으로 한다. 기본 경로는 `~/.codex/skills`이며, 계정별로 저장 위치가 다르면 현재 세션에 등록된 경로를 확인한다.

- 같은 이름의 스킬은 Codex 등록본으로 덮어쓴다.
- `SKILL.md`뿐 아니라 `agents`, `scripts`, `references`, `assets` 같은 전체 하위 트리도 동일하게 맞춘다.
- `.system` 스킬은 OpenAI가 관리하는 기본 스킬이므로 repo 미러 대상에서 제외한다.
- repo-only 스킬은 삭제 요청이 있을 때만 제거한다.
- 퇴역 스킬은 명시적 재등록 요청 없이 활성 미러로 복원하지 않는다.

## Codex 등록본 미러

`app-owned-boundary-refactor`, `canonical-module-audit`, `cohesion`, `conflict`, `design-product-story-parity`, `discuss`, `doubt`, `entity-interface-refactor`, `layer-abstraction-refactor`, `main`, `naming`, `ocp`, `research`, `resolve-lint`, `responsibility-surface-refactor`, `same-lens`, `show-me`, `srp`, `teo-dev`

## 퇴역 스킬

`glossary`, `go-preflight-tree`, `minto`, `naming-audit`, `team`,
`migrate-to-codex`, `explain`, `ideal`, `reframe`은 활성 플러그인에서 제거하고
[`../../archive/teo-stack/skills`](../../archive/teo-stack/skills/)에 보관한다.

`migrate-to-codex`, `explain`, `ideal`, `reframe`은 2026-09-09 사용자 승인으로
퇴역했다. 본문과 scripts·references·assets 등 기존 하위 트리는 보존하며,
기본 등록이나 활성 플러그인 설치 대상에는 포함하지 않는다.

## 설치

```bash
/plugin marketplace add developer-1px/teo-claude-code
/plugin install teo-stack@teo-marketplace
```

## 운영 메모

- 현재 사용 중인 Codex 스킬을 수정한 뒤 repo에도 반영할 때는 Codex 등록본을 원본으로 다시 복사합니다.
- 과거 승격 기록은 [`ROADMAP.md`](ROADMAP.md)에 보관합니다.
