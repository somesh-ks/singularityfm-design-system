# Slider (`slider`)

A track with a thumb: a value between two ends, set by dragging or by the arrow keys.

## Import

- `@singularityfm/design-system/Slider`

## Markup

```astro
<Slider aria-label="Volume" min={0} max={1} step={0.05} defaultValue={0.7} style="--range-fill: 70%" />
```

## Use when

- The value is on a scale where nearby values are alike: Volume, Playback speed, a topic's weight

## Not when

- There are two to five named options and none is between the others: use [`filter-chip`](filter-chip.md)
- Only on and off are possible: use [`switch`](switch.md)

## Rules

- It is the native range and takes no client directive (DS-8): an Astro page starts it with defaultValue, a React island passes value with onChange.
- WebKit paints the filled track from --range-fill, which starts at 0%: set it to (value - min) / (max - min) as a percentage and update it on input.

## Props of Slider

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `hue?` | `boolean` | `false` | A hue: the rail is the whole spectrum, the thumb is the colour picked, and a swatch floats above it while it is held (D328). The caller keeps --range-fill on the field the slider is wrapped in. |
| `wavy?` | `boolean` | `false` | The track up to the thumb drifts (a wave in Expressive, a zigzag in Halloween) and the rest stays straight; Default draws the plain Slider. The caller keeps --range-fill on the field the input is wrapped in. |
| `className?` | `string` | - | For placing the slider where it stands (a width, a flex basis). Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop before the component sees it. |
| `style?` | `CSSProperties \| string` | - | Inline style, as an object or the string an Astro page writes; never its look. |

Every attribute of a native `<input>` element passes through, except `type`.

## Tokens it reads

`--button-radius` `--color-accent` `--color-accent-hover` `--color-accent-pressed` `--color-border-control` `--color-surface` `--scrubber-thumb` `--scrubber-thumb-active-scale` `--scrubber-thumb-ring` `--scrubber-track` `--size-touch`

## Where it is drawn

- Classes: `.slider-input` (a page draws the component, never types these)
- Styled in: `styles/slider.css`
- Files: `src/Slider.tsx`, `src/slider.ts`

## Owner's note

A value between two ends, set by dragging a thumb or with the arrow keys. A native range. WebKit has no pseudo-element for the filled part of the track, so the track paints it as a gradient up to --range-fill, which the script keeps at (value - min) / (max - min) as a percentage. Firefox has ::-moz-range-progress and ignores the gradient. The two engines' pseudo-elements cannot share a rule: a selector one engine does not know drops the whole rule in the other.
