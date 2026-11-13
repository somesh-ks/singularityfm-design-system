# Dialog (`dialog`)

A small centred box with a heading and a row of buttons: one question, one tap.

## Import

- `@singularityfm/design-system/Dialog`
- `@singularityfm/design-system/DialogActions`
- `@singularityfm/design-system/DialogTitle`
- `@singularityfm/design-system/Button`

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
| `children?` | `ReactNode` | - | The question, its words and its DialogActions, inside the body. |
| `after?` | `ReactNode` | - | What sits after the body, outside the form: a hidden part a script reads (data-copy). |
| `form?` | `Record<string, unknown>` | - | Attributes for a form body: the dialog then submits. Without it the body is a plain box. An Astro page writes them as HTML does (`novalidate`, `method: "dialog"`). |
| `className?` | `string` | - | For placing the dialog where it stands. Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop before the component sees it. |

Every attribute of a native `<dialog>` element passes through.

## Props of DialogActions

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `children?` | `ReactNode` | - | The answers: Buttons, Cancel first in a row. |
| `stacked?` | `boolean` | `false` | Three answers in a column, the committing one first. |

## Props of DialogTitle

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `children?` | `ReactNode` | - | The question. |

Every attribute of a native `<h2>` element passes through.

## Props of Button

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `children?` | `ReactNode` | - | - |
| `variant` | `"filled" \| "tonal" \| "text"` | - | Filled, tonal or text (button.ts says what each is for). |
| `tone?` | `"danger"` | - | The danger tone, for a text button that confirms a delete. |
| `size?` | `"small"` | - | Small: a shorter pill for a dense row or a popover (button.ts says when). |
| `href?` | `string` | - | Draws a link instead of a button, for an action that goes to an address. |
| `target?` | `string` | - | - |
| `rel?` | `string` | - | - |
| `reserve?` | `string` | - | The widest words the button may swap to ("Saving…"). It is as wide as these and its own words in every state, so a button that hugs its words never changes width when they change (DS-9). A script that swaps the words writes `[data-button-label]`, not the button, which would drop the reserve. A `reserve` button holds words only: a `.spinner` child is read as one of them and is not given the busy spinner's place (buttons.css), so give a busy button with a spinner no `reserve`. @deprecated Buttons hug their words (owner, 2026-11-13: "in general buttons should hug text"; DS-13). Drop it: the words set the width. It still works until 1.0.0 removes it. |
| `className?` | `string` | - | For placing the button where it stands (a margin, a grid area). Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop before the component sees it. |
| `slot?` | `string` | - | Astro places the button in its parent's slot with it; it is not an attribute of the button. |

Every attribute of a native `<button>` element passes through.

## Tokens it reads

`--color-on-surface` `--color-scrim` `--shape-lg` `--sheet-bg` `--sheet-shadow`

## Where it is drawn

- Classes: `.dialog-panel` `.dialog-body` `.dialog-actions` `.dialog-actions-stacked` (a page draws the component, never types these)
- Styled in: `styles/buttons.css`, `styles/dialog.css`
- Files: `src/Dialog.tsx`, `src/DialogActions.tsx`, `src/DialogTitle.tsx`, `src/dialog.ts`
