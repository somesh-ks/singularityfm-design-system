# Small button (`button-small`)

A shorter pill, same touch target.

## Import

- `@singularityfm/design-system/Button`

## Markup

```astro
<Button variant="text" size="small">Listen now</Button>
```

## Use when

- It sits in a dense row or a popover

## Not when

- It commits a sheet: use [`button-filled`](button-filled.md)

## Props of Button

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `variant` | `"filled" \| "tonal" \| "text"` | - | Filled, tonal or text (button.ts says what each is for). |
| `tone?` | `"danger"` | - | The danger tone, for a text button that confirms a delete. |
| `size?` | `"small"` | - | Small: a shorter pill for a dense row or a popover (button.ts says when). |
| `href?` | `string` | - | Draws a link instead of a button, for an action that goes to an address. |
| `target?` | `string` | - | - |
| `rel?` | `string` | - | - |
| `className?` | `string` | - | For placing the button where it stands (a margin, a grid area). Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop before the component sees it. |
| `slot?` | `string` | - | Astro places the button in its parent's slot with it; it is not an attribute of the button. |
| `reserve?` | `string` | - | The widest words the button may swap to ("Saving…"). It is as wide as these and its own words in every state, so a button that hugs its words never changes width when they change (DS-9). A script that swaps the words writes `[data-button-label]`, not the button, which would drop the reserve. A `reserve` button holds words only: a `.spinner` child is read as one of them and is not given the busy spinner's place (buttons.css), so give a busy button with a spinner no `reserve`. @deprecated Buttons hug their words (owner, 2026-11-13: "in general buttons should hug text"; DS-13). Drop it: the words set the width. It still works until 1.0.0 removes it. |
| `children?` | `ReactNode` | - | - |

Every attribute of a native `button` passes through.

## Tokens it reads

`--button-height-small` `--button-padding-small` `--size-touch`

## Where it is drawn

- Classes: `.button-small` (a page draws the component, never types these)
- Styled in: `styles/buttons.css`
- Files: `src/Button.tsx`, `src/button.ts`

## Owner's note

Button, small size (size="small" on any variant): a shorter pill with less padding and label-size words, for a dense row or a popover where the full pill crowds the text around it (owner, 2026-11-04: Listen now in the queue). The pill is button.height-small; its target stays the touch size, as the chip's does. After the variants, so it wins at their specificity.
