# Tonal button (`button-tonal`)

The accent container under its own words, with no outline; quieter than Filled.

## Import

- `@singularityfm/design-system/Button`

## Markup

```astro
<Button variant="tonal">Share</Button>
```

## Use when

- It is the alternative beside a Filled button
- It is a labelled add or reorder action on a list: Add source, Add section, Reorder

## Not when

- It is the only action that commits the surface: use [`button-filled`](button-filled.md)
- It dismisses or backs out: use [`button-text`](button-text.md)

## Rules

- Matches the filled button's height.
- No outline.

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
| `reserve?` | `string` | - | The widest words the button may swap to ("Saving…"). It is as wide as these and its own words in every state, so a button that hugs its words never changes width when they change (DS-9). A script that swaps the words writes `[data-button-label]`, not the button, which would drop the reserve. A `reserve` button holds words only: a `.spinner` child is read as one of them and is not given the busy spinner's place (buttons.css), so give a busy button with a spinner no `reserve`. |
| `children?` | `ReactNode` | - | - |

Every attribute of a native `button` passes through.

## Tokens it reads

`--button-height` `--button-padding` `--button-radius` `--color-on-surface` `--color-on-surface-disabled` `--color-surface-container` `--color-surface-container-hover` `--color-surface-container-pressed`

## Where it is drawn

- Classes: `.button-tonal` (a page draws the component, never types these)
- Styled in: `styles/buttons.css`, `styles/foundations.css`
- Files: `src/Button.tsx`, `src/button.ts`

## Owner's note

Button, tonal variant: the mood's container tone under its own words, with no outline, as the tonal icon button and the tonal select are. Quieter than the filled button and still a button, which an outlined box on the page's own surface was not. The accent container means chosen or current alone (owner, 2026-11-04): a control at rest takes the mood's container, grey in Default and tinted in a coloured mood, so no mood needs a grey it does not have.
