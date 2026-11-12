# Section tabs (`tabs`)

A sticky strip of links to the sections of one page.

## Import

- `@singularityfm/design-system/SectionTabs`

## Use when

- jump to the sections of a briefing or an episode
- tabs inside a card

## Not when

- switching between two views: use [`segmented-nav`](segmented-nav.md)

## Rules

- Drawn only for two sections or more.

## Props of SectionTabs

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `sections` | `readonly SectionRef[]` | - | - |

## Tokens it reads

`--color-accent` `--color-accent-pressed` `--color-border-hairline` `--color-on-surface` `--color-on-surface-muted` `--color-surface` `--row-radius` `--tabs-height` `--tabs-indicator-height` `--tabs-indicator-radius`

## Where it is drawn

- Classes: `.tabs-bar` `.tab` `.tabs-in-card` (a page draws the component, never types these)
- Styled in: `styles/primitives.css`
- Files: `src/SectionTabs.tsx`

## Owner's note

The bar sticks and carries the surface and the line under it; the strip inside it scrolls and fades its ends. A mask on the bar itself would fade its surface and line too, and what scrolls under a stuck strip would show through at its edges.
