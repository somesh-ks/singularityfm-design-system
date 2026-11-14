# Card group (`card-group`)

A group of rows in one rounded container on the container tone.

## Use when

- group several settings rows
- a card of chips
- one note that is an offer, with the accent tone

## Not when

- a single stat or number: use [`stat-tiles`](stat-tiles.md)

## Rules

- A card of one row follows its height for its corner.
- Dividers run edge to edge inside.

## Tokens it reads

`--card-chip-hover` `--card-inner-radius` `--card-inset` `--card-padding` `--card-radius` `--color-border-hairline` `--color-on-surface` `--color-surface` `--color-surface-container` `--color-surface-container-hover` `--color-surface-container-pressed` `--color-surface-hover` `--color-surface-overlay` `--color-surface-overlay-hover` `--color-surface-overlay-pressed` `--row-padding-block` `--shape-xl`

## Where it is drawn

- Classes: `.card-group` `.rows` (typed on your own element)
- Styled in: `styles/field.css`, `styles/primitives.css`, `styles/search-field.css`, `styles/select.css`, `styles/settings-rows.css`

## Owner's note

A group of settings rows in one rounded container on the container tone, as Material 3 groups an Android settings screen: the group is told apart from the page by tone alone, never by a shadow or a line. Put the class on the .rows list itself; the rows keep their own padding. Its words sit the card's padding in from its edge, and a row's hover tile keeps clear of the corners. 2026-10-22, "the padding around the list menus ... must be spacious": the words 24px in, the tiles 16px in on every side. The card adds half the inset above and below and each tile takes the other half inside its row, so the first and last tiles sit one inset from the edge, two tiles sit one inset apart, and the rows keep their 64px rhythm. 2026-10-24, the owner: "I want the padding to be less and the list items to be spacious to improve click area ... 4px padding is decent": the inset is 4px, a link row's box is its tile (one inset from the card's edges, its words still the padding in), so the whole tile is the target and nothing outside it is. The card adds the inset above and below and two rows sit one inset apart; each row keeps 64px.
