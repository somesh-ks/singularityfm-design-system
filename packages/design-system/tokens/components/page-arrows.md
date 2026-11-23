---
version: "0.13.0"
id: page-arrows
name: "PageArrows"
kind: component
imports:
  - "@singularityfm/design-system/PageArrows"
---

# PageArrows

Import `@singularityfm/design-system/PageArrows`. No part covers it yet, so `ds find` does not name it.

## Import

- `@singularityfm/design-system/PageArrows`

## Example

```tsx
<PageArrows controls="topics" prevLabel="Earlier topics" nextLabel="More topics" />
```

## Accessibility

- Role: Decorative dots `<span aria-hidden="true">`; PageArrows are native `<button>`s
- ARIA: The dots are hidden from screen readers: the row's own items carry the content.
- ARIA: PageArrows take prevLabel and nextLabel as aria-label and aria-controls the row's id; an arrow at the row's end is disabled.
- Keyboard: PageArrows: Enter and Space move the row a screen. A swipe or Tab through the row does the same where they are hidden.
- Focus: PageArrows show the native :focus-visible ring; disabled arrows leave the tab order.

## Props of PageArrows

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `prevLabel` | `string` | - | What Back says to a screen reader: "Earlier shows". |
| `nextLabel` | `string` | - | What Next says: "More shows". |
| `controls` | `string` | - | The id of the row it moves: a Dial, a TopicGrid or a shelf that scrolls sideways. |
| `className?` | `string` | - | For placing the pair, or a hook a page's script finds it by. Never its look. |
