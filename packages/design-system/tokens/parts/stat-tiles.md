# Stat tiles (`stat-tiles`)

A tile per figure: the value large over its word in muted ink.

## Use when

- figures on a dashboard
- costs and spend totals

## Not when

- a list of rows: use [`card-group`](card-group.md)

## Where it is drawn

- Classes: `.stat-tiles` (typed on your own element)
- Styled in: `styles/primitives.css`

## Owner's note

A figure on a dashboard: a tile per stat, its value large over its word in muted ink, two columns on a phone and four from 40rem. The owner, 2026-10-27: the Costs page's stat pills became boxes, no pill for a figure. In a card a tile sits the card's padding in, so its corner is the card's less that padding (--card-content-radius, concentric), and it takes the overlay tone, as the card's chips do. On the 8pt grid: 16px in, a 24px value line and a 24px label line, 80px a tile. The value is the title step at regular weight, under the page's total it explains (owner, 2026-10-27: the heading-size medium value "competes with the main cost number"). Put .stat-tiles on the list and .stat-tile on each item, with .stat-tile-value and .stat-tile-label inside. Used by the Costs page (analytics.astro, costsPage.ts) and the Health page's summary (settings/health.astro).
