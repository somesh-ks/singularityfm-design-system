---
version: "0.15.0"
id: avatar
name: "Avatar"
kind: component
imports:
  - "@singularityfm/design-system/Avatar"
---

# Avatar

Import `@singularityfm/design-system/Avatar`. No part covers it yet, so `ds find` does not name it.

## Import

- `@singularityfm/design-system/Avatar`

## Example

```tsx
<Avatar shape="cookie" size="md" label="Open profile" />
```

## Accessibility

- Role: Base UI Avatar.Root: static `<span>` or interactive `<button type="button">` when label is set
- ARIA: Pass label to render an interactive profile button with aria-label={label}.
- ARIA: Decorative shape SVG inside is aria-hidden="true".
- Keyboard: When label is provided, Enter and Space trigger the profile button.
- Focus: Focusable only when label renders it as a button.

## Props of Avatar

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `label?` | `string` | - | A button that opens the profile, named for a screen reader. Without it the avatar is a picture. |
| `photo?` | `string` | - | The reader's photo, where there is one: round with an accent ring, in place of the shape. The shape stands in if it fails to load, once hydrated (client:load). |
| `size?` | `"md" \| "lg" \| "xl"` | `"md"` | - |
| `shape?` | `string` | `"cookie"` | The shape's id (AVATAR_SHAPES). The app passes the one the reader picked, or the mood's first. |
| `className?` | `string` | - | For placing the avatar where it stands. Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop before the component sees it. |
