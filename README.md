# teo-claude-code

Claude Code 스킬·에이전트 마켓플레이스. 2개 플러그인으로 구성됩니다.

## 플러그인

| 플러그인 | 용도 | 대상 |
|---------|------|------|
| [**`teo-stack`**](plugins/teo-stack/) | `/discuss` 허브 + TOC/민토 사고 스킬 8개 | 공개 — 본인 다른 프로젝트·관심 있는 사용자 |
| [`teo-project`](plugins/teo-project/) | interactive-os 전용 파이프라인 스킬 29개 + 에이전트 4개 | [PRIVATE] 개인·팀 내부 용도, **타 프로젝트 비호환** |

> `teo-stack`은 [superpowers](https://github.com/obra/superpowers)와 **보완** 관계입니다. superpowers가 다루는 영역(brainstorming·debugging·TDD·planning·verification)은 그쪽을 쓰고, 이 플러그인은 `/discuss` 중심의 논의 구조화·대립 해소·뺄셈 사고·민토 해설·외부 리서치를 담당합니다.

## 설치

```bash
/plugin marketplace add developer-1px/teo-claude-code
/plugin install teo-stack@teo-marketplace
```

`teo-project`는 비공개 용도이므로 `teo-stack`만 설치하시면 됩니다.

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
- [`plugins/teo-stack/ROADMAP.md`](plugins/teo-stack/ROADMAP.md) — teo-project → teo-stack 승격 로드맵
- [`plugins/teo-project/README.md`](plugins/teo-project/README.md) — 프로젝트 전용 스킬 카탈로그
