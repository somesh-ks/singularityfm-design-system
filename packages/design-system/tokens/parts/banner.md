# Banner (`banner`)

A tinted block with an icon, a title, an optional line and at most one text button.

## Import

- `@singularityfm/design-system/Banner`

## Markup

```astro
<Banner tone="danger" icon="alert" title="Download failed" />
```

## Use when

- A state a person must know about stays on screen: offline, a failed run, a playback error

## Not when

- A banner in the page would be moved around by a page change (a cover between pages): use [`banner`](banner.md)
- a message that clears itself: use [`toast`](toast.md)
- a page with nothing to list: use [`empty-state`](empty-state.md)

## Rules

- Only the icon takes the tone.
- An island draws one with bannerClass() and bannerText.

## Props of Banner

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `tone` | `"warning" \| "danger" \| "success"` | - | - |
| `variant?` | `"block" \| "strip"` | - | "strip" is a band across the width for a state of the device; the place that holds it makes room for it. |
| `icon` | `IconName` | - | - |
| `iconFrom?` | `IconName` | - | A strip only: the glyph the icon is drawn over and strikes through (Wi-Fi, then Offline). |
| `title` | `string` | - | - |
| `body?` | `string` | - | - |
| `bodyId?` | `string` | - | An id for the body line (the title when there is none), so a control the banner explains can point at it (aria-describedby). |
| `action?` | `{ label: string; href: string }` | - | One way on, as a text button. A link, so it works for any reader and without script. |

## Tokens it reads

`--banner-padding` `--banner-radius` `--banner-strip-danger` `--banner-strip-success` `--banner-strip-warning` `--color-danger` `--color-danger-subtle` `--color-success` `--color-success-subtle` `--color-warning` `--color-warning-subtle` `--size-icon`

## Where it is drawn

- Classes: `.banner-notice` `.banner-text` `.banner-title` `.banner-body` (a page draws the component, never types these)
- Styled in: `styles/banner.css`
- Files: `src/Banner.tsx`, `src/banner.ts`

## Owner's note

Banners, and the pages with nothing to list. A banner is flat: a tinted ground, an icon in the tone's colour, a title, a line of text and at most one text button. The tone sets the tint.
