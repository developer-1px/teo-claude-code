---
name: keyline-audit
description: 컴포넌트 시각적 완성도 판정 → keyline 수치 검증 → 토큰/축 수정 리포트. 디자인 일관성 수렴 루프의 단일 사이클.
trigger: /keyline-audit
---

# /keyline-audit

컴포넌트의 시각적 완성도를 AI 비전으로 판정하고, keyline 수치를 정적 분석으로 검증하여 토큰/축 설계 결함을 리포트한다. 코드를 수정하지 않는다 (keylineMap.json의 designComplete 업데이트만 예외).

## 트리거

"/keyline-audit", "keyline 검증", "키라인 검사", "디자인 완성도 체크"

## 3단계 파이프라인

### Stage 1: 시각적 완성도 판정 (AI 비전)

1. **초기 리포트 수집**

```bash
node scripts/keylineCheck.mjs --audit
```

JSON 출력을 파싱한다. `incomplete` 배열에서 아직 `designComplete`가 판정되지 않은 컴포넌트를 확인한다.

2. **미판정 컴포넌트가 0이면 Stage 1을 건너뛴다.**

3. **브라우저로 /test/keyline 페이지 열기**

mcp__claude-in-chrome 도구 또는 puppeteer 스크린샷을 사용한다:

```
navigate → http://localhost:5173/test/keyline
# 또는: node scripts/screenshot.mjs /test/keyline
```

4. **스크린샷 촬영 및 관찰**

`mcp__claude-in-chrome__computer` (screenshot)로 현재 화면을 캡처한다. 스크롤이 필요하면 반복 촬영한다.

5. **배치 판정 (10~20개씩)**

각 미판정 컴포넌트에 대해:
- 스크린샷에서 해당 컴포넌트의 렌더링을 찾아 관찰한다
- **판정 기준**: "컴포넌트 이름에서 기대되는 시각적 모습을 갖추었는가?"
  - Button → 클릭 가능한 사각형에 텍스트/아이콘이 있어야 함
  - TreeGrid → 들여쓰기 있는 행 목록이어야 함
  - Badge → 작은 레이블 태그여야 함
  - 판단이 어려우면 → WebSearch로 "[컴포넌트이름] component UI example"을 검색하여 레퍼런스를 확인한다
- 판정 결과: `designComplete: true` (완성) 또는 `designComplete: false` (미완성)
  - 미완성 기준: placeholder만 있음, 빈 박스, 텍스트만 덩그러니, 깨진 레이아웃

6. **keylineMap.json 업데이트**

판정 결과를 `src/pages/keyline/keylineMap.json`에 기록한다:

```json
{
  "Button": {
    "level": "atom",
    "role": "control",
    "content": "text",
    "designComplete": true
  }
}
```

한 번에 전체를 처리하지 않아도 된다. 배치 단위로 저장하고, 다음 호출에서 이어서 판정한다. designComplete 판정은 캐싱되므로 코드 변경이 없으면 재판정 불필요.

### Stage 2: Keyline 수치 검증 (정적 분석)

1. **갱신된 리포트 수집**

```bash
node scripts/keylineCheck.mjs --audit
```

Stage 1에서 designComplete를 갱신했으므로 다시 실행한다.

2. **위반 분류**

`keylineViolations` 배열을 원인별로 정리:

| issue | 의미 | 수정 대상 |
|-------|------|-----------|
| `missing_role` | interactive인데 role 미선언 | 해당 컴포넌트의 ax() 호출 |
| `sizing_override` | module.css가 keyline을 깨뜨림 | 해당 .module.css 파일 |
| `invalid_axis` | 잘못된 축 값 사용 | 해당 컴포넌트의 ax() 호출 |

3. **tokenGaps 수집**

`ROLE_KEYLINES`에서 기대값이 미정의된 필드. 이것은 개별 컴포넌트가 아닌 `scripts/keylineCheck.mjs`의 토큰 테이블 수정이 필요한 사안.

4. **cssOverrides 수집**

module.css에서 sizing 속성(min-height, font-size, padding 등)을 직접 재정의하는 선언. keyline을 깨뜨리는 원인.

### Stage 3: 통합 리포트

모든 결과를 아래 형식으로 사용자에게 출력한다. 파일을 생성하지 않는다.

```
## Keyline Audit Report

### 완성도 판정
- 신규 판정: N개 (완성 M, 미완성 K)
- 총 designComplete: X / Y

### Keyline 위반 (designComplete 컴포넌트만)
- missing_role: N건
  - [컴포넌트] [파일]:[라인] — [상세]
- sizing_override: N건
  - [컴포넌트] [파일]:[라인] — [상세]
- invalid_axis: N건
  - [컴포넌트] [파일]:[라인] — [상세]

### 토큰 갭
- [role]의 [field] 미정의

### CSS 오염
- [file]:[line] — [declaration]

### 수정 제안
- [원인 분류] → [수정 대상 파일:라인]
```

## 도구 목록

| 도구 | 용도 |
|------|------|
| `node scripts/keylineCheck.mjs --audit` | JSON 리포트 생성 |
| `node scripts/keylineCheck.mjs --sync-map` | keylineMap.json 재생성 (designComplete 보존) |
| `mcp__claude-in-chrome__navigate` | /keyline 페이지 열기 |
| `mcp__claude-in-chrome__computer` | 스크린샷 촬영 |
| WebSearch | 모르는 컴포넌트 레퍼런스 조회 |
| Read/Edit | keylineMap.json 읽기/쓰기 |

## 제약

- **코드를 수정하지 않는다.** 리포트만 출력. keylineMap.json의 designComplete 업데이트만 예외.
- 불일치 원인은 개별 컴포넌트가 아닌 토큰/축 설계 결함으로 본다. 수정 제안도 그 수준으로 작성.
- dev server가 실행 중이어야 Stage 1 브라우저 검증이 가능. 미실행 시 Stage 1을 건너뛰고 Stage 2부터 진행하되, 사용자에게 안내한다.
