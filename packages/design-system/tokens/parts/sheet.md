# Sheet (`sheet`)

A panel over the page for a form or a list: full screen on a phone, at the right from 40rem.

## Import

- `@singularityfm/design-system/Sheet`
- `@singularityfm/design-system/SheetHeader`

## Markup

```astro
<Sheet title="Regenerate" titleId="regen-title" close="data-dialog-close"><form>...</form></Sheet>
```

## Use when

- Something to fill in or edit that needs room: New episode, a topic, a source
- A list over the page, dismissed by a pull or tap

## Not when

- One question and its answers: use [`dialog`](dialog.md)
- A short list of actions: use [`menu`](menu.md)
- A form in a Base UI island: use [`drawer`](drawer.md)

## Rules

- A native dialog with no client directive: a script finds one with SHEET_SELECTOR (design-system/sheet.ts) and opens it with showModal(); kind="create" is the New episode sheet, every other is a "panel".
- A header a script builds is sheetHeadHtml() (design-system/sheetHead.ts); never write the row or its Close by hand.
- `sheet-field*`, `sheet-form` and `sheet-actions` are form layout in sheets.css, not the shell.

## Props of Sheet

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `title` | `string` | - | The sheet's name: an h2 whose id the dialog's aria-labelledby names. |
| `children?` | `ReactNode` | - | The form or list, inside the scrolling body. |
| `after?` | `ReactNode` | - | What sits after the body, outside its scroll: a sticky foot, a hidden part a script reads. |
| `kind?` | `"create" \| "panel"` | `"panel"` | "create" is the New episode sheet; every other sheet is a "panel". |
| `close` | `"data-create-close" \| "data-panel-close" \| "data-dialog-close" \| "data-menu-close"` | - | The data attribute the sheet's script finds its Close button by. |
| `titleId` | `string` | - | - |
| `titleData?` | `` Record<`data-${string}`, string \| boolean> `` | - | Any data attribute the title carries for its script, such as data-panel-title. |
| `className?` | `string` | - | For placing the sheet where it stands. Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop before the component sees it. |

Every attribute of a native `<dialog>` element passes through, except `open` and `style`.

## Props of SheetHeader

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `title` | `string` | - | The sheet's name: an h2 whose id the dialog's aria-labelledby names. |
| `subtitle?` | `string` | - | A quiet line under the title: what the sheet is about, as a menu's item facts. |
| `close` | `"data-create-close" \| "data-panel-close" \| "data-dialog-close" \| "data-menu-close"` | - | The data attribute the sheet's script finds its Close button by. |
| `titleId` | `string` | - | - |
| `titleData?` | `` Record<`data-${string}`, string \| boolean> `` | `{}` | Any data attribute the title carries for its script, such as data-panel-title. |

## Tokens it reads

`--app-bar-height` `--button-height` `--color-border-hairline` `--color-on-surface` `--color-scrim` `--color-surface` `--color-surface-container` `--color-surface-hover` `--color-surface-pressed` `--shape-sheet` `--sheet-bg` `--sheet-bg-hover` `--sheet-bg-pressed` `--sheet-shadow`

## Where it is drawn

- Classes: `.sheet-side` `.sheet-head` `.sheet-body` `.sheet-title` (a page draws the component, never types these)
- Styled in: `styles/sheet.css`
- Files: `src/Sheet.tsx`, `src/sheet.ts`, `src/SheetHeader.tsx`, `src/sheetHead.ts`
