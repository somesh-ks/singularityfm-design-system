---
version: "0.18.0"
id: settings-row
name: "Settings row"
kind: container
imports:
  - "@singularityfm/design-system/Switch"
---

# Settings row (`settings-row`)

A row with a label and an in-place control: a switch, a select or a value.

## Import

- `@singularityfm/design-system/Switch`

## Markup

```astro
<div class="settings-row">
  <div class="settings-text">
    <label class="settings-label" for="autoplay">Autoplay</label>
    <span class="settings-hint" id="autoplay-hint">Continue to the next episode</span>
  </div>
  <Switch id="autoplay" name="autoplay" aria-describedby="autoplay-hint" />
</div>
```

## Use when

- a setting with a switch
- a setting with a select
- a labeled value with a hint

## Not when

- a row that opens another page: use [`row-action`](row-action.md)

## Props of Switch

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `className?` | `string` | - | For placing the switch where it stands (a margin, a grid area). Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop before the component sees it. |
| `style?` | `CSSProperties \| string` | - | Inline style, as an object or the string an Astro page writes; never its look. |

Every attribute of a native `<input>` element passes through, except `type` and `role`.

## Tokens it reads

`--button-radius` `--card-inset` `--color-on-surface` `--color-on-surface-muted` `--field-chevron-gap` `--row-padding-block` `--size-icon` `--size-touch-comfortable` `--slider-max-width`

## Where it is drawn

- Classes: `.settings-row` `.settings-label` `.settings-hint` (typed on your own element)
- Styled in: `styles/picker.css`, `styles/primitives.css`, `styles/settings-rows.css`

## Owner's note

Label and description at the start, the control at the end. The row grammar adds the padding and the hairline; with that padding this minimum is the 48px floor, and most rows are taller.
