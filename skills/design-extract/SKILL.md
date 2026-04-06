---
name: design-extract
description: 레퍼런스 웹사이트에서 디자인 토큰을 실측 추출하여 DESIGN.md와 tokens.css를 생성한다. "디자인 시스템 만들어줘", "이 사이트 디자인 따라해", "레퍼런스 디자인 추출", "토큰 추출", "디자인 토큰 뽑아줘", "/design-extract" 등을 말할 때 사용. 디자인 관련 작업에서 LLM이 "평균적인 디자인"을 생성하는 문제를 해결한다 — 생성이 아니라 실측 수치 추출이 핵심.
---

# Design Extract — 레퍼런스 실측 기반 디자인 시스템 생성

## 왜 이 스킬이 필요한가

LLM에게 "디자인해줘"라고 하면 학습 데이터의 평균으로 수렴한다.
해법은 **레퍼런스에서 실제 CSS 수치를 추출**하여 규칙화하는 것이다.
LLM은 생성보다 **분석+적용**에 훨씬 강하다.

## 핵심 프레임워크: 5개 번들

디자인 토큰은 개별이 아니라 **번들로 함께 움직이는 축**이 있다.
이 스킬의 모든 추출과 분석은 이 5개 번들 기준으로 수행한다.

| 번들 | 축 | 설명 |
|---|---|---|
| **surface** | bg + border + shadow | 시각적 계층/높이. 6단계. |
| **shape** | radius + padding | 요소 형태. radius와 padding 비례. |
| **type** | fontSize + weight + family + lineHeight | 글자 계층. size↑ → weight/family 전환. |
| **tone** | base + hover + dim + foreground | 의미 색상. 모든 tone이 동일 4축 구조. |
| **motion** | duration + easing | 전환 속도감. property는 독립. |

## 전제

- Chrome 브라우저가 열려 있어야 한다 (mcp__claude-in-chrome__* 도구 사용)
- 레퍼런스 URL이 접근 가능해야 한다
- 프로젝트에 tokens.css가 있으면 매핑, 없으면 신규 생성

## 절차

### Phase 0: 레퍼런스 확보

사용자가 레퍼런스 URL을 제공하지 않은 경우:
1. 프로젝트의 성격(도구/앱/문서/대시보드 등)을 파악한다
2. 같은 카테고리에서 디자인이 좋다고 알려진 사이트 3개를 제안한다
3. 사용자가 선택하면 진행, "직접 지정"이면 URL을 받는다

레퍼런스 없이 LLM이 생성하는 것은 **이 스킬의 목적에 반한다.** 반드시 레퍼런스를 확보한 뒤 진행한다.

### Phase 1: 레퍼런스 탐색

1. Chrome 도구로 레퍼런스 사이트를 연다 (ToolSearch → navigate → screenshot)
2. 최소 3개 페이지를 방문한다:
   - 메인: 전체 색상/레이아웃 톤
   - 설정/폼: Input, Switch, Radio, Select 등 컴포넌트 스펙
   - 내부: 카드, 리스트, 대화 등 복합 UI
3. 각 페이지에서 스크린샷을 찍어 사용자에게 보여준다

### Phase 2: 수치 추출

각 페이지에서 `mcp__claude-in-chrome__javascript_tool`로 CSS 수치를 추출한다.

#### 2-1. Surface 번들 추출

모든 요소의 bg + border + shadow 조합을 수집하여 고유 번들을 식별한다:

```javascript
// 모든 요소에서 bg + border + shadow 고유 조합 추출
const bundles = new Map();
document.querySelectorAll('*').forEach(el => {
  if (el.offsetWidth === 0 || el.offsetHeight === 0) return;
  const s = getComputedStyle(el);
  const bg = s.backgroundColor;
  if (bg === 'rgba(0, 0, 0, 0)') return;
  const hasBorder = s.borderWidth !== '0px' && !s.borderColor.includes('rgba(0, 0, 0, 0)');
  const hasShadow = s.boxShadow !== 'none' && !s.boxShadow.startsWith('rgba(0, 0, 0, 0) 0px');
  const key = bg + '|' + (hasBorder ? s.borderWidth + s.borderColor.substring(0,30) : 'no') + '|' + (hasShadow ? 'shadow' : 'no');
  if (!bundles.has(key)) {
    bundles.set(key, { bg, border: hasBorder ? s.borderWidth + ' ' + s.borderStyle + ' ' + s.borderColor.substring(0,60) : 'none', shadow: hasShadow ? s.boxShadow.substring(0,150) : 'none', count: 0, examples: [] });
  }
  const b = bundles.get(key);
  b.count++;
  if (b.examples.length < 2) b.examples.push(el.tagName + '(' + el.offsetWidth + 'x' + el.offsetHeight + ')');
});
JSON.stringify([...bundles.values()].sort((a,b) => b.count - a.count), null, 2)
```

