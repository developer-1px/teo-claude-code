---
description: 구현 완료 후 Area MDX 문서를 갱신하여 결과를 누적한다. retrospect 후 실행하여 ⬜→🟢 전환, 새 L3 MDX 생성, 구조적 빈칸 발견을 수행한다. "/area", "area 갱신", "area 업데이트", "누적해", "문서 갱신" 등을 말할 때 사용. retrospect 완료 후 자동으로 제안할 수도 있다.
---

## /area — Area MDX 누적

> **파이프라인 위치**: `Discussion → PRD → Plan → 실행 → retrospect(갭 감지) → /area(누적)`
>
> retrospect가 "PRD vs 구현"을 비교하여 갭을 감지하는 역할이라면, /area는 "구현 결과를 Area MDX에 누적"하는 역할이다. 방향이 다르다: retrospect는 역방향(PRD ← 구현), area는 순방향(구현 → Area).

## 핵심 원리

PRD는 소모품(연료)이고 Area MDX는 영구 자산(건물)이다. 연료를 태워 건물을 짓고, 건물은 남는다. 이 스킬이 없으면 PRD만 소비되고 건물이 쌓이지 않는다.

Area MDX는 주기율표처럼 빈칸(⬜)이 "아직 없지만 있어야 할 것"을 예언한다. 구현이 완료되면 빈칸이 채워지고, 동시에 새로운 빈칸이 발견될 수 있다.

## Step 1: 변경 범위 파악

최근 구현의 변경 범위를 파악한다:

1. retrospect 결과가 대화에 있으면 그걸 사용
2. 없으면 `git log --oneline -20`과 `git diff`로 최근 변경 파악
3. 변경된 파일들이 어떤 레이어에 속하는지 분류:

| 경로 패턴 | 레이어 | Area MDX |
|-----------|--------|----------|
| `interactive-os/core/` | core | `docs/2-areas/core.mdx` |
| `interactive-os/axes/` | axes | `docs/2-areas/axes.mdx` |
| `interactive-os/behaviors/` | patterns | `docs/2-areas/patterns.mdx` |
| `interactive-os/plugins/` | plugins | `docs/2-areas/plugins.mdx` |
| `interactive-os/hooks/` | hooks | `docs/2-areas/hooks.mdx` |
| `interactive-os/ui/` | ui | `docs/2-areas/ui.mdx` |
| `pages/` | pages | `docs/2-areas/pages.mdx` |

## Step 2: L2 Area MDX 갱신

해당 레이어의 L2 Area MDX 파일을 열고 갱신한다:

### 파일이 있는 경우

주기율표에서:
- **⬜ → 🟢 전환**: 구현이 완료된 모듈의 상태를 변경
- **새 행 추가**: 주기율표에 없는 모듈이 구현되었으면 🟢 행 추가
- **관계/갭 섹션 갱신**: 새로 알게 된 관계나 충돌 정보 반영

### 파일이 없는 경우

`docs/2-areas/axes.mdx`를 참고하여 해당 레이어의 L2 Area MDX를 새로 생성한다. 구조:

```mdx
# [레이어 이름]

> [한 줄 설명]

## 주기율표

| 모듈 | 설명 | 상태 |
|------|------|------|
| [구현된 모듈] | ... | 🟢 |
| [구조적으로 있어야 할 모듈] | ... | ⬜ |

## 의존 방향
...

## 갭
...
```

## Step 3: L3 모듈 MDX 갱신/생성

구현된 모듈의 L3 MDX를 확인한다:

### 파일이 있는 경우
- 스펙, 관계, 옵션 등을 현재 구현에 맞게 갱신
- 데모 컴포넌트가 분리되어 있으면 import 확인

### 파일이 없는 경우
최소 L3 MDX를 생성한다. 개념 소개 + 스펙 표 + 관계:

```mdx
# [모듈명]

> [한 줄 설명]

## 스펙
[구현 코드에서 추출한 인터페이스 표]

## 관계
[다른 모듈과의 관계]

## 데모
[데모 컴포넌트가 있으면 import, 없으면 생략]
```

빈칸(⬜) 모듈의 L3 파일은 최소 컨텐츠로 생성:
```mdx
# [모듈명]

> ⬜ 미구현

[왜 필요한지 개념 설명]

## TODO
- [ ] [해야 할 것들]
```

## Step 4: 구조적 빈칸(⬜) 발견

이번 구현을 통해 새로 드러난 "있어야 하지만 없는 것"을 탐색한다:

- 구현된 모듈과 대칭적으로 있어야 할 모듈이 있는지
- 축 조합에서 빠진 패턴이 있는지
- 플러그인이 커버하지 못하는 영역이 있는지

발견된 빈칸은:
1. L2 주기율표에 ⬜ 행으로 추가
2. L3 최소 MDX 생성 (개념 + TODO)
3. `docs/BACKLOGS.md`에 백로그 항목으로 추가

## Step 5: 커밋

변경된 Area MDX 파일을 커밋한다:
```bash
git add docs/2-areas/
git commit -m "docs(area): update [레이어] — [변경 요약]"
```

## 산출물 요약

매 실행 시 사용자에게 보여줄 요약:

```markdown
## /area 갱신 결과

### 변경된 Area
- `axes.mdx`: value ⬜→🟢
- `axes/value.mdx`: L3 생성

### 새로 발견된 빈칸
- `axes.mdx`: trigger↔popup ⬜ (신규)

### 백로그 추가
- trigger↔popup 축 분리 검토
```
