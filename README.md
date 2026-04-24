# teo-claude-code

Claude Code 스킬·에이전트 모음. **하나의 마켓플레이스 안에 2개의 플러그인**으로 구성됩니다.

## 플러그인 구성

| 플러그인 | 대상 | 구성 |
|---------|------|------|
| [**teo-universal**](plugins/universal/) | 누구나 / 모든 프로젝트 | 한국어 범용 사고·문서 스킬 7개 (Thinking 5 + minto + research) |
| [**teo-stack**](plugins/teo-stack/) | interactive-os 개발자 | 프로젝트 파이프라인 스킬 30개 + 에이전트 4개 (discuss→story→prd→go, PARA, Quality, Design) |

## 설치

### 마켓플레이스 등록

```bash
# Claude Code 프롬프트에서
/plugin marketplace add developer-1px/teo-claude-code
```

### 플러그인 설치

```bash
# 범용 스킬만
/plugin install teo-universal@teo-marketplace

# 프로젝트 파이프라인까지 (interactive-os 전제)
/plugin install teo-stack@teo-marketplace
```

### 로컬 개발

레포를 클론해서 직접 쓰려면 스킬 디렉토리를 `~/.claude/skills/`로 심볼릭 링크:

```bash
git clone https://github.com/developer-1px/teo-claude-code.git
cd teo-claude-code
for s in plugins/*/skills/*/; do
  ln -sfn "$PWD/$s" ~/.claude/skills/$(basename "$s")
done
mkdir -p ~/.claude/agents
for a in plugins/teo-stack/agents/*.md; do
  ln -sfn "$PWD/$a" ~/.claude/agents/$(basename "$a")
done
```

## 문서

- 스킬별 치트시트 → 각 플러그인의 README
- 범용 승격 후보 로드맵 → [`plugins/universal/ROADMAP.md`](plugins/universal/ROADMAP.md)

## 라이선스

MIT
