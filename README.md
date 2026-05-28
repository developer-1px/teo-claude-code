# teo-claude-code

Claude Code 스킬 마켓플레이스. 현재 실사용 플러그인은 `teo-stack` 하나입니다.

개발 기본 흐름은 Matt Pocock 계열 스킬을 사용합니다. `teo-stack`은 그 위에서 **의도 정렬**과 **리팩토링 감사**가 필요할 때만 꺼내는 보조 스택입니다.

## 플러그인

| 경로 | 용도 | 상태 |
|------|------|------|
| [**`plugins/teo-stack`**](plugins/teo-stack/) | 의도 정렬(`/discuss`) + 리팩토링 감사(`/srp`, `/ocp`, `/naming-audit`) | 실사용 |
| [`archive/teo-project`](archive/teo-project/) | interactive-os 전용 과거 파이프라인 스킬 | 아카이브 |

## 사용 방침

| 상황 | 기본 선택 |
|------|-----------|
| 구현, 디버깅, TDD, 이슈화, PRD, 코드베이스 개선 | Matt Pocock 계열 스킬 |
| 표면 요청 뒤의 진짜 목적·범위가 불명확함 | `teo-stack`의 `/discuss` |
| 파일 책임·확장 구조·네이밍을 점검하며 리팩토링 | `teo-stack`의 `/srp`, `/ocp`, `/naming-audit` |
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

## 구성 문서

- [`plugins/teo-stack/README.md`](plugins/teo-stack/README.md) — 공개 플러그인 상세
- [`plugins/teo-stack/ROADMAP.md`](plugins/teo-stack/ROADMAP.md) — 과거 승격 기록
- [`archive/teo-project/README.md`](archive/teo-project/README.md) — 아카이브된 프로젝트 전용 스킬 카탈로그
