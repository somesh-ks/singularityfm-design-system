# Icon button (`icon-btn`)

A glyph in a round 44px target, quiet until used.

## Import

- `@singularityfm/design-system/IconButton`
- `@singularityfm/design-system/Icon`

## Markup

```astro
<IconButton label="Close"><Icon name="close" size="lg" /></IconButton>
```

## Use when

- One glyph says what it does: Close, Back, More, Share
- A row's dots menu, or the Close of a sheet
- A toolbar glyph, a sheet's Close, a row's dots or its end action
- Many rows repeat it

## Not when

- It is the companion of a primary action: Share beside Play: use [`icon-btn-tonal`](icon-btn-tonal.md)
- The action needs a word to be understood: use [`button-text`](button-text.md)
- The action floats over the page: use [`fab`](fab.md)
- A row would carry several of them: its actions go in a dots menu at its end: use [`menu`](menu.md)

## Rules

- label is required: it is the button's accessible name (aria-label), as the glyph has no words.
- It draws `.press`: the press is a state layer; the glyph never scales.
- rowEnd for one that ends a row; a script or an island (a Base UI Close) takes the classes from iconButtonClass().
- A toggle sets aria-pressed and holds two glyphs, off then on (<Icon name="thumbsUp" /><Icon name="thumbsUpFill" />): the button shows the one its state calls for, and a standard one that is on takes the accent container.

## Experimental options

- `variant="filled"` (since 2026-11-12): The queue's Start listening is a Play, so it wears the primary fill with its own hover and press (owner, 2026-11-04: "every primary button one colour").

## Props of IconButton

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `string` | - | What a press does, for a screen reader: the glyph has no words ("Close", "Share"). |
| `children` | `ReactNode` | - | The glyph: an Icon, or two that the button's state swaps between. |
| `variant?` | `"standard" \| "tonal" \| "filled"` | `"standard"` | Standard (the default); tonal, the circle beside a primary action; or filled, a glyph that is the primary action, experimental (DS-11). iconButton.ts says when. |
| `rowEnd?` | `boolean` | `false` | It ends a row: its glyph's ink lands where the words of the rows around it end (D187). |
| `href?` | `string` | - | Draws a link instead of a button, for a glyph that goes to an address (Back). |
| `target?` | `string` | - | - |
| `rel?` | `string` | - | - |
| `className?` | `string` | - | For placing the button where it stands, or a hook a page's rule or script finds it by. Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop. |
| `slot?` | `string` | - | Astro places the button in its parent's slot with it; it is not an attribute of the button. |

Every attribute of a native `<button>` element passes through.

## Props of Icon

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `name` | `IconName` | - | - |
| `size?` | `"md" \| "lg"` | `"md"` | The glyph's box: medium beside words, large when it is the whole button. |
| `className?` | `string` | `""` | A hook for the control that holds it (a rule that places the glyph, or swaps it). An Astro page passes className too: @astrojs/react drops a `class` prop before the component sees it. |

## Tokens it reads

`--button-radius` `--color-accent` `--color-accent-container` `--color-on-accent-container` `--color-on-surface` `--color-on-surface-disabled` `--color-on-surface-muted` `--color-surface-container` `--cta-bg` `--cta-bg-hover` `--cta-bg-pressed` `--cta-fg` `--size-icon` `--size-touch`

## Where it is drawn

- Classes: `.icon-btn` `.press` `.icon-btn-end` `.icon-btn-filled` (a page draws the component, never types these)
- Styled in: `styles/buttons.css`, `styles/foundations.css`
- Files: `src/IconButton.tsx`, `src/iconButton.ts`

## Owner's note

The icon button: a glyph in a round 44px target. Quiet until used; the accent is for actions that have a label. Its glyph is the regular icon, not the large one, so air stands round it in the circle (owner, 2026-11-13: "icon buttons have more padding around the icon").
