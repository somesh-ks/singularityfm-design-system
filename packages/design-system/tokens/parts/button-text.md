# Text button (`button-text`)

An accent label with no container until it is hovered or pressed; the quietest button.

## Import

- `@singularityfm/design-system/Button`

## Markup

```astro
<Button variant="text">Cancel</Button>
```

## Use when

- It dismisses, backs out or repeats: Cancel, Clear, Try again, Hide this
- It sits beside a Filled button as the lesser choice
- It is a short action on a card or a banner: See all, Install

## Not when

- The action must be found at a glance on its own: use [`button-filled`](button-filled.md)
- It has a glyph and no words: use [`icon-btn`](icon-btn.md)

## Rules

- In a dialog, Cancel and the filled button sit in a DialogActions row (EpisodeActions.astro); a form sheet keeps its one filled button in `.sheet-actions`.

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

`--button-radius` `--color-accent` `--size-touch`

## Where it is drawn

- Classes: `.button-text` (a page draws the component, never types these)
- Styled in: `styles/buttons.css`, `styles/foundations.css`, `styles/primitives.css`
- Files: `src/Button.tsx`, `src/button.ts`

## Owner's note

Button, text variant (design-system/Button.tsx): an accent label with no container until it is hovered or pressed. Usage: Cancel, Clear, Try again; the quiet action beside or under a filled button.
