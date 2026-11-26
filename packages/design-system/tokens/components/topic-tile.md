---
version: "0.16.1"
id: topic-tile
name: "TopicTile"
kind: component
imports:
  - "@singularityfm/design-system/TopicTile"
---

# TopicTile

Import `@singularityfm/design-system/TopicTile`. No part covers it yet, so `ds find` does not name it.

## Import

- `@singularityfm/design-system/TopicTile`

## Example

```tsx
<TopicTile name="Science" href="/topic/science" covers={["one.webp", "two.webp", "three.webp"]} />
```

## Accessibility

- Role: List `<ul role="list">` of tiles, each a native `<a href>` or a visually hidden `<input type="checkbox">`
- ARIA: The visible topic name is the accessible name; covers are decorative (alt="").
- ARIA: A checkbox tile's checked state is native; the check glyph is aria-hidden.
- Keyboard: Tab moves across tiles; Enter opens a link tile, Space toggles a checkbox tile.
- Focus: The tile wears the foundations' focus ring for its hidden input or its link.

## Props of TopicTile

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `name` | `string` | - | The topic's name, shown on the tile. It is not the checkbox's form name; a value tells ticked tiles apart. |
| `covers?` | `readonly string[]` | `[]` | Up to three cover images from the topic, by address, fanned into the bottom end from the corner. |
| `tint?` | `string` | - | The tile's fill, a colour taken from its first cover; the container grey when absent. |
| `href?` | `string` | - | Opens the topic's page. Without it the tile is a checkbox (first run). |
| `className?` | `string` | - | For placing the tile, or a hook a page's script finds it by. Never its look. |

Every attribute of a native `<input>` element passes through.
