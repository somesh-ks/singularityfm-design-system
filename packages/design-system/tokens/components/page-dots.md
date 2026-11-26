---
version: "0.14.0"
id: page-dots
name: "PageDots"
kind: component
imports:
  - "@singularityfm/design-system/PageDots"
---

# PageDots

Import `@singularityfm/design-system/PageDots`. No part covers it yet, so `ds find` does not name it.

## Import

- `@singularityfm/design-system/PageDots`

## Example

```tsx
<PageDots count={3} current={0} />
```

## Accessibility

- Role: Decorative dots `<span aria-hidden="true">`; PageArrows are native `<button>`s
- ARIA: The dots are hidden from screen readers: the row's own items carry the content.
- ARIA: PageArrows take prevLabel and nextLabel as aria-label and aria-controls the row's id; an arrow at the row's end is disabled.
- ARIA: PageArrows do nothing until the page calls installPageArrows() from @singularityfm/design-system/pageDots once the row is in the page.
- Keyboard: PageArrows: Enter and Space move the row a screen. A swipe or Tab through the row does the same where they are hidden.
- Focus: PageArrows show the native :focus-visible ring; disabled arrows leave the tab order.

## Props of PageDots

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `count` | `number` | - | How many pages there are. One or fewer draws nothing. |
| `current?` | `number` | `0` | The page showing, from 0. A page's script moves it by setting aria-current="true" on that dot's span (and removing it from the last). |
| `className?` | `string` | - | For placing the row, or a hook a page's script finds it by. Never its look. |
