# Settings row (`settings-row`)

A row with a label and an in-place control: a switch, a select or a value.

## Use when

- a setting with a switch
- a setting with a select
- a labeled value with a hint

## Not when

- a row that opens another page: use [`row-action`](row-action.md)

## Tokens it reads

`--button-radius` `--card-inset` `--color-on-surface` `--color-on-surface-muted` `--field-chevron-gap` `--row-padding-block` `--size-icon` `--size-touch-comfortable` `--slider-max-width`

## Where it is drawn

- Classes: `.settings-row` `.settings-label` `.settings-hint` (typed on your own element)
- Styled in: `styles/picker.css`, `styles/primitives.css`, `styles/settings-rows.css`

## Owner's note

Label and description at the start, the control at the end. The row grammar adds the padding and the hairline; with that padding this minimum is the 48px floor, and most rows are taller.
