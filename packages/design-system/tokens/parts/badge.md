# Badge (`badge`)

A grey label holding one word or one number beside a name.

## Import

- `@singularityfm/design-system/Badge`

## Markup

```astro
<Badge>Admin</Badge>
```

## Use when

- A short label names what the thing beside it is: Admin beside the wordmark
- A count of what a section holds

## Not when

- The state is good, worth a look or wrong: use [`banner`](banner.md)
- The pill can be pressed or ticked: use [`filter-chip`](filter-chip.md)
- the pill can be pressed or ticked: use [`filter-chip`](filter-chip.md)

## Rules

- It holds one word or one number; the page places it with a class, never styles it.

## Props of Badge

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `className?` | `string` | `""` | For placing the badge where it stands (a margin, a grid area). Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop before the component sees it. |
| `children?` | `ReactNode` | - | The one word or one number it holds. |

## Tokens it reads

`--color-on-surface-muted` `--color-surface-container`

## Where it is drawn

- Classes: `.badge-label` (a page draws the component, never types these)
- Styled in: `styles/badge.css`
- Files: `src/Badge.tsx`, `src/badge.ts`

## Owner's note

The Badge (design-system/Badge.tsx): a grey pill that holds one word or one number. One size, one fill. It is as wide as its words and no narrower than it is high, so a single digit stays round. Grey, so the blue stays with the controls (owner, 2026-10-30).
