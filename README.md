# teo-claude-code

Claude Code / Codex용 개인 스킬 마켓플레이스. 현재 실사용 플러그인은 `teo-stack` 하나입니다.

`teo-stack`은 현재 개인 Codex 등록 스킬을 그대로 미러링하고, 이 repo에서 직접 만든 의도 정렬·reference 스킬도 함께 보관합니다. OpenAI가 관리하는 `.system` 스킬은 미러링하지 않습니다.

## 플러그인

| 경로 | 용도 | 상태 |
|------|------|------|
| [**`plugins/teo-stack`**](plugins/teo-stack/) | 개인 Codex 스킬 미러 + repo 전용 오리지널 스킬 | 실사용 |
| [`archive/teo-project`](archive/teo-project/) | interactive-os 전용 과거 파이프라인 스킬 | 아카이브 |

## 사용 방침

| 상황 | 기본 선택 |
|------|-----------|
| 표면 요청 뒤의 진짜 목적·범위가 불명확함 | `/discuss` |
| 표준·best practice·de facto·frontier 기준을 내부 맥락과 맞춰 봄 | `/reference` |
| 파일 책임·확장 구조·네이밍·프론트엔드 경계를 점검하며 리팩토링 | `/srp`, `/ocp`, `/naming-audit`, `/app-owned-boundary-refactor`, `/entity-interface-refactor` |
| 과거 interactive-os 전용 파이프라인 확인 | `archive/teo-project` 참고 |

## 설치

```bash
/plugin marketplace add developer-1px/teo-claude-code
/plugin install teo-stack@teo-marketplace
```

`teo-project`는 아카이브로 보관하며 설치 대상이 아닙니다.

## 로컬 개발

```bash
git clone https://github.com/developer-1px/teo-claude-code.git
cd teo-claude-code
for s in plugins/teo-stack/skills/*/; do
  ln -sfn "$PWD/$s" ~/.claude/skills/$(basename "$s")
done
```

Codex 등록본을 repo에 동기화할 때는 `~/.codex/skills`의 `.system` 제외 디렉터리를 `plugins/teo-stack/skills`로 복사합니다. 같은 이름의 스킬은 Codex 등록본의 전체 하위 트리로 맞추고, repo에만 있는 스킬은 보존합니다.

## 구성 문서

- [`plugins/teo-stack/README.md`](plugins/teo-stack/README.md) — 공개 플러그인 상세
- [`plugins/teo-stack/ROADMAP.md`](plugins/teo-stack/ROADMAP.md) — 과거 승격 기록
- [`archive/teo-project/README.md`](archive/teo-project/README.md) — 아카이브된 프로젝트 전용 스킬 카탈로그
