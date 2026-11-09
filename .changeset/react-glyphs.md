---
"@singularityfm/design-system": minor
---

Icon, BrandMark and Flag are React components (DS-3): import them as `@singularityfm/design-system/Icon`, `/BrandMark` and `/Flag`, and place an Icon or a BrandMark with `className`. `Icon.astro`, `BrandMark.astro` and `Flag.astro` are deprecated but work as before, `class` included, until a breaking release removes them. Markup and look are unchanged, except that a Flag's `<img>` now closes as `<img ... />`; each renders on the server and ships no script.
