---
version: "0.13.0"
id: topic-grid
name: "TopicGrid"
kind: component
imports:
  - "@singularityfm/design-system/TopicGrid"
---

# TopicGrid

Import `@singularityfm/design-system/TopicGrid`. No part covers it yet, so `ds find` does not name it.

## Import

- `@singularityfm/design-system/TopicGrid`

## Example

```tsx
<TopicGrid>
  <TopicTile name="Technology" href="/topic/technology" covers={["one.webp"]} />
</TopicGrid>
```

## Accessibility

- Role: List `<ul role="list">` of tiles, each a native `<a href>` or a visually hidden `<input type="checkbox">`
- ARIA: The visible topic name is the accessible name; covers are decorative (alt="").
- ARIA: A checkbox tile's checked state is native; the check glyph is aria-hidden.
- Keyboard: Tab moves across tiles; Enter opens a link tile, Space toggles a checkbox tile.
- Focus: The tile wears the foundations' focus ring for its hidden input or its link.

## Props of TopicGrid

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `children` | `ReactNode` | - | The TopicTiles. |
| `wide?` | `boolean` | `false` | Four across instead of two, for a wide column (desktop). |
| `className?` | `string` | - | For placing the grid, or a hook a page's script finds it by. Never its look. |

Every attribute of a native `<ul>` element passes through.
