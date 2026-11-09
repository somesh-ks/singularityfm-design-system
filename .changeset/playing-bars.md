---
"@singularityfm/design-system": minor
---

PlayingBars is a component: import it as `@singularityfm/design-system/PlayingBars` to draw the three moving bars that show something playing (the Play chip's mark), on any play control, with `className` to place it, instead of typing `chip-bars`. The Play chip draws it; its markup is the same but for `aria-hidden="true"` on the bars, inside a glyph that was already hidden. `.chip-bars` now lays itself out (`display: flex`), so the bars show wherever they are drawn; in the chip they still show only while it plays.
