---
version: "0.14.0"
id: dial-tile
name: "DialTile"
kind: component
imports:
  - "@singularityfm/design-system/DialTile"
---

# DialTile

Import `@singularityfm/design-system/DialTile`. No part covers it yet, so `ds find` does not name it.

## Import

- `@singularityfm/design-system/DialTile`

## Example

```tsx
<DialTile name="Hard Fork" label="Play Hard Fork" playing><img src="cover.webp" alt="" /></DialTile>
```

## Accessibility

- Role: List `<ul role="list">` of DialTile items, each a native `<button>` or `<a href>`
- ARIA: Each DialTile's label prop names its action and any count ("Play Hard Fork, 2 new"); the visible name, pin and count are aria-hidden so it reads once.
- ARIA: The tile playing now carries aria-current="true" on its press area; the page's player sets it with data-playing on the tile and clears both from the last.
- Keyboard: Tab moves across tiles; Enter or Space plays a button tile, Enter opens a link tile.
- Focus: Each tile shows the native :focus-visible ring; a focused tile in a sideways row scrolls into view.

## Props of DialTile

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `name` | `string` | - | The show's name, written on the cover. |
| `label` | `string` | - | What a press does, for a screen reader: "Play Hard Fork, 2 new". The name and count on the cover are drawn for the eye only, so this is the tile's whole name. |
| `children` | `ReactNode` | - | The cover: an image or the app's own cover, filling the square. |
| `pinned?` | `boolean` | `false` | Pinned first by the person (the newest Daily always is). |
| `href?` | `string` | - | Draws a link instead of a button, for a tile that opens a page. |
| `count?` | `number \| string` | - | New episodes; a word ("New") for a Catchup. Absent or 0 draws no badge. |
| `playing?` | `boolean` | `false` | The tile whose show is playing now: the accent ring. The page's player sets data-playing. |
| `className?` | `string` | - | For placing the tile, or a hook a page's script finds it by (data-play-item). Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop. |

Every attribute of a native `<button>` element passes through.