#### 2-2. Shape 번들 추출

radius + padding 쌍을 수집하여 상관관계를 확인한다:

```javascript
// radius + padding 고유 쌍 추출 (padding과 radius가 있는 요소만)
const pairMap = new Map();
document.querySelectorAll('*').forEach(el => {
  if (el.offsetWidth === 0 || el.offsetHeight === 0) return;
  const s = getComputedStyle(el);
  if (s.padding === '0px' || s.borderRadius === '0px') return;
  const key = s.borderRadius + ' | ' + s.padding;
  if (!pairMap.has(key)) pairMap.set(key, { radius: s.borderRadius, padding: s.padding, count: 0, examples: [] });
  const e = pairMap.get(key);
  e.count++;
  if (e.examples.length < 2) e.examples.push(el.tagName + '(' + el.offsetWidth + 'x' + el.offsetHeight + ')');
});
JSON.stringify([...pairMap.values()].sort((a,b) => b.count - a.count), null, 2)
```

#### 2-3. Type 번들 추출

fontSize + fontWeight + fontFamily + lineHeight 조합을 수집한다:

```javascript
// typography 번들 추출
const typoMap = new Map();
document.querySelectorAll('*').forEach(el => {
  if (el.offsetWidth === 0 || el.offsetHeight === 0) return;
  if (el.textContent.trim().length === 0) return;
  const s = getComputedStyle(el);
  const key = s.fontSize + '|' + s.fontWeight + '|' + s.fontFamily.split(',')[0].trim().replace(/"/g,'');
  if (!typoMap.has(key)) {
    typoMap.set(key, { fontSize: s.fontSize, fontWeight: s.fontWeight, fontFamily: s.fontFamily.split(',')[0].trim().replace(/"/g,''), lineHeight: s.lineHeight, colors: new Set(), count: 0, examples: [] });
  }
  const t = typoMap.get(key);
  t.count++;
  t.colors.add(s.color);
  if (t.examples.length < 3) t.examples.push(el.tagName + ' "' + el.textContent.trim().substring(0,15) + '"');
});
JSON.stringify([...typoMap.values()].sort((a,b) => b.count - a.count).slice(0,15).map(t => ({...t, colors: [...t.colors]})), null, 2)
```

#### 2-4. Tone 번들 추출

모든 색상을 수집하고 의미(primary, destructive, success, warning, neutral)별로 분류한다:

```javascript
// 모든 색상 수집 (text, bg, border, fill별)
const colorMap = { text: {}, bg: {}, border: {} };
document.querySelectorAll('*').forEach(el => {
  if (el.offsetWidth === 0 || el.offsetHeight === 0) return;
  const s = getComputedStyle(el);
  const c = s.color;
  if (c) colorMap.text[c] = (colorMap.text[c] || 0) + 1;
  const bg = s.backgroundColor;
  if (bg && bg !== 'rgba(0, 0, 0, 0)') colorMap.bg[bg] = (colorMap.bg[bg] || 0) + 1;
  if (s.borderWidth !== '0px' && !s.borderColor.includes('rgba(0, 0, 0, 0)'))
    colorMap.border[s.borderColor] = (colorMap.border[s.borderColor] || 0) + 1;
});
const result = {};
for (const [prop, map] of Object.entries(colorMap)) {
  result[prop] = Object.entries(map).sort((a,b) => b[1] - a[1]).slice(0,10).map(([color, count]) => ({ color, count }));
}
JSON.stringify(result, null, 2)
```

#### 2-5. Motion 번들 추출

transition의 duration + easing 조합을 수집한다:

