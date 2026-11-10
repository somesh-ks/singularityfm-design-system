---
"@singularityfm/design-system": patch
---

Rules: a `/*` inside a string no longer hides the lines after it; a colour function that only takes a channel from a token (`rgb(255 0 0 / var(--a))`) and a colour in a `@media` or `@container` prelude are raw colours; off-grid reads the space steps inside `max()`, `clamp()` or a sum with a dimension, and flags a space step no token defines; a computed style key (`["--x"]: 1`) declares its property. Run `ds validate` after the bump: a check that passed may now name a real finding.
