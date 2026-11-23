---
"@singularityfm/design-system": patch
---

`ds validate` scopes `class-on-component` to class attributes, DOM class APIs, CSS selectors and strings made only of class names (a variable, a variant map, a `clsx()` call), so slugs and labels stop needing exemptions, and marks `PlayingBars.tsx` as owner of `chip-bars`. A setting's label now sits `--space-2` above its hint (was `--space-1`), back on the 8pt grid.
