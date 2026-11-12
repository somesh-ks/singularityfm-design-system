---
"@singularityfm/design-system": minor
---

The package ships `AGENTS.md`, a guide for an agent that builds UI with it: add `Before writing UI, read node_modules/@singularityfm/design-system/AGENTS.md and follow it.` to your app's own `AGENTS.md`. `ds find` and `ds part` now name the import to use and print file paths as they sit in the package. Semantic colour, shadow, shape, size and text tokens carry a `$description`, so `ds token danger` and `ds find` reach them. `ds find` no longer marks a part down for a word it names itself by ("primary call to action button" now finds the Filled button). `llms.txt` drops the Avatar's animation durations and the component-token counts to stay under its budget.
