---
"@singularityfm/design-system": minor
---

A control hugs its words (DS-13). `reserve` on PlayChip, Button, Fab and Select is deprecated: drop it, the words set the width (it still works until 1.0.0). PlayChip no longer draws `chip-again` (deprecated; 1.0.0 removes the class). PlayChip with no `label` is its glyph alone (`chip-glyph-only`), a circle as tall as the chip named by its aria-label (required then; a page's player rewrites it with each state), that keeps one box in every state and shimmers its glyph while preparing: use it for the hero's Play and a story's. Looks different: a PlayChip with words no longer has a 7rem floor or a "Play again" reserve, its digits are tabular in every state, and a played chip under a pointer keeps its words (the replay glyph says Play again).
