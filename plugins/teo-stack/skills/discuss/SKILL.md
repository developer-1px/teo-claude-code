---
name: discuss
description: Align on intent before acting — reconstruct what the user actually wants and why, ask only the decisions that are theirs, and hand off once it is settled. Use for /discuss, $discuss, "interview me", "grill me", stress-testing a plan, vague one-liners ("맞춰봐", "이거 좀 봐줘", "음...", "뭔가 이상해"), ambiguous goals, why-before-how talk, or understanding a problem before changing anything.
---

# Discuss

The user's words are evidence of an intent, not the intent. Find what they want
and why, agree on it, then hand off. This is a conversation, not a protocol.

1. **Look before you ask.** Read the conversation, code, docs, history and
   memory first. Facts are your job: never ask what those sources answer; send
   a fresh-context subagent for a fact you need and keep going meanwhile.
   Decisions are the user's.

2. **Echo the intent first.** Say in your own words what they want, for whom
   and why, with what you found that bears on it.
   - A vague one-liner: offer two or three intent hypotheses, each with its
     clue and what you would do if it is right, and recommend one.
   - A concrete request without a why: ask the why as one open question, with
     nothing to pick from.
   - Nothing open: don't discuss; name the one sensible way and ask to proceed.

3. **Reason in causal order.** Intent → ideal result → current reality →
   problem → cause → constraints → existing assets → outside evidence and the
   direction the ecosystem is converging → objective → solution → side effects.
   Fill each from evidence or labeled inference, not from the user. Each turn,
   show a compact table from intent down to the earliest open element only:
   `| 요소 | 내용 (앵커) | 🟢/⬜ |`.

4. **Ask in rounds.** The frontier is every open user-owned decision whose
   upstream is grounded. Ask it all at once (at most four) with the question
   tool. Each question: first why it must be decided now (what forks), then
   two to four options with the reason to pick each, your recommendation first
   and worded so "yes" accepts it. Never a topic label. Choices within your
   delegated judgment are stated assumptions, not questions.

5. **Corrections recompute.** When the user corrects a premise, drop every
   conclusion that rested on it, go back to the earliest affected element and
   reason forward again. Keep facts that don't depend on it.

6. **Record answers.** From the first answer, append `- Q: … → A: …` to
   `~/.local/state/discuss/<repo>/<YYYY-MM-DD>-<slug>.md` (one line of intent
   on top) before the next round. Read it first when resuming.

7. **Close.** Once intent, ideal result, constraints, cause and solution are
   grounded, don't wait to be asked: pass [references/frt-gate.md](references/frt-gate.md),
   write the contract in [references/execution-contract.md](references/execution-contract.md),
   and confirm the shared understanding. Then put the record and contract into
   the repo's issue (an open one first), link it, and delete the record. When
   asked to grill, keep asking until the frontier is empty before closing.

Discussion is not execution. Until the user explicitly says to proceed, change
nothing but the record and that issue. Agreeing with a direction is not
approval, and approval to proceed doesn't cover content first introduced in the
contract.

Lead with your strongest judgment and its evidence. Use an ASCII diagram when a
relationship is easier seen than read.
