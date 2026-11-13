# Select (`select`)

A native select with its own chevron.

## Import

- `@singularityfm/design-system/Select`

## Markup

```astro
<Select variant="tonal" label="Sort" data-library-sort><option value="newest">Newest first</option></Select>
```

## Use when

- A person picks one value from a list of five or more, or of names that are too long for a row of chips
- It sits under its own label in a form, or in a toolbar as a sort or a filter

## Not when

- the value is one of two to four short options: use [`segmented-choice`](segmented-choice.md)
- several values may be ticked together: use [`multiselect`](multiselect.md)

## Rules

- A native select with no client directive (DS-8); a page that draws one calls installSelectSheet() once for the phone's sheet.
- Outlined (the default) is a value in a form; tonal is a sort or a filter and takes data-active on its wrapper (find it with closest("[data-select]")) once its value is not the default.
- A select inside a settings row takes class="value-select" from settings.css, which draws it as the row's value.
- data-wheel on a short ordered run (the hours of a day) opens its phone sheet as a Wheel (design-system/wheel.ts), not as rows.

## Props of Select

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `label?` | `string` | - | A name for a select that has no label of its own; read aloud, never drawn. Draws a label around it. |
| `children?` | `ReactNode` | - | The options: `<option>` and `<optgroup>`, as a native select holds them. |
| `variant?` | `"outlined" \| "tonal"` | `"outlined"` | Outlined for a value in a form, tonal for a sort or a filter (select.ts says which is which). |
| `reserve?` | `string` | - | A tonal select's longest option text ("Longest first"); an outlined select ignores it. Where the browser draws the closed select as its chosen option (appearance: base-select) it is as wide as that option, so it grows and shrinks as a person picks. With a reserve it is as wide as these words in every state (DS-9). |
| `className?` | `string` | - | For placing the select where it stands (a width, a margin). Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop. |

Every attribute of a native `<select>` element passes through.

## Tokens it reads

`--button-radius` `--chip-height` `--color-accent` `--color-accent-container` `--color-accent-container-hover` `--color-border-hairline` `--color-focus-ring` `--color-on-accent-container` `--color-on-surface` `--color-on-surface-muted` `--color-surface-container` `--color-surface-container-hover` `--color-surface-container-pressed` `--color-surface-overlay` `--color-surface-overlay-hover` `--color-surface-overlay-pressed` `--shadow-popover` `--shape-2xl` `--size-icon` `--size-icon-sm` `--size-touch`

## Where it is drawn

- Classes: `.select-outlined` `.select-tonal` (a page draws the component, never types these)
- Styled in: `styles/select.css`
- Files: `src/Select.tsx`, `src/select.ts`, `src/selectSheet.ts`, `src/wheel.ts`

## Owner's note

The box and its text are the Field's (field.css, select.field-input); the wrapper holds the chevron a select draws for itself, in the muted ink, never taking a press.
