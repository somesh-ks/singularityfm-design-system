# Field (`field`)

An outlined box for text a person types: one line, or several lines (multiline).

## Import

- `@singularityfm/design-system/Field`

## Markup

```astro
<div class="manage-field"><label for="title">Title</label><Field id="title" name="title" type="text" /></div>
```

## Use when

- A person types a short value or a few lines: a title, a feed address, a prompt
- It sits under its own label in a form or a settings row

## Not when

- The value is one of two to four short options: use [`segmented-choice`](segmented-choice.md)
- A person picks one value from a list: use [`select`](select.md)
- The setting is on or off and applies as soon as it is flipped: use [`switch`](switch.md)
- The value is a number on a scale: use [`slider`](slider.md)

## Rules

- It needs no client directive: it is a native input, and types and submits before any script (DS-8).
- Draw it with <Field> (multiline for a textarea); a select or a script takes the class from fieldClass().
- A disabled field dims like a disabled switch; a disabled fieldset dims it the same way, on the same element.
- A readonly field draws itself sunken, in quieter ink: no page rule.

## Experimental options

- `tonal` (since 2026-11-12): The Topics panel's fields are tonal, as its selects and chips are (owner, 2026-10-21: "one style now"); on a card a text field takes the page's surface (owner, 2026-10-24). An outlined Select there passes data-tonal on to its select.

## Props of Field

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `multiline?` | `boolean` | `false` | Several lines that grow with the text; the corner arc is a pill's, shortened. |
| `maxLines?` | `number` | - | How many lines a multiline field grows to before it scrolls inside; 6 when left out. |
| `tonal?` | `boolean` | `false` | The container's fill and no outline, for a form whose selects are tonal too (it writes data-tonal; an outlined Select there takes data-tonal itself). Experimental (DS-11): it may change or go in a minor release (field.ts says why it exists). |
| `className?` | `string` | - | For placing the field where it stands (a width, a margin). Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop before the component sees it. |

Every attribute of a native `<input>` element passes through, except `style`.

## Tokens it reads

`--button-radius` `--color-accent` `--color-border-hairline` `--color-danger` `--color-on-surface` `--color-on-surface-muted` `--color-surface-container` `--color-surface-container-hover` `--color-surface-container-pressed` `--color-surface-sunken` `--field-border` `--field-chevron-gap` `--field-height` `--field-padding` `--field-radius` `--field-radius-multiline` `--size-icon`

## Where it is drawn

- Classes: `.field-input` (a page draws the component, never types these)
- Styled in: `styles/field.css`
- Files: `src/Field.tsx`, `src/field.ts`

## Owner's note

The text field, and the select and textarea that share its looks: a filled pill (D186; a textarea 24px), the one control with an outline, which shows on focus.
