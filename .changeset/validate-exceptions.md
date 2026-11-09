---
"@singularityfm/design-system": minor
---

`ds validate --exceptions <file.json> <files or globs>` reads your own exceptions, each with its reason: `grid`, your 4px cases as `[selector, reason]` pairs (what `offGrid` takes), and `exempt`, findings you mean, as `{ "file", "rule", "text", "reason" }` (one rule in one file, on a line that holds `text`). `validate(text, file, { gridExceptions, declared })` takes the 4px list and the other files' declared properties.
