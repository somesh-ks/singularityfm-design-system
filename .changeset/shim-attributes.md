---
"@singularityfm/design-system": patch
---

The deprecated `.astro` paths pass every attribute on as an `.astro` component took it: a `style` string (`<Button style="order: 2">`) no longer throws, and an HTML-named attribute (`readonly`, `autofocus`, `maxlength`, `tabindex`) reaches the element instead of being dropped or warned on.
