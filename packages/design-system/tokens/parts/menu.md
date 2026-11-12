# Menu (`menu`)

A short list of actions that opens from an icon button: a row each, its glyph first.

## Import

- `@singularityfm/design-system/Menu`
- `@singularityfm/design-system/MenuItem`
- `@singularityfm/design-system/Icon`

## Markup

```astro
<Menu id="row-menu-3" title="Daily"><MenuItem><Icon name="pencilSimple" />Edit</MenuItem><MenuItem tone="danger"><Icon name="trash" />Delete</MenuItem></Menu>
```

## Use when

- A card, header or row has more actions than room: Download, Add to queue, Share, Delete
- Each action is one tap, with no choice of its own
- It has five actions or more: on a phone's sheet the first three become a row of tiles above the rest (menuHasTiles). Fewer than five are all rows

## Not when

- The person picks one value from a list: use [`select`](select.md)
- The only action is the one the button names: use [`button-text`](button-text.md)

## Rules

- A native popover with no client directive: its button opens it with popoverTarget (DS-8); light dismiss and Escape close it, and the header's Close needs the page's menu script.
- Menu draws its children as given: with five actions or more the host asks menuHasTiles() and wraps the first three in a row with menuTilesClass() itself.
- Under 40rem a menu is a sheet, never a small popover.
- A script finds one with MENU_SELECTORS (design-system/menu.ts); a string builder or an island takes menuListClass() and menuItemClass().

## Experimental options

- `flush` (since 2026-11-12): A host that draws its own header and body in the menu's surface (the queue's popover, the emoji picker) keeps them flush with its edges, with no list padding above and below (owner, 2026-11-12: keep the queue popover and emoji picker as they are).

## Props of Menu

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `id` | `string` | - | The popover's id: the button that opens it names it with popoverTarget. |
| `title` | `string` | - | The sheet's header on a phone, and the menu's name for a screen reader. |
| `subtitle?` | `string` | - | A quiet line under the title on a phone's sheet, such as a card's facts. |
| `flush?` | `boolean` | - | No padding above and below the list, for a host that draws its own header and body in the menu's surface. Experimental (DS-11): it may change or go in a minor release (menu.ts says why it exists). |
| `className?` | `string` | - | For placing the popover under its own button (the anchor of a row or a story). Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop. |
| `children?` | `ReactNode` | - | The rows: MenuItem, and a tiles row of them. |

## Props of MenuItem

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `tone?` | `"danger"` | - | The danger tone, for the one row that destroys. |
| `className?` | `string` | - | For placing the row where it stands, or a hook a script finds it by. Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop. |
| `slot?` | `string` | - | Astro places the row in its parent's slot with it; it is not an attribute of the row. |
| `children?` | `ReactNode` | - | The row's glyph first, then its words. |

Every attribute of a native `button` passes through.

## Props of Icon

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `name` | `IconName` | - | - |
| `size?` | `"md" \| "lg"` | `"md"` | The glyph's box: medium beside words, large when it is the whole button. |
| `className?` | `string` | `""` | A hook for the control that holds it (a rule that places the glyph, or swaps it). An Astro page passes className too: @astrojs/react drops a `class` prop before the component sees it. |

## Tokens it reads

`--color-accent` `--color-accent-container` `--color-accent-container-hover` `--color-accent-container-pressed` `--color-border-hairline` `--color-danger` `--color-on-accent-container` `--color-on-surface` `--color-on-surface-disabled` `--color-on-surface-muted` `--color-scrim` `--color-surface-overlay` `--color-surface-overlay-hover` `--color-surface-overlay-pressed` `--layout-column` `--shadow-popover` `--shape-2xl` `--shape-md` `--shape-sheet` `--shape-xl` `--sheet-bg` `--sheet-bg-hover` `--sheet-bg-pressed` `--sheet-shadow` `--sheet-tile-bg` `--sheet-tile-bg-hover` `--sheet-tile-bg-pressed` `--size-icon` `--size-option` `--size-touch`

## Where it is drawn

- Classes: `.menu-list` `.menu-sheet` `.menu-item` `.menu-item-danger` `.menu-tiles` `.menu-tile` `.menu-item-value` (a page draws the component, never types these)
- Styled in: `styles/buttons.css`, `styles/menu.css`
- Files: `src/Menu.tsx`, `src/MenuItem.tsx`, `src/menu.ts`

## Owner's note

A popover lives in the top layer, so it is placed against the viewport, not the row. Where anchor positioning exists it hangs under the button, right edges level; elsewhere heroMenu.ts writes --menu-top and --menu-right from the button's box when it opens.
