---
description: 사용자의 요청을 답변 대신 날짜 폴더(docs/YYYY/YYYY-MM/YYYY-MM-DD/) 아래 type=inbox 문서로 저장한다. "메모해줘", "문서로 남겨", "inbox에 넣어", "/inbox" 등 기록 의도가 보이면 사용.
---

## /inbox — 요청을 문서로 저장

> **목적**: 대화 응답 대신 오늘 날짜 폴더(`docs/YYYY/YYYY-MM/YYYY-MM-DD/`)에 `type: inbox` 문서를 생성한다.
> **핵심**: 사용자가 말한 것을 정리해서 파일로 남기는 것이지, 질문에 답하는 것이 아니다.

## 파일명 규칙

```
docs/YYYY/YYYY-MM/YYYY-MM-DD/{slug}.md
```

- **슬러그**: camelCase, 영문으로 시작 (예: `historyDelta`, `useAriaExplain`)
- 순번/날짜 prefix 금지 (폴더가 이미 날짜, 파일명은 내용 식별자)
- `[tag]` prefix 금지 (tags는 frontmatter로)

### 분류 (frontmatter에서)

`type`과 `tags`로 구조화한다. 기본 `type: inbox`에 아래 tags 중 하나 이상 붙인다.

| tag | 용도 |
|------|------|
| `idea` | 아이디어, 제안 |
| `backlog` | 할 일, 과제 (type: backlog가 더 적절할 수도) |
| `retro` | 회고, 리뷰 |
| `explain` | 해설, 개념 정리 |
| `prd` | 요구사항 명세 (type: prd가 더 적절할 수도) |
| `vision` | 방향, 비전 |
| `decision` | 결정 사항 기록 (type: decision이 더 적절할 수도) |
| `question` | 열린 질문, 탐구 |

사용자가 tag를 직접 지정하면 그대로 사용. 지정하지 않으면 내용에서 판단. 명백히 inbox를 넘어서는 type(prd/decision/backlog 등)이면 해당 type으로 직접 저장.

## 문서 구조

```markdown
---
id: {slug}
type: inbox
slug: {slug}
title: {제목}
tags: [inbox, {내용 기반 태그}]
created: {YYYY-MM-DD}
updated: {YYYY-MM-DD}
---

# {제목}

## 배경

{왜 이 문서가 필요한가, 어떤 맥락에서 나왔는가}

## 내용

{사용자 요청을 구조화한 본문}

## 다음 행동

{이 문서에서 파생되는 액션이 있으면 기록. 없으면 생략}
```

## 실행 절차

1. 오늘 날짜 폴더를 확인/생성: `docs/YYYY/YYYY-MM/YYYY-MM-DD/`
2. 사용자의 요청에서 slug(camelCase)와 tags를 결정한다
3. frontmatter와 본문을 작성하여 저장한다
4. 파일 경로를 사용자에게 알려준다

## 규칙

- 문서 생성 후 대화에서 긴 설명을 하지 않는다. 파일 경로만 알려주면 된다.
- 사용자가 추가 내용을 말하면 같은 파일에 append하고 `updated` 필드를 갱신한다.
- `created`는 최초 생성일 고정.
