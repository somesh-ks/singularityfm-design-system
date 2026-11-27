---
version: "0.19.0"
id: show-pick
name: "ShowPick"
kind: component
imports:
  - "@singularityfm/design-system/ShowPick"
---

# ShowPick

Import `@singularityfm/design-system/ShowPick`. No part covers it yet, so `ds find` does not name it.

## Import

- `@singularityfm/design-system/ShowPick`

## Example

```tsx
<ul role="list">
  <ShowPick title="Hard Fork" facts="The New York Times" cover="cover.webp" name="show" value="hard-fork" />
</ul>
```

## Accessibility

- Role: A list item holding a `<label>` around a visually hidden `<input type="checkbox">`
- ARIA: The visible show name and its quiet line are the accessible name; the cover is decorative (alt="").
- ARIA: The picked state is the checkbox's own; the check glyph is aria-hidden.
- Keyboard: Tab moves across cards; Space toggles one.
- Focus: The cover wears the foundations' focus ring for the hidden input.

## Props of ShowPick

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `title` | `string` | - | The show's name, under its cover. A script that fills a cloned card writes [data-show-pick-title]. |
| `facts?` | `string` | - | The quiet line under the name (who makes it). Filled by a script at [data-show-pick-facts]. |
| `cover?` | `string` | - | The cover's address. Filled by a script at [data-show-pick-cover]. |
| `className?` | `string` | - | For placing the card, or a hook a page's script finds it by. Never its look. |

Every attribute of a native `<input>` element passes through, except `type`.
