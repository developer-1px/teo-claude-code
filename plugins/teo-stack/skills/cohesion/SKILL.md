---
name: cohesion
description: "Find code that changes for the same reason and propose or implement cohesive module boundaries. Use for $cohesion, 응집도, or requests to group related responsibilities; file size or similar names alone are not sufficient."
---

# Cohesion

Find code that should change together and judge whether moving it together
makes its responsibility and dependencies easier to understand.

For review or proposal requests, inspect and report. For an implementation
request or an existing execution handoff, make the scoped changes and verify
them. Do not require a second approval merely because the destination needs
ordinary engineering judgment.

## Evidence

Start with the requested area or recent task context. Inspect callers, imports,
state lifecycles, tests, stories, styles, and relevant history. Favor evidence
of shared change reasons over similar names or file sizes.

For each meaningful candidate, identify the responsibility, files that change
with it, proposed location, external dependencies, and behavior to verify.
History can support this judgment; weak or missing history does not prevent
analysis from current code and call relationships.

Reject a move that merely co-locates files while increasing cycles, hidden
knowledge, or cross-boundary edits. Keep generic primitives and truly shared
behavior with their actual owner.

## Apply the boundary

Choose the smallest move that improves locality. Move related tests, stories,
styles, and docs when they share the responsibility. Follow repository naming
and placement rules.

Preserve real external API contracts. Internal paths can change atomically
with their consumers; do not add a barrel or facade solely to preserve them.
Create an entrypoint only when it provides a useful boundary.

Run affected behavior checks and required repository validation. Inspect
rendered UI when the move could change rendering or runtime composition.

Report the responsibility and evidence for each proposed or completed move,
the resulting boundary, verification, and material unresolved questions.
Use a small tree or table only when it clarifies the move.
