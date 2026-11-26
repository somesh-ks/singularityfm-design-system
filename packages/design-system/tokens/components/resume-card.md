---
version: "0.16.0"
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
<ResumeCard title="The Jensen Huang Affair" facts="Hard Fork" remaining="12 min left" progress={0.6} playLabel="Resume The Jensen Huang Affair"><img src="cover.webp" alt="" /></ResumeCard>
```

## Accessibility

- Role: `<article>` holding one native `<button>`, the card's press area (Resume)
- ARIA: playLabel names the press area; the title, facts and remaining describe it (aria-describedby); the progress bar is aria-hidden.
- Keyboard: Tab reaches the card; Enter or Space resumes.
- Focus: The native :focus-visible ring, following the card's corners.

## Props of ResumeCard

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `title` | `string` | - | The episode's title. Two lines at most. |
| `facts` | `string` | - | The one line under the title, cut short when long: the show and the time left ("Hard Fork · 12 min left"), or, with `remaining`, the show's name alone ("Hard Fork"). |
| `remaining?` | `string` | - | The time left, after the facts and never cut short ("12 min left"). |
| `children` | `ReactNode` | - | The cover, a small square. |
| `playLabel` | `string` | - | The card's name for a screen reader, what a press does: "Resume The Jensen Huang Affair". |
| `dismissLabel?` | `string` | - | @deprecated The card draws no Dismiss (owner, 26 Nov: a shelf clears itself as episodes finish). Passing it still draws one until 1.0.0 removes it. |
| `progress` | `number` | - | How much is heard, 0 to 1. |
| `playing?` | `boolean` | `false` | Draws the pause glyph: this episode is playing. The page's player sets data-playing. |
| `className?` | `string` | - | For placing the card, or a hook a page's script finds it by. Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop. |

Every attribute of a native `<article>` element passes through.
