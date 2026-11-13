# Filled button (`button-filled`)

The accent fill under its own words; the most prominent button.

## Import

- `@singularityfm/design-system/Button`

## Markup

```astro
<Button variant="filled" type="submit">Save</Button>
```

## Use when

- It is the one action that commits a sheet, a dialog or an empty page: Save, Add category, Listen now
- It saves or submits a form sheet, or confirms a dialog

## Not when

- Another filled button is on the same surface: make the second one Tonal: use [`button-tonal`](button-tonal.md)
- The action dismisses or backs out (Cancel, Hide this): use [`button-text`](button-text.md)
- Many rows repeat it: use a Text button or an Icon button in each row: use [`button-text`](button-text.md)
- an action that only creates, in the side column: use [`btn-action-tonal`](btn-action-tonal.md)

## Rules

- At most one per surface.
- Never a bold label.

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
| `reserve?` | `string` | - | The widest words the button may swap to ("Saving…"). It is as wide as these and its own words in every state, so a button that hugs its words never changes width when they change (DS-9). A script that swaps the words writes `[data-button-label]`, not the button, which would drop the reserve. A `reserve` button holds words only: a `.spinner` child is read as one of them and is not given the busy spinner's place (buttons.css), so give a busy button with a spinner no `reserve`. |
| `className?` | `string` | - | For placing the button where it stands (a margin, a grid area). Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop before the component sees it. |
| `slot?` | `string` | - | Astro places the button in its parent's slot with it; it is not an attribute of the button. |

Every attribute of a native `<button>` element passes through.

## Tokens it reads

`--button-height` `--button-padding` `--button-radius` `--color-on-surface-disabled` `--color-surface` `--color-surface-container` `--cta-bg` `--cta-bg-hover` `--cta-bg-pressed` `--cta-fg`

## Where it is drawn

- Classes: `.button-filled` (a page draws the component, never types these)
- Styled in: `styles/buttons.css`, `styles/foundations.css`
- Files: `src/Button.tsx`, `src/button.ts`

## Owner's note

Button, filled and tonal variants (design-system/Button.tsx): the one committing action of a sheet or an empty page, and its alternative. Both fill their row.
