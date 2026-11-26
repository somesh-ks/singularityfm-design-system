---
version: "0.16.0"
id: band
name: "Band"
kind: component
imports:
  - "@singularityfm/design-system/Band"
---

# Band

Import `@singularityfm/design-system/Band`. No part covers it yet, so `ds find` does not name it.

## Import

- `@singularityfm/design-system/Band`

## Example

```tsx
<Band title="Catchups">
  <ul role="list">...</ul>
</Band>
```

## Accessibility

- Role: `<section>` with an `<h2>` heading
- ARIA: The heading names the section; the Singularity mark before it is decorative.
- Keyboard: None of its own; the action and the items inside take focus in DOM order.
- Focus: Not focusable; children manage focus.

## Props of Band

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `title` | `string` | - | The heading's words: "Catchups". |
| `action?` | `ReactNode` | - | What sits at the heading's end: a See all link (a Button text link). |
| `children` | `ReactNode` | - | What the band holds: a shelf of cards, or result rows. |
| `className?` | `string` | - | For placing the band, or a hook a page's script finds it by. Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop. |

Every attribute of a native `<section>` element passes through.
