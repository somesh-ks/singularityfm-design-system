# Segmented choice (`segmented-choice`)

One pill of radio items: pick exactly one value.

## Import

- `@singularityfm/design-system/SegmentedChoice`

## Markup

```astro
<SegmentedChoice name="length" aria-label="Length" defaultValue="3" options={[{ value: "3", label: "3 min" }, { value: "5", label: "5 min" }]} />
```

## Use when

- Choose one of two to four short values: Length, Format, Tone

## Not when

- Switching between views: use [`segmented-nav`](segmented-nav.md)
- Several may be ticked together: use [`filter-chip`](filter-chip.md)
- The values are more than four, or long: use [`select`](select.md)

## Rules

- Native radios with no client directive (DS-8).

## Props of SegmentedChoice

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `name` | `string` | - | The radios' name, which a form posts with the chosen value. |
| `options` | `readonly SegmentedChoiceOption[]` | - | Two to four segments; any other attribute of one (data-*, disabled) goes on its radio. |
| `defaultValue?` | `string` | - | The value chosen when it is first drawn; the radios then keep their own. An Astro page's. |
| `value?` | `string` | - | The chosen value, as the state of a React island: pair it with onValueChange. |
| `onValueChange?` | `(value: string) => void` | - | - |
| `className?` | `string` | - | For placing it where it stands, or a hook a page's rule finds it by. Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop. |
| `slot?` | `string` | - | Astro places it in its parent's slot with it; it is not an attribute of the fieldset. |

Every attribute of a native `<fieldset>` element passes through.

## Tokens it reads

`--chip-height` `--color-accent-container` `--color-accent-container-hover` `--color-accent-container-pressed` `--color-border-control` `--color-focus-ring` `--color-on-accent-container` `--color-on-surface` `--size-icon-sm` `--size-touch`

## Where it is drawn

- Classes: `.segmented-choice` `.segmented-choice-item` (a page draws the component, never types these)
- Styled in: `styles/primitives.css`
- Files: `src/SegmentedChoice.tsx`, `src/segmentedChoice.ts`

## Owner's note

Selection duty (2026-10-20), as Material 3's segmented button: one pill outlined with a hairline, hairline dividers between the segments, the chosen one filled with the accent container and a check before its words, the others transparent. Radios in a fieldset, so the arrow keys, the group and its name come from the browser. Told apart from .segmented-nav at a glance: an outline, not a track, and a check, not a raised pill.
