---
"@singularityfm/design-system": minor
---

New export `@singularityfm/design-system/rules`: `validate(text, file)` and one function per rule (raw colour, spacing off the 8pt grid with `GRID_EXCEPTIONS`, unknown custom properties, a component's class typed by a page, retired import paths in `RETIRED_PATHS`), and `ds validate <files or globs>`; add `"extends": ["@singularityfm/design-system/rules/biome-config.json"]` to your biome.json to lint raw colour in CSS with the shipped GritQL plugin. `tokens/system.json` gains `properties`, the custom properties the stylesheets declare beside the tokens.
