# Dialog (`dialog`)

A small centred box with a heading and a row of buttons: one question, one tap.

## Import

- `@singularityfm/design-system/Dialog`
- `@singularityfm/design-system/DialogActions`
- `@singularityfm/design-system/DialogTitle`

## Markup

```astro
<Dialog aria-labelledby="t"><DialogTitle id="t">Delete?</DialogTitle><DialogActions><Button variant="text">Cancel</Button></DialogActions></Dialog>
```

## Use when

- A person confirms what cannot be undone: Delete, Discard, Switch profile

## Not when

- The question needs fields to answer: use [`sheet`](sheet.md)
- a form that slides in, with fields: use [`sheet`](sheet.md)

## Rules

- A script finds one with DIALOG_SELECTOR; one it builds uses dialogClass(), dialogBodyClass() and dialogActionsClass().
- It renders closed, with no client directive: a script opens it with dialog.showModal() (an island through ref) and closes it with dialog.close() from the Cancel button's click.

## Props of Dialog

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `form?` | `Record<string, unknown>` | - | Attributes for a form body: the dialog then submits. Without it the body is a plain box. An Astro page writes them as HTML does (`novalidate`, `method: "dialog"`). |
| `className?` | `string` | - | For placing the dialog where it stands. Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop before the component sees it. |
| `children?` | `ReactNode` | - | The question, its words and its DialogActions, inside the body. |
| `after?` | `ReactNode` | - | What sits after the body, outside the form: a hidden part a script reads (data-copy). |

Every attribute of a native `dialog` passes through.

## Props of DialogActions

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `stacked?` | `boolean` | `false` | Three answers in a column, the committing one first. |
| `children?` | `ReactNode` | - | The answers: Buttons, Cancel first in a row. |

## Props of DialogTitle

No props of its own.

## Tokens it reads

`--color-on-surface` `--color-scrim` `--shape-lg` `--sheet-bg` `--sheet-shadow`

## Where it is drawn

- Classes: `.dialog-panel` `.dialog-body` `.dialog-actions` `.dialog-actions-stacked` (a page draws the component, never types these)
- Styled in: `styles/buttons.css`, `styles/dialog.css`
- Files: `src/Dialog.tsx`, `src/DialogActions.tsx`, `src/DialogTitle.tsx`, `src/dialog.ts`
