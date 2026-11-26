---
version: "0.16.0"
id: brand-mark
name: "BrandMark"
kind: component
imports:
  - "@singularityfm/design-system/BrandMark"
---

# BrandMark

Import `@singularityfm/design-system/BrandMark`. No part covers it yet, so `ds find` does not name it.

## Import

- `@singularityfm/design-system/BrandMark`

## Example

```tsx
<BrandMark />
```

## Accessibility

- Role: Decorative `<svg aria-hidden="true" focusable="false">`
- ARIA: Hidden from screen readers; adjacent wordmark text or link provides the name.
- Keyboard: None; decorative SVG mark.
- Focus: Not focusable.

## Props of BrandMark

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `className?` | `string` | `"wordmark-mark"` | Its class: wordmark-mark sizes it beside the app's name. An Astro page passes className too: @astrojs/react drops a `class` prop before the component sees it. |
