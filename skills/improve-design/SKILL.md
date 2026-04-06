---
name: improve-design
description: 스크린샷 기반 디자인 품질 검증 루프. 위반 채점 → ax()/ui/ 수정 → 재촬영 → 9/10+ 달성까지 반복. "디자인 개선", "디자인 점수", "시각 검증", "/improve-design" 등을 말할 때 사용.
---

# improve-design — 디자인 품질 검증 + 수정 루프

## 왜 이 스킬이 필요한가

LLM이 CSS를 수정할 때 해치(module.css 직접값, style={})로 도망가는 악순환이 있다.
이 스킬은 **렌더링 결과를 스크린샷으로 확인**하고, **위반 체크리스트로 채점**하고, **ax()/ui/ 경로만으로 수정**한다.
해치로 점수를 올리면 = 실패.

## 전제

- dev server 실행 중 (localhost:5173)
- MCP (claude-in-chrome) 연결됨
- ax() 디자인 시스템 존재

## 루프

```
1. 촬영 — MCP 스크린샷 (현재 라우트)
2. 채점 — 10점 만점, 위반 체크리스트 대조
3. 진단 — 감점 항목별 구체적 위치 + 원인
4. 수정 — ax()/ui/ 허용 경로만
5. 재촬영 — 수정 후 스크린샷
6. 재채점 — 점수 비교. 9/10 미만이면 3으로 복귀
7. 종료 — 9/10 이상 또는 3회 반복 도달
```

## 채점 체크리스트 (10점 만점)

| # | 항목 | 감점 | 감지 방법 |
|---|------|------|----------|
| 1 | 이모지/특수기호로 상태 표현 (⚠✓✗🟢🔴▾▸●○★) | -1 | 코드 grep |
| 2 | 간격 위계 불일치 (같은 위계인데 다른 gap) | -1 | 스크린샷 |
| 3 | surface 없이 border만으로 영역 구분 | -1 | 스크린샷 |
| 4 | accent 예산 위반 (selected=neutral, activate=accent bg, focus=accent outline) | -1 | 스크린샷 |
| 5 | 활성 요소 시각 피드백 없음 (focus/selection 구분 불가) | -1 | 스크린샷 |
| 6 | 텍스트 위계 불명확 (label vs body vs caption 구분 없음) | -1 | 스크린샷 |
| 7 | 레이어 위반 (pages에서 primitives 직접, useAria 직접) | -2 | 코드 grep |
| 8 | overflow 미처리 (텍스트 잘림/밀림) | -1 | 스크린샷 |
| 9 | 해치 사용 (module.css에 축 소유 속성 직접값) | -2 | 코드 grep |
| 10 | style={} 사용 | -2 | 코드 grep |

## 수정 허용/금지

### 허용
- ax() 축 값 변경/추가
- ui/ 기존 컴포넌트 사용
- ui/에 새 재사용 컴포넌트 생성 (레이어 준수)
- indicators/ 컴포넌트 사용
- items/, panels/, cells/ 사용
- module.css last-mile (z-index, transform, ::before, grid-template 등 축에 없는 속성)

### 금지
- style={}
- module.css에 축 소유 속성 직접값 (guardCssAxes가 차단)
- pages/에서 primitives(useAria, useAriaZone) 직접 사용
- 이모지/특수기호로 상태 표현
- renderItem에서 ARIA props 누락

## 코드 기반 감지 (Step 2에서 grep 실행)

채점 전에 코드 정적 분석을 먼저 수행한다:

1. `grep -r 'style={' src/pages/` → style={} 사용 감지
2. `grep -r 'useAria\|useAriaZone' src/pages/` → primitives 직접 사용 감지 (ui/ import는 OK)
3. module.css 축 소유 속성 직접값 → `pnpm score:design` 또는 guardCssAxes 로직 재활용
4. 이모지/특수기호 grep

## 스크린샷 기반 감지 (Step 2에서 시각 판단)

스크린샷을 보고 다음을 판단한다:
- 간격이 위계에 맞는가 (같은 레벨 = 같은 gap)
- surface로 영역이 구분되는가 (bg 색차이)
- accent가 1채널인가 (selected=neutral, activate만 accent)
- 활성 요소에 시각 피드백이 있는가
- 텍스트 크기/굵기 위계가 명확한가
- overflow된 텍스트가 없는가

## 수정 후 검증

수정 후에는 반드시:
1. 재촬영하여 시각적 개선 확인
2. 점수 재산정
3. 점수가 하락하면 git checkout으로 원복 후 다른 접근

## 종료 조건

- 점수 9/10 이상 → 성공 종료
- 3회 반복 도달 + 9/10 미만 → 잔여 위반 보고 + 사용자 판단 위임
