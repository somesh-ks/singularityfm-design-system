# Tonal icon button (`icon-btn-tonal`)

A circle on the container fill, beside a primary action.

## Import

- `@singularityfm/design-system/IconButton`
- `@singularityfm/design-system/Icon`

## Markup

```astro
<IconButton variant="tonal" label="Share"><Icon name="shareFat" /></IconButton>
```

## Use when

- The companion of a primary action in one row: Share beside Play

## Not when

- A lone toolbar glyph, or one in every row: use [`icon-btn`](icon-btn.md)

## Props of IconButton

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `string` | - | What a press does, for a screen reader: the glyph has no words ("Close", "Share"). |
| `variant?` | `"standard" \| "tonal" \| "filled"` | `"standard"` | Standard (the default); tonal, the circle beside a primary action; or filled, a glyph that is the primary action, experimental (DS-11). iconButton.ts says when. |
| `rowEnd?` | `boolean` | `false` | It ends a row: its glyph's ink lands where the words of the rows around it end (D187). |
| `href?` | `string` | - | Draws a link instead of a button, for a glyph that goes to an address (Back). |
| `target?` | `string` | - | - |
| `rel?` | `string` | - | - |
| `className?` | `string` | - | For placing the button where it stands, or a hook a page's rule or script finds it by. Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop. |
| `slot?` | `string` | - | Astro places the button in its parent's slot with it; it is not an attribute of the button. |
| `children` | `ReactNode` | - | The glyph: an Icon, or two that the button's state swaps between. |

Every attribute of a native `<button>` element passes through.

## Props of Icon

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `name` | `IconName` | - | - |
| `size?` | `"md" \| "lg"` | `"md"` | The glyph's box: medium beside words, large when it is the whole button. |
| `className?` | `string` | `""` | A hook for the control that holds it (a rule that places the glyph, or swaps it). An Astro page passes className too: @astrojs/react drops a `class` prop before the component sees it. |

## Tokens it reads

`--color-on-surface` `--color-surface-container` `--color-surface-container-hover` `--color-surface-container-pressed`

## Where it is drawn

- Classes: `.icon-btn-tonal` (a page draws the component, never types these)
- Styled in: `styles/buttons.css`
- Files: `src/IconButton.tsx`, `src/iconButton.ts`

## Owner's note

The secondary icon button (2026-10-29, owner: "a circle as a secondary button"): an .icon-btn on the fill of the select chip (--color-surface-container), so it sits beside Play and a dropdown as one row in both themes. Usage: add it with .icon-btn for the companion of a primary action (Share beside Play); a lone toolbar glyph stays a plain .icon-btn. Its ink is full strength, not muted, because the fill already marks it as a control.
