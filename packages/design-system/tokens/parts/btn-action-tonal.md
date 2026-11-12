# Tonal action (`btn-action-tonal`)

The one creating action in the side column (Catch up), on the action tone.

## Use when

- the Catch up action in the side column

## Not when

- any other button: use [`button-tonal`](button-tonal.md)

## Tokens it reads

`--action-tonal-radius` `--color-surface` `--cta-bg` `--cta-bg-hover` `--cta-bg-pressed` `--cta-fg`

## Where it is drawn

- Classes: `.btn-action-tonal` (a page draws the component, never types these)
- Styled in: `styles/buttons.css`

## Owner's note

Tonal action: the one creating action in the side column (Catch up, AppNav.astro). Usage: add it to the action's own element, which keeps its size and layout. It wears the primary fill, the filled button's and Play's (owner, 2026-11-04: "all should have the same color synchronized"); it was a third, saturated tone of its own (owner, 2026-10-27), which read as a second primary beside Play. The current row's accent container still means "you are here" alone. - A 16px rounded rectangle: the one recorded exception to the pill rule (D186), so its shape alone tells it from the pill-shaped current row beside it (--action-tonal-radius). - Flat: no elevation and no shadow (owner, 2026-10-27). - Hover and press take the primary fill's own steps (--cta-bg-hover, --cta-bg-pressed).
