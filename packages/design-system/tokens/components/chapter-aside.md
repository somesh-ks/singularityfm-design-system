---
version: "0.16.0"
id: chapter-aside
name: "ChapterAside"
kind: component
imports:
  - "@singularityfm/design-system/ChapterAside"
---

# ChapterAside

Import `@singularityfm/design-system/ChapterAside`. No part covers it yet, so `ds find` does not name it.

## Import

- `@singularityfm/design-system/ChapterAside`

## Example

```tsx
<ChapterAside sections={[{ slug: "intro", title: "Overview" }, { slug: "notes", title: "Notes" }]} />
```

## Accessibility

- Role: Navigation landmark `<nav aria-labelledby="aside-title">` with `<h2>` and `<ul role="list">`
- ARIA: Marks active section anchor with aria-current="true".
- ARIA: Heading #aside-title labels the landmark.
- Keyboard: Tab navigates section links; Enter jumps to the section anchor.
- Focus: Native anchor focus ring.

## Props of ChapterAside

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `sections` | `readonly SectionRef[]` | - | - |
