---
version: "0.16.1"
id: dial
name: "Dial"
kind: component
imports:
  - "@singularityfm/design-system/Dial"
---

# Dial

Import `@singularityfm/design-system/Dial`. No part covers it yet, so `ds find` does not name it.

## Import

- `@singularityfm/design-system/Dial`

## Example

```tsx
<Dial>
  <DialTile name="Hard Fork" label="Play Hard Fork, 2 new" count={2}><img src="cover.webp" alt="" /></DialTile>
</Dial>
```

## Accessibility

- Role: List `<ul role="list">` of DialTile items, each a native `<button>` or `<a href>`
- ARIA: Each DialTile's label prop names its action and any count ("Play Hard Fork, 2 new"); the visible name, pin and count are aria-hidden so it reads once.
- ARIA: The tile playing now carries aria-current="true" on its press area; the page's player sets it with data-playing on the tile and clears both from the last.
- Keyboard: Tab moves across tiles; Enter or Space plays a button tile, Enter opens a link tile.
- Focus: Each tile shows the native :focus-visible ring; a focused tile in a sideways row scrolls into view.

## Props of Dial

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `children` | `ReactNode` | - | The DialTiles, one page of them. |
| `wide?` | `boolean` | `false` | Six across instead of three, for a wide column (desktop). |
| `className?` | `string` | - | For placing the grid where it stands, or a hook a page's script finds it by. Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop. |
| `slot?` | `string` | - | Astro places the grid in its parent's slot with it; it is not an attribute of the list. |

Every attribute of a native `<ul>` element passes through.
