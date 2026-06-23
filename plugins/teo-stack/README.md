# teo-stack

현재 사용하는 Codex 스킬 등록본을 repo에 보관하는 플러그인.

## 구성

- Codex 등록본 미러: `/Users/user/.codex/skills`에서 `.system`을 제외한 35개 스킬
- repo-only 스킬: 현재 Codex에는 등록되지 않았지만 repo에 유지하는 8개 스킬
- 전체: 43개 스킬

## 동기화 기준

현재 Codex 등록본을 기준으로 한다.

- 같은 이름의 스킬은 Codex 등록본으로 덮어쓴다.
- `SKILL.md`뿐 아니라 `agents`, `scripts`, `references` 같은 하위 파일도 같이 맞춘다.
- `.system` 스킬은 Codex 기본 스킬이므로 repo 미러 대상에서 제외한다.
- repo-only 스킬은 삭제 요청이 있을 때만 제거한다.

## Codex 등록본 미러

`app-owned-boundary-refactor`, `ask-matt`, `codebase-design`, `cohesion`, `conflict`, `diagnosing-bugs`, `discuss`, `domain-modeling`, `doubt`, `entity-interface-refactor`, `git-guardrails-claude-code`, `go-preflight-tree`, `grill-me`, `grill-with-docs`, `grilling`, `handoff`, `implement`, `improve-codebase-architecture`, `migrate-to-codex`, `migrate-to-shoehorn`, `naming`, `ocp`, `prototype`, `resolving-merge-conflicts`, `responsibility-surface-refactor`, `scaffold-exercises`, `setup-matt-pocock-skills`, `setup-pre-commit`, `srp`, `tdd`, `teach`, `to-issues`, `to-prd`, `triage`, `writing-great-skills`

## Repo-only 스킬

`explain`, `glossary`, `ideal`, `minto`, `naming-audit`, `reference`, `reframe`, `team`

## 설치

```bash
/plugin marketplace add developer-1px/teo-claude-code
/plugin install teo-stack@teo-marketplace
```

## 운영 메모

- 현재 사용 중인 Codex 스킬을 수정한 뒤 repo에도 반영할 때는 Codex 등록본을 원본으로 다시 복사한다.
- 과거 승격 기록은 [`ROADMAP.md`](ROADMAP.md)에 보관한다.
