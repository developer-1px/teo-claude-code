---
name: naming
description: "Review or improve names in code, APIs, files, UI, and domain models using semantic and usage evidence. Use for $naming, naming review, 이름 변경, ambiguous names, or vocabulary consistency."
---

# Naming

Choose names that match the responsibility and reduce ambiguity. A familiar
name is useful only when it denotes the same concept.

## Evidence

Prefer an exact normative term when the code implements that standard concept,
then the official platform term, established domain vocabulary, and consistent
local language. Otherwise name the responsibility directly.

Local product meaning and explicit user terminology still matter. Do not force
an approximate standards term onto a different domain concept. Verify uncertain
standards or current library terms in primary sources before relying on them.

Check sibling names, public contracts, consumers, and the distinction the name
needs to express. Flag both the same name with different meanings and different
names with the same meaning. Do not invent a synonym when one established term
already fits.

## Decision and changes

Rename for a concrete gain: clearer responsibility, standard alignment, less
ambiguity, or fewer concepts. For several candidates, a compact table of
current name, meaning, evidence, proposed name, and decision is useful.
One obvious rename does not require a scoring matrix.

A naming review does not authorize edits. When a rename is requested or already
approved, update the scoped definition and consumers without asking again.
Preserve actual external contracts unless a breaking change or migration is
authorized. Internal re-exports alone are not evidence of an external contract.

Follow ecosystem spelling and repository conventions. Prefer verbs for actions,
nouns for values and structures, and predicate-like boolean names where they
clarify meaning. Judge names such as data, store, manager, and helper in context
instead of treating them as forbidden tokens.

If one name hides multiple responsibilities, describe that finding. Do not
silently expand a naming task into structural refactoring.

Verify affected references and relevant behavior, then report the names changed
or retained, their reason, and any real compatibility implications.
