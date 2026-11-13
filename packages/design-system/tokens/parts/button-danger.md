# Danger button (`button-danger`)

A Text button in the danger colour.

## Import

- `@singularityfm/design-system/Button`

## Markup

```astro
<Button variant="text" tone="danger">Delete</Button>
```

## Use when

- It is the confirm of a delete, in a dialog that asks first: Delete, Delete source

## Not when

- The action is not destructive, or nobody has been asked to confirm: use [`button-text`](button-text.md)
- It is the first control on a surface: red is for the second step, after the person has asked to delete: use [`button-text`](button-text.md)

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

`--color-danger` `--color-danger-subtle` `--color-on-surface-disabled`

## Where it is drawn

- Classes: `.button-danger` (a page draws the component, never types these)
- Styled in: `styles/buttons.css`
- Files: `src/Button.tsx`, `src/button.ts`

## Owner's note

Button, danger tone (text variant; was .confirm-delete in episode-actions.css): red only here, once the person has asked to delete. Usage: the confirm of a delete dialog, Delete and Delete source. After the disabled rule above, which it must outrank at the same specificity.
