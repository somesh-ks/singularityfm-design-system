---
version: "0.15.0"
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
<ResumeCard title="The Jensen Huang Affair" facts="Hard Fork" remaining="12 min left" progress={0.6} playLabel="Play" dismissLabel="Remove from Continue listening"><img src="cover.webp" alt="" /></ResumeCard>
```

## Accessibility

- Role: `<article>` with two native `<button>`s: the card's press area (Resume) and Dismiss
- ARIA: playLabel names the press area and dismissLabel the Dismiss IconButton; the progress bar is aria-hidden and remaining says the time left in words.
- Keyboard: Tab reaches Resume then Dismiss; Enter or Space activates each.
- Focus: Both show the native :focus-visible ring; the press area's follows the card's corners.

## Props of ResumeCard

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `title` | `string` | - | The episode's title. Two lines at most. |
| `facts` | `string` | - | The show's name, one line under the title; a long one is cut short ("Hard Fork"). |
| `remaining?` | `string` | - | The time left, after the show and never cut short ("12 min left"). |
| `children` | `ReactNode` | - | The cover, a small square. |
| `playLabel` | `string` | - | The card's name for a screen reader, what a press does: "Resume The Jensen Huang Affair". |
| `dismissLabel` | `string` | - | Dismiss's name: "Remove from Continue listening". |
| `progress` | `number` | - | How much is heard, 0 to 1. |
| `playing?` | `boolean` | `false` | Draws the pause glyph: this episode is playing. The page's player sets data-playing. |
| `className?` | `string` | - | For placing the card, or a hook a page's script finds it by. Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop. |

Every attribute of a native `<article>` element passes through.