```javascript
// transition 패턴 추출
const transitions = {};
document.querySelectorAll('*').forEach(el => {
  if (el.offsetWidth === 0 || el.offsetHeight === 0) return;
  const s = getComputedStyle(el);
  const t = s.transition;
  if (t === 'all 0s ease 0s' || t === 'none' || t === 'all') return;
  const key = t.substring(0, 80);
  if (!transitions[key]) transitions[key] = { pattern: key, count: 0, examples: [] };
  transitions[key].count++;
  if (transitions[key].examples.length < 2) transitions[key].examples.push(el.tagName + '(' + el.offsetWidth + 'x' + el.offsetHeight + ')');
});
JSON.stringify(Object.values(transitions).sort((a,b) => b.count - a.count).slice(0,8), null, 2)
```

#### 2-6. 컴포넌트별 상세 스펙

Input, Button, Switch, Sidebar, Card 등 주요 컴포넌트의 정확한 수치를 추출한다:

```javascript
// 주요 컴포넌트 스펙 추출
function spec(el, label) {
  const s = getComputedStyle(el);
  return { label, h: el.offsetHeight+'px', w: el.offsetWidth+'px', padding: s.padding, fontSize: s.fontSize, fontWeight: s.fontWeight, borderRadius: s.borderRadius, border: s.borderWidth !== '0px' ? s.borderWidth + ' ' + s.borderColor : 'none', bg: s.backgroundColor, shadow: s.boxShadow === 'none' ? 'none' : s.boxShadow.substring(0,100) };
}
const r = {};
const inp = document.querySelector('input[type="text"], input:not([type])');
if (inp) r.input = spec(inp, 'input');
// ... 필요한 컴포넌트마다 추가
JSON.stringify(r, null, 2)
```

### Phase 3: 분석 및 매핑

추출한 수치를 분석하여:

1. **Surface 매핑** — 관찰된 bg+border+shadow 조합을 base/sunken/default/raised/overlay/outlined 6레벨에 대응
2. **Shape 매핑** — radius+padding 쌍에서 xs/sm/md/lg/xl 5레벨 도출
3. **Type 매핑** — fontSize+weight+family+lh 조합에서 caption/body/section/page/hero 5레벨 도출
4. **Tone 매핑** — 채도 있는 색을 의미별로 분류 (primary/destructive/success/warning/neutral), 각각 base+hover+dim+fg 4축
5. **Motion 매핑** — duration+easing 조합에서 instant/normal/enter 3레벨 도출

기존 tokens.css가 있으면 1:1 비교 테이블을 작성한다.

### Phase 4: DESIGN.md 작성

DESIGN.md를 프로젝트 루트에 생성한다. 구조:

```markdown
# Design System — {프로젝트명}

> Reference: {레퍼런스 URL} ({날짜} 실측)

## 0. 번들 체계
5개 번들 요약 테이블

## 1. 레퍼런스 수치
번들별 실측값 테이블 (Color, Type, Shape, Component Specs, Shadow, Radius)

## 2. 토큰 매핑
현재 tokens.css ↔ 레퍼런스 1:1 비교 + 갭 분석

## 3. 조합 규칙 (Composition Rules)
토큰으로 해결 안 되는 "어떻게 조합하는가" 규칙
(예: 면으로 구분, 주인공 1개, 위계 점프, 조연 후퇴, 포인트 컬러 1개 등)

## 4. 적용 우선순위
변경 순서
```

### Phase 5: tokens.css 업데이트

1. 팔레트 교체 (변수명 rename + 값 변경)
2. 번들 토큰 추가 (surface/shape/type/tone/motion)
3. 하위호환 alias 유지
4. 기존 코드에서 raw 값 → 토큰 변수 일괄 교체 (font-weight, color palette 등)
5. light/dark 테마 모두 업데이트

### Phase 6: 시각 검증

변경된 사이트를 Chrome으로 열어 레퍼런스와 나란히 비교한다.
스크린샷을 찍어 사용자에게 보여주고, 차이점을 짚는다.

## 주의사항

- **생성하지 말고 추출하라** — LLM의 미적 판단을 개입시키지 않는다. 수치를 그대로 옮긴다.
- **번들 단위로 작업하라** — radius만 바꾸고 padding을 안 바꾸면 불일치.
- **하위호환** — 기존 변수명은 alias로 유지. 한번에 깨뜨리지 않는다.
- **최대한 똑같이 → 나중에 커스텀** — 먼저 레퍼런스를 충실히 복제하고, 이후 사용자가 부분적으로 변경한다.
