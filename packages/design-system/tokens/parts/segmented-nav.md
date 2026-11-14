# Segmented navigation (`segmented-nav`)

A tonal track with one sliding pill: switch between views of the same content.

## Import

- `@singularityfm/design-system/SegmentedNav`

## Markup

```astro
<SegmentedNav aria-label="View" tabs={[{ value: "stories", label: "Stories" }, { value: "transcript", label: "Transcript" }]} />
```

## Use when

- Switch the view of one page or panel without leaving it: a topic's Sources and Preferences

## Not when

- Choosing the value of a setting: use [`segmented-choice`](segmented-choice.md)
- jumping to sections of a long page: use [`tabs`](tabs.md)

## Rules

- A native tablist with no client directive (DS-8): the page calls mountSegmentedNav(list, onSelect) from design-system/segmentedNav once for each, and draws the panels (each tab's controls).

## Props of SegmentedNav

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `tabs` | `readonly SegmentedNavTab[]` | - | Two to four views. |
| `compact?` | `boolean` | `false` | A chip's height on 44px columns, to sit in a row of chips. |
| `defaultValue?` | `string` | `tabs[0]?.value` | The view chosen when it is drawn (the first by default); mountSegmentedNav() moves it after. |
| `className?` | `string` | - | For placing it where it stands, or a hook a page's rule or script finds it by. Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop. |

Every attribute of a native `<div>` element passes through, except `role` and `children`.

## Tokens it reads

`--chip-height` `--color-accent-container` `--color-accent-container-pressed` `--color-focus-ring` `--color-on-accent-container` `--color-on-surface` `--color-on-surface-muted` `--color-surface-container` `--segmented-height` `--segmented-padding` `--size-touch`

## Where it is drawn

- Classes: `.segmented-nav` `.segmented-nav-tab` `.segmented-nav-compact` (a page draws the component, never types these)
- Styled in: `styles/primitives.css`
- Files: `src/SegmentedNav.tsx`, `src/segmentedNav.ts`

## Owner's note

Navigation, used like tabs (2026-10-20): a tonal track with no outline and no check, and one pill in the accent container that slides under the active label, by transform alone. The design is flat, so the pill is told apart by colour, not by a shadow (2026-10-21); the choice control is told apart by its outline and check. The active label takes the pill's text colour, the others stay muted. Buttons in a tablist: segmentedNav.ts moves aria-selected and the roving tabindex, and answers Left, Right, Home and End.
