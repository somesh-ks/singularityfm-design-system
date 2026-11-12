# Icon (`icon`)

A filled Phosphor glyph in the colour of the text beside it.

## Import

- `@singularityfm/design-system/Icon`

## Markup

```astro
<Icon name="plus" size="lg" />
```

## Use when

- A mark beside a label or alone in a button: a chevron, a plus, a check, Play

## Not when

- The glyph must act when pressed: use [`icon-btn`](icon-btn.md)
- the glyph must act when pressed: use [`icon-btn`](icon-btn.md)

## Rules

- Draw it with <Icon>; a script builds one with iconHtml() and an island with <Icon> from player/ui, both through iconClass().
- A control that holds a glyph and needs another size sets --icon-size on itself (experimental), never a rule on the glyph.
- A chevron in an icon button or a field with aria-haspopup turns as aria-expanded turns true; it needs no rule of its own.

## Experimental options

- `--icon-size` (since 2026-11-12): A control that holds a glyph sets its size once, on itself, so no page rule names the glyph: the transport's Play larger than everything around it and its skips (2026-10-22), the cover's bare Play on the scrim (owner, 2026-10-31), the Library's status mark sized from its text (owner, 2026-11-02 and 2026-11-03), and the queue ring's end check in the ring's own size (owner, 2026-11-12: keep it as it is).

## Props of Icon

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `name` | `IconName` | - | - |
| `size?` | `"md" \| "lg"` | `"md"` | The glyph's box: medium beside words, large when it is the whole button. |
| `className?` | `string` | `""` | A hook for the control that holds it (a rule that places the glyph, or swaps it). An Astro page passes className too: @astrojs/react drops a `class` prop before the component sees it. |

## Tokens it reads

`--color-favorite` `--color-on-surface-muted` `--icon-bold` `--size-icon` `--size-icon-lg`

## Where it is drawn

- Classes: `.icon-glyph` `.icon-glyph-lg` (a page draws the component, never types these)
- Styled in: `styles/icon.css`
- Files: `src/Icon.tsx`, `src/icon.ts`

## Owner's note

Phosphor: every glyph is one filled path, so an icon is just its colour and its size. --icon-size, experimental (DS-11, 2026-11-12): a control that holds a glyph sets its size once, on itself, so no page rule names the glyph (the transport's Play and skips, the cover's Play, the Library's status mark, the queue ring's end check: owner calls of 2026-10-22, 2026-10-31, 2026-11-02 and 2026-11-03, and 2026-11-12 for the ring). It inherits, so it is set on the control that holds the one glyph, never on a container of several controls. The registry lists it (icon.ts, ICON.experimental).
