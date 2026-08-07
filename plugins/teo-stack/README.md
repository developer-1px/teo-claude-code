# teo-stack

현재 사용하는 Codex 개인 스킬 등록본과 repo 전용 오리지널 스킬을 함께 보관하는 플러그인.

## 구성

- Codex 등록본 미러: `~/.codex/skills`에서 `.system`을 제외해 이 repo에 미러한 14개 스킬
- repo-only 스킬: 현재 Codex에는 등록되지 않았지만 repo에 유지하는 4개 스킬
- 전체: 18개 활성 스킬

## 동기화 기준

현재 Codex 등록본을 기준으로 한다.

- 같은 이름의 스킬은 Codex 등록본으로 덮어쓴다.
- `SKILL.md`뿐 아니라 `agents`, `scripts`, `references`, `assets` 같은 전체 하위 트리도 동일하게 맞춘다.
- `.system` 스킬은 OpenAI가 관리하는 기본 스킬이므로 repo 미러 대상에서 제외한다.
- repo-only 스킬은 삭제 요청이 있을 때만 제거한다.

## Codex 등록본 미러

`app-owned-boundary-refactor`, `cohesion`, `conflict`, `discuss`, `doubt`, `entity-interface-refactor`, `layer-abstraction-refactor`, `main`, `migrate-to-codex`, `naming`, `ocp`, `responsibility-surface-refactor`, `srp`, `teo-dev`

## Repo-only 스킬

`explain`, `ideal`, `research`, `reframe`

## 퇴역 스킬

`glossary`, `go-preflight-tree`, `minto`, `naming-audit`, `team`은 활성
플러그인에서 제거하고 [`../../archive/teo-stack/skills`](../../archive/teo-stack/skills/)에
보관한다.

## 설치

```bash
/plugin marketplace add developer-1px/teo-claude-code
/plugin install teo-stack@teo-marketplace
```

## 운영 메모

- 현재 사용 중인 Codex 스킬을 수정한 뒤 repo에도 반영할 때는 Codex 등록본을 원본으로 다시 복사합니다.
- 과거 승격 기록은 [`ROADMAP.md`](ROADMAP.md)에 보관합니다.
