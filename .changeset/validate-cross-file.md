---
"@singularityfm/design-system": patch
---

`ds validate` over several files counts a custom property any of them declares as declared, so a stylesheet that reads what a page's `style` attribute sets (`--swatch`) is no longer reported as unknown; from the rules, pass `unknownProperty(text, file, declared)` the `declaredProperties(text, file)` of the other files.
