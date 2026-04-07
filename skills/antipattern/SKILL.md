---
name: antipattern
description: 발견된 안티패턴을 훅 하네스로 전환한다. "이거 하지 마", "이건 안티패턴", "훅으로 막아", "하네스 만들어", "antipattern", "/antipattern" 등으로 트리거. 메모리에 기록하는 게 아니라 guardOsPatterns.mjs 등의 훅에 정적 검사 규칙을 추가하여 구조적으로 재발을 차단하는 것이 목적이다. 안티패턴을 발견했을 때, 또는 코드리뷰 중 "이건 하면 안 돼"라는 피드백이 나왔을 때 사용한다.
---

## 핵심 원칙

**메모리는 잊는다. 하네스는 잊지 않는다.**

사용자가 "이거 하지 마"라고 말했을 때:
- 메모리에 기록 → LLM이 다음 세션에서 떠올리길 바람 (불안정)
- 훅에 규칙 추가 → 다음에 시도하면 즉시 차단 (확실)

이 스킬은 안티패턴을 **훅 규칙으로 변환**하는 파이프라인이다.

## 입력

안티패턴은 다양한 형태로 들어온다:

1. **사용자 피드백**: "이거 하지 마", "이건 위반이야", "왜 이렇게 했어"
2. **코드리뷰**: 리뷰어가 거부한 패턴
3. **세션 중 발견**: 구현하다가 잘못된 방향으로 간 것을 나중에 수정한 경우
4. **직접 요청**: "이 패턴을 훅으로 막아줘"

## 실행 절차

### Step 1: 안티패턴 식별

사용자가 지적한 것 또는 대화에서 드러난 안티패턴을 구체적으로 정의한다.

```
안티패턴: [이름]
위반 코드: [구체적 코드 패턴]
올바른 대안: [어떻게 해야 하는지]
탐지 가능성: 정적 / 맥락 필요
```

### Step 2: 분류 — 훅 vs 스킬 체크리스트

| 탐지 가능성 | 조치 |
|------------|------|
| **정적 탐지 가능** — regex나 AST 패턴으로 잡힘 | → guardOsPatterns.mjs에 규칙 추가 |
| **맥락 판단 필요** — 파일 간 관계, 용도 이해 필요 | → 이 스킬의 체크리스트에 추가 |
| **양쪽 다** — 일부는 정적, 일부는 맥락 | → 훅 + 체크리스트 모두 |

**정적 탐지 판단 기준**: "이 패턴이 코드에 나타나면 100% 위반인가?" → Yes면 훅, No면 체크리스트.

### Step 3: 훅 규칙 작성 (정적 탐지 가능한 경우)

`.claude/hooks/guardOsPatterns.mjs`에 규칙을 추가한다.

**규칙 작성 원칙:**
- 검사 대상 파일 범위를 명확히 (isPages, isTsx, isCss, isExempt 등)
- regex는 false positive을 최소화 — 너무 넓으면 개발이 멈춤
- 에러 메시지에 **올바른 대안**을 구체적으로 안내
- 기존 규칙 번호 체계를 이어감

**규칙 템플릿:**
```javascript
// 규칙 N: [안티패턴 이름]
if ([조건] && [패턴].test(content)) {
  violations.push(
    '[위반 설명] — [올바른 대안 안내]'
  )
}
```

### Step 4: 테스트

훅 규칙을 추가한 후, 양성/음성 케이스를 stdin으로 테스트한다:

```bash
# 양성 (차단되어야 함)
printf '{"tool_name":"Write","tool_input":{"file_path":"...", "content":"[위반 코드]"}}' \
  | node .claude/hooks/guardOsPatterns.mjs

# 음성 (통과해야 함)
printf '{"tool_name":"Write","tool_input":{"file_path":"...", "content":"[정상 코드]"}}' \
  | node .claude/hooks/guardOsPatterns.mjs
```

양성은 `{"decision":"block",...}`이 출력되어야 하고, 음성은 출력 없이 통과해야 한다.

### Step 5: 보고

```markdown
## Antipattern → Harness 결과

### 추가된 훅 규칙
| # | 이름 | 패턴 | 파일 범위 |
|---|------|------|----------|
| 15 | 네이티브 다이얼로그 | prompt/alert/confirm | !isExempt, tsx |

### 체크리스트 추가 (맥락 판단)
- 오버레이 열림 시 route-level 키맵 비활성화 확인

### 테스트 결과
- 양성 N건 차단 확인
- 음성 N건 통과 확인
```

## 현재 체크리스트 (맥락 판단이 필요한 항목)

훅으로 잡을 수 없어서 사람/AI가 코드를 읽고 판단해야 하는 안티패턴들:

### 1. 오버레이 키보드 트래핑 누락
- 오버레이(modal/dialog)가 열려있을 때 route-level AriaRoute keyMap이 여전히 동작하면 위반
- modalOpen 가드 변수로 keyMap을 조건부 구성해야 함

### 2. 컴포넌트 용도 불일치
- ListBox: 값 선택 (폼)
- NavList: 액션 실행 (네비게이션, 명령) — activateOnSelect
- Combobox: 필터 + 선택
- TreeView: 계층 탐색
- 클릭→네비게이션인데 ListBox를 쓰면 위반 (onActivate가 Enter만 트리거)

### 3. CSS last-mile 경계
- 기존 CSS 파일에 ax() 축 소유 속성이 있으면 위반 (훅은 새 코드만 검사)
- `display`, `background`, `border-radius`, `box-shadow`, `font-size`, `color`, `padding`, `gap` 등

### 4. 사이즈 미고정 오버레이 → **훅 승격 완료 (규칙 17)**
- ~~Quick Open, Dialog 등 오버레이 패널에 width가 없으면 콘텐츠에 따라 크기 변동~~
- `surface:'overlay'`에 `width` 축이 없으면 훅이 자동 차단

## 훅 확장 시 주의사항

- **false positive 최소화**: 규칙이 너무 넓으면 정상 코드도 차단하여 개발 흐름이 멈춤. 의심스러우면 체크리스트에 먼저 두고, 패턴이 명확해지면 훅으로 승격
- **에러 메시지가 곧 문서**: 차단 메시지에 "왜 안 되는지"와 "대신 뭘 써야 하는지"를 명확히 적어야 함. 메시지를 읽고 바로 수정할 수 있어야 한다
- **제외 범위 존중**: `isExempt` (os 내부, devtools, styles)는 날코딩이 허용되는 영역
