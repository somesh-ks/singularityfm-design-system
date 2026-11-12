# Switch (`switch`)

A track and a thumb for one setting that is on or off.

## Import

- `@singularityfm/design-system/Switch`

## Markup

```astro
<div class="settings-row"><label class="settings-label" for="autoplay">Autoplay</label><Switch id="autoplay" name="autoplay" /></div>
```

## Use when

- A setting is on or off and applies as soon as it is flipped: Sounds, Autoplay, a podcast's Enabled
- It sits at the end of a settings row, with the row's label as its name
- One switch stands for a group of switches (a master): the script sets `indeterminate` on it, and unchecks it, while only some of the group are on. The track sits halfway between the off grey and the accent and the thumb halfway along it. Pressing it turns the whole group on, or off when all are on

## Not when

- The choice is one of several values, or needs a Save to apply: use [`filter-chip`](filter-chip.md)
- The control starts an action (Catch up, Delete) and has no state of its own: use [`button-text`](button-text.md)
- Several options may be ticked together in a list: use [`filter-chip`](filter-chip.md)

## Rules

- It is the native checkbox (role="switch") and takes no client directive (DS-8): an Astro page starts it with defaultChecked, a React island passes checked with onChange.

## Props of Switch

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `className?` | `string` | - | For placing the switch where it stands (a margin, a grid area). Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop before the component sees it. |
| `style?` | `CSSProperties \| string` | - | Inline style, as an object or the string an Astro page writes; never its look. |

Every attribute of a native `input` passes through.

## Tokens it reads

`--color-accent` `--color-accent-hover` `--color-accent-pressed` `--color-border-control` `--color-on-accent` `--size-touch` `--switch-height` `--switch-padding` `--switch-radius` `--switch-thumb` `--switch-thumb-bg` `--switch-thumb-radius` `--switch-track-hover` `--switch-track-mixed` `--switch-width`

## Where it is drawn

- Classes: `.switch-input` (a page draws the component, never types these)
- Styled in: `styles/switch.css`
- Files: `src/Switch.tsx`, `src/switch.ts`

## Owner's note

One setting that is on or off, a checkbox with role="switch" drawn as a track; its ::before is the thumb.
