# Search field (`search-field`)

The rounded search pill, on the container tone, with its glyph.

## Import

- `@singularityfm/design-system/SearchField`

## Markup

```astro
<SearchField label="Search your library" name="q" placeholder="Search your library" />
```

## Use when

- Search or filter a list by text: the Library, Sources, Downloads

## Not when

- A text field in a form: use [`field`](field.md)
- A person picks one of a known list: use [`select`](select.md)

## Rules

- A native input with no client directive (DS-8).
- clearable draws a Clear text button at its end; the page calls installSearchClear() (design-system/searchField) on each page load, and syncSearchClear(input) after it sets the text itself.

## Experimental options

- `clearable` (since 2026-11-12): A Clear text button in the field (owner, 2026-10-08, ledger reading-library.md): the native one differs in every browser and is hidden, and without room for the button the typed text runs under it. On the Library, the Sources filter, Blocked outlets, Downloads and the emoji search.

## Props of SearchField

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `string` | - | The input's name for a screen reader ("Search your library"); the glyph and the hint show it. |
| `clearable?` | `boolean` | `false` | A Clear text button at the field's end, shown while it holds text. The page calls installSearchClear() from design-system/searchField once per page load. Experimental (DS-11): it may change or go in a minor release (searchField.ts says why it exists). |
| `className?` | `string` | - | For placing the field where it stands, or a hook a page's rule finds it by. Never its look. It goes on the outer element (the pill, or the wrapper of a clearable field); every other attribute goes on its input. An Astro page passes className too: @astrojs/react drops a `class` prop. |
| `slot?` | `string` | - | Astro places the field in its parent's slot with it; it is not an attribute of the input. |

Every attribute of a native `<input>` element passes through.

## Tokens it reads

`--color-border-control` `--color-on-surface` `--color-on-surface-muted` `--color-surface-container` `--color-surface-container-focus` `--color-surface-container-hover` `--field-height` `--shape-round` `--size-touch`

## Where it is drawn

- Classes: `.search-field` `.search-field-wrap` `.search-field-clear` (a page draws the component, never types these)
- Styled in: `styles/buttons.css`, `styles/search-field.css`
- Files: `src/SearchField.tsx`, `src/searchField.ts`

## Owner's note

The search field: a filled pill with the glyph inside it, as a search bar is in every Google app. The glyph and the placeholder say what it is. Focus lifts it (the overlay fill and a hairline; the design is flat, so no shadow); the ring is the keyboard's only (data-input, app.ts), so a tap, a click or typing never draws it. It is keyed off the pointer, not on the keyboard, so a page with no input script still shows keyboard users their place (2026-11-10). Library, Sources and every topic's page share this one field (2026-10-21; styles.test.ts holds them to it).
