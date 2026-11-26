---
version: "0.16.1"
id: code
name: "Code"
kind: component
imports:
  - "@singularityfm/design-system/Code"
---

# Code

Import `@singularityfm/design-system/Code`. No part covers it yet, so `ds find` does not name it.

## Import

- `@singularityfm/design-system/Code`

## Example

```tsx
<Code label="Prompt" text="pnpm run gate" />
```

## Accessibility

- Role: Focusable `<pre tabIndex={0}>` + Copy IconButton + `<span role="status">` live region
- ARIA: label sets aria-label on the `<pre>` region.
- ARIA: Copy button announces completion through the polite `<span role="status">` live region.
- Keyboard: Tab focuses `<pre>` for arrow-key scrolling/selection and moves to the Copy button; Enter/Space copies.
- Focus: Both `<pre tabIndex={0}>` and the Copy button receive keyboard focus.

## Props of Code

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `string` | - | The text's accessible name, e.g. "Prompt". |
| `text` | `string` | - | The text, copied exactly as it is. |
| `copy?` | `string` | `"Copy"` | - |
| `copied?` | `string` | `"Copied"` | - |
| `className?` | `string` | - | For placing the snippet where it stands (a margin, a grid area). Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop before the component sees it. |
