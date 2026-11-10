---
"@singularityfm/design-system": patch
---

Rules: a `/*` inside a string or an unquoted `url()` no longer hides the lines after it. A colour function with a literal channel (`rgb(255 0 0 / var(--a))`) is now a raw colour, and so is a colour in a `@media` or `@container` prelude; a relative colour from a token, currentColor or an interpolated source, and channels that are all tokens, still pass. Off-grid now reads the space steps inside `max()`, `clamp()` or a sum with a percentage or a dimension, and flags a space step no token defines. A computed style key (`["--x"]: 1`) declares its property. Run `ds validate` after the bump: a check that passed may now name a real finding.
