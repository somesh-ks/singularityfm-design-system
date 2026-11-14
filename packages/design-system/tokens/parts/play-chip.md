# Play chip (`play-chip`)

The tonal pill that plays a briefing or one story, with its state; or its glyph alone.

## Import

- `@singularityfm/design-system/PlayChip`

## Markup

```astro
<PlayChip label="5 min" aria-label="Play the briefing" data-play-item={0} />
```

## Use when

- Play an episode or a story and show idle, current, played, error or preparing
- The glyph alone (no label): a story's Play and the hero's, a round button that never changes size

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
| `label?` | `string` | - | The visible words: a length such as "1:24", or a state such as "Playing". Leave it out for the glyph alone, a round button that never changes size, whose name is its aria-label (then required, and the page's player rewrites it with each state): a story's Play and the hero's (owner, 2026-11-13: "the play button in the hero should be just the icon button"). |
| `primary?` | `boolean` | `false` | The page's one main Play: the primary fill, and the pause glyph while it plays instead of the bars. Experimental (DS-11): it may change or go in a minor release (playChip.ts says why it exists). |
| `state?` | `"idle" \| "current" \| "played" \| "preparing" \| "error" \| "unavailable"` | `"idle"` | Where the item stands; the player rewrites it (buttons.css documents each). |
| `reserve?` | `string` | - | The widest words the chip will ever show ("Processing"). The chip is as wide as these in every state; words longer than them are cut with an ellipsis. @deprecated Buttons hug their words (owner, 2026-11-13: "in general buttons should hug text"; DS-13). Drop it: the words set the width. It still works until 1.0.0 removes it. |
| `className?` | `string` | - | For placing the chip where it stands, or a hook a page's rule finds it by. Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop. |
| `slot?` | `string` | - | Astro places the chip in its parent's slot with it; it is not an attribute of the button. |

Every attribute of a native `<button>` element passes through, except `aria-label`.

## Tokens it reads

`--chip-bg` `--chip-bg-current` `--chip-bg-current-hover` `--chip-bg-current-pressed` `--chip-bg-hover` `--chip-bg-pressed` `--chip-fg` `--chip-fg-current` `--chip-gap` `--chip-glyph` `--chip-height` `--chip-icon` `--chip-padding-end` `--chip-padding-start` `--chip-radius` `--color-accent-pressed` `--color-on-surface-disabled` `--color-on-surface-muted` `--color-success` `--color-surface-sunken` `--size-touch`

## Where it is drawn

- Classes: `.chip` `.chip-glyph` `.chip-label` (a page draws the component, never types these)
- Styled in: `styles/buttons.css`
- Files: `src/PlayChip.tsx`, `src/playChip.ts`

## Owner's note

The tonal pill that plays a briefing or one story: a play mark and a short label on the container fill, with no outline; or the mark alone, a circle (.chip-glyph-only, DS-13). PlayChip.tsx draws it: <button class="chip" data-state="idle" data-playing="false"> <span class="chip-glyph"> play and pause icons, .chip-bars, check, replay and refresh, .spinner </span> <span class="chip-text"><span class="chip-label" data-chip-label>1:24</span></span> </button> data-state: idle (plays from here), current (this is what is loaded), played, preparing (audio is being made), unavailable. data-playing says whether the loaded audio is running. The glyph slot holds every mark; the state picks which one shows, so script only ever writes two attributes and the label.
