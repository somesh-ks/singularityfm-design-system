---
version: "0.15.0"
id: row-exit
name: "RowExit"
kind: component
imports:
  - "@singularityfm/design-system/RowExit"
---

# RowExit

Import `@singularityfm/design-system/RowExit`. No part covers it yet, so `ds find` does not name it.

## Import

- `@singularityfm/design-system/RowExit`

## Example

```tsx
<ul>
  <RowExit data-item="1">Row content</RowExit>
</ul>
```

## Accessibility

- Role: Native `<li>` list item
- ARIA: Place inside `<ul>` or `<ol>`; page scripts mark data-removing or data-gone and pair removal with Toast Undo.
- Keyboard: Inherits keyboard semantics of controls placed inside the row.
- Focus: Page script should restore or move focus cleanly when removing a focused row.

## Props of RowExit

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `children?` | `ReactNode` | - | The row's content. |
| `className?` | `string` | `""` | For placing the row (its own layout). Never how it leaves. An Astro page passes className too: @astrojs/react drops a `class` prop before the component sees it. |

Every attribute of a native `<li>` element passes through.
