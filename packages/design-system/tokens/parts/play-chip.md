# Play chip (`play-chip`)

The tonal pill that plays a briefing or one story, with its state.

## Import

- `@singularityfm/design-system/PlayChip`

## Markup

```astro
<PlayChip label="5 min" aria-label="Play the briefing" data-play-item={0} />
```

## Use when

- Play an episode or a story and show idle, current, played, error or preparing

## Not when

- A person ticks a choice: use [`filter-chip`](filter-chip.md)
- The page's one main Play floats over it on a phone: use [`fab`](fab.md)
- The action is not playing something: use [`button-tonal`](button-tonal.md)

## Rules

- A native button with no client directive (DS-8): the player writes data-state, data-playing and [data-chip-label].

## Experimental options

- `primary` (since 2026-11-12): The page's one main Play (the hero's) takes the primary fill, idle and current, and shows the pause glyph while it plays, not the bars (owner, 2026-11-04: "all should have the same color synchronized"; D77). Only the fill and the glyph: its size and padding are the chip's.

## Props of PlayChip

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `string` | - | The visible words: a length such as "1:24", or a state such as "Playing". |
| `state?` | `"idle" \| "current" \| "played" \| "preparing" \| "error" \| "unavailable"` | `"idle"` | Where the item stands; the player rewrites it (buttons.css documents each). |
| `reserve?` | `string` | `"Play again"` | The widest words the chip will ever show ("Processing"). The chip is as wide as these in every state, so nothing beside it moves when its words change; words longer than them are cut with an ellipsis. The default, "Play again", is the widest the library itself draws and covers a time, Loading, Playing, Paused and Try again. |
| `primary?` | `boolean` | `false` | The page's one main Play: the primary fill, and the pause glyph while it plays instead of the bars. Experimental (DS-11): it may change or go in a minor release (playChip.ts says why it exists). |
| `className?` | `string` | - | For placing the chip where it stands, or a hook a page's rule finds it by. Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop. |
| `slot?` | `string` | - | Astro places the chip in its parent's slot with it; it is not an attribute of the button. |

Every attribute of a native `button` passes through.

## Tokens it reads

`--chip-bg` `--chip-bg-current` `--chip-bg-current-hover` `--chip-bg-current-pressed` `--chip-bg-hover` `--chip-bg-pressed` `--chip-fg` `--chip-fg-current` `--chip-gap` `--chip-glyph` `--chip-height` `--chip-icon` `--chip-padding-end` `--chip-padding-start` `--chip-radius` `--color-accent-pressed` `--color-on-surface-disabled` `--color-on-surface-muted` `--color-success` `--color-surface-sunken` `--size-touch`

## Where it is drawn

- Classes: `.chip` `.chip-glyph` `.chip-label` (a page draws the component, never types these)
- Styled in: `styles/buttons.css`
- Files: `src/PlayChip.tsx`, `src/playChip.ts`

## Owner's note

The tonal pill that plays a briefing or one story: a play mark and a short label on the container fill, with no outline.
