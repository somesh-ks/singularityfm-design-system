---
version: "0.13.0"
id: resume-card
name: "ResumeCard"
kind: component
imports:
  - "@singularityfm/design-system/ResumeCard"
---

# ResumeCard

Import `@singularityfm/design-system/ResumeCard`. No part covers it yet, so `ds find` does not name it.

## Import

- `@singularityfm/design-system/ResumeCard`

## Example

```tsx
<ResumeCard title="The Jensen Huang Affair" facts="Hard Fork, 12 min left" progress={0.6} playLabel="Play" dismissLabel="Remove from Continue listening"><img src="cover.webp" alt="" /></ResumeCard>
```

## Accessibility

- Role: `<article>` with Play and Dismiss native `<button>`s
- ARIA: playLabel and dismissLabel name the two IconButtons; the progress bar is aria-hidden and facts says the time left in words.
- Keyboard: Tab reaches Dismiss then Play; Enter or Space activates each.
- Focus: IconButtons show the native :focus-visible ring.

## Props of ResumeCard

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `title` | `string` | - | The episode's title. Two lines at most. |
| `facts` | `string` | - | One line under the bar: the show and the time left ("Hard Fork · 12 min left"). |
| `children` | `ReactNode` | - | The cover, a small square. |
| `playLabel` | `string` | - | Play's name for a screen reader: "Resume The Jensen Huang Affair". |
| `dismissLabel` | `string` | - | Dismiss's name: "Remove from Continue listening". |
| `progress` | `number` | - | How much is heard, 0 to 1. |
| `playing?` | `boolean` | `false` | Draws the pause glyph: this episode is playing. The page's player sets data-playing. |
| `className?` | `string` | - | For placing the card, or a hook a page's script finds it by. Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop. |

Every attribute of a native `<article>` element passes through.
