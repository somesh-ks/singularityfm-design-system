# Floating action button (`fab`)

The page's one primary action below 64rem: a glyph and a word, floating.

## Import

- `@singularityfm/design-system/Fab`

## Markup

```astro
<Fab icon="plus" label="Add source to Design">Add</Fab>
```

## Use when

- One creating action a phone needs in reach: Catch up, Add a source

## Not when

- The action sits in a form or a sheet: use [`button-filled`](button-filled.md)
- From 64rem: the side column or the page carries the action as a button: use [`button-tonal`](button-tonal.md)
- The action is one glyph with no word: use [`icon-btn`](icon-btn.md)

## Rules

- One per page, below 64rem; from 64rem it is not shown.
- label is its whole accessible name; the word beside the glyph is hidden from a screen reader.
- A script folds it by data-folded on FAB_SELECTOR (design-system/fab.ts).

## Props of Fab

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `string` | - | What a press does, for a screen reader, in full ("Add source to Design"). The word beside the glyph is hidden from it, so this is the button's one name. |
| `icon` | `IconName` | - | The glyph it keeps when it folds. |
| `href?` | `string` | - | Draws a link instead of a button, so the action works before any script (/create). |
| `target?` | `string` | - | - |
| `rel?` | `string` | - | - |
| `className?` | `string` | - | For a hook a page's rule or script finds it by. Never its look or its place: it floats where fab.css puts it. An Astro page passes className too: @astrojs/react drops a `class` prop. |
| `slot?` | `string` | - | Astro places the button in its parent's slot with it; it is not an attribute of the button. |
| `reserve?` | `string` | - | The widest words the button will say beside its glyph ("Resume · 88 min left"), for one whose words change. It is as wide as these in every state (DS-9); longer words end in an ellipsis. |
| `children` | `ReactNode` | - | The word the extended button shows beside its glyph ("Add"); it folds away while reading. |

Every attribute of a native `<button>` element passes through.

## Tokens it reads

`--color-surface` `--cta-bg` `--cta-bg-hover` `--cta-bg-pressed` `--cta-fg` `--shape-round` `--size-icon-lg`

## Where it is drawn

- Classes: `.create-fab` `.create-fab-label` `.add-fab` `.play-fab` (a page draws the component, never types these)
- Styled in: `styles/fab.css`, `styles/foundations.css`
- Files: `src/Fab.tsx`, `src/fab.ts`

## Owner's note

The FAB (Fab.tsx): the one primary action below 64rem, as Android draws a screen's primary action (D52), where making or adding is the next thing to do. Extended, the glyph and the word, at the top of a page and while scrolling back up; folded to the glyph while scrolling down to read (the app's script sets data-folded). It carries a word, so a press shows in its fill, never by scaling it. From 64rem the side column or the page carries the same action, and this one is not shown.
