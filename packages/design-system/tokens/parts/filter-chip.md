# Chip (`filter-chip`)

A checkbox drawn as a pill; ticked it takes the accent container.

## Import

- `@singularityfm/design-system/Chip`
- `@singularityfm/design-system/ChipGroup`

## Markup

```astro
<ChipGroup aria-label="Show"><Chip name="show" value="daily" defaultChecked>Daily</Chip></ChipGroup>
```

## Use when

- Tick several topics or categories to include
- Filter a list by one or more kinds: the Library's Show chips

## Not when

- Exactly one of a few values: use [`segmented-choice`](segmented-choice.md)
- The control switches the view of the same content: use [`segmented-nav`](segmented-nav.md)
- The choices are many, or long: they go in a list: use [`select`](select.md)
- The pill plays a briefing or a story: use [`play-chip`](play-chip.md)
- a long list of options: use [`multiselect`](multiselect.md)

## Rules

- A native checkbox with no client directive (DS-8); scroll on the group for one sideways row.

## Props of Chip

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `children` | `ReactNode` | - | The words on the chip: the choice's name. |
| `className?` | `string` | - | For placing the chip where it stands, or a hook a page's rule finds it by. Never its look. It goes on the chip (the label); every other attribute goes on its checkbox. An Astro page passes className too: @astrojs/react drops a `class` prop. |
| `slot?` | `string` | - | Astro places the chip in its parent's slot with it; it is not an attribute of the checkbox. |

Every attribute of a native `<input>` element passes through.

## Props of ChipGroup

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `children` | `ReactNode` | - | The Chips. |
| `scroll?` | `boolean` | `false` | One row that scrolls sideways when the chips do not fit, as the Library's Show chips do. |
| `className?` | `string` | - | For placing the group where it stands (a card-group, a scroll fade), or a hook a page's rule or script finds it by. An Astro page passes className too: @astrojs/react drops a `class` prop. |
| `slot?` | `string` | - | Astro places the group in its parent's slot with it; it is not an attribute of the fieldset. |

Every attribute of a native `<fieldset>` element passes through.

## Tokens it reads

`--chip-height` `--chip-radius` `--chip-radius-selected` `--color-accent-container` `--color-accent-container-hover` `--color-accent-container-pressed` `--color-focus-ring` `--color-on-accent-container` `--color-on-surface` `--color-surface-container` `--color-surface-container-hover` `--color-surface-container-pressed` `--size-icon-sm` `--size-touch`

## Where it is drawn

- Classes: `.filter-chip` `.filter-chips` `.filter-chips-scroll` (a page draws the component, never types these)
- Styled in: `styles/primitives.css`
- Files: `src/Chip.tsx`, `src/ChipGroup.tsx`, `src/chip.ts`

## Owner's note

The filter chip: a checkbox drawn as a pill that takes the accent container when checked, its check taking no room (D95), in a row that scrolls sideways (the Library's Show filters).
