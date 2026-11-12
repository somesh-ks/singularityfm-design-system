# Row action (`row-action`)

A row that is one link or button: the whole row responds as a rounded tile.

## Markup

```astro
<a class="row-action" href="/settings/schedule"><span class="settings-text"><span class="settings-label">Daily</span><span class="settings-hint">Every other day</span></span><Icon name="chevronRight" /></a>
```

## Use when

- a settings row that opens a sub-page
- a menu or list row that navigates
- a row with a label, a hint and a chevron

## Not when

- a row that holds a switch or a select: use [`settings-row`](settings-row.md)
- a destructive or non-navigating action: use [`button-text`](button-text.md)

## Rules

- Label in regular weight, never bold.
- Sits in a `.rows.card-group`.

## Tokens it reads

`--color-focus-ring` `--color-on-surface-muted` `--row-tile-radius` `--size-touch-comfortable`

## Where it is drawn

- Classes: `.row-action` `.settings-text` `.settings-label` `.settings-hint` (a page draws the component, never types these)
- Styled in: `styles/foundations.css`, `styles/primitives.css`, `styles/settings-rows.css`

## Owner's note

A row that is one link or button: the whole row responds. Its fill is a rounded tile clear of the hairlines and reaching a little past the words, as a menu's options are, so a hovered row reads as one thing to press rather than a band across the page.
