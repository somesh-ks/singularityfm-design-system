---
version: "0.13.0"
id: flag
name: "Flag"
kind: component
imports:
  - "@singularityfm/design-system/Flag"
---

# Flag

Import `@singularityfm/design-system/Flag`. No part covers it yet, so `ds find` does not name it.

## Import

- `@singularityfm/design-system/Flag`

## Example

```tsx
<Flag region="SE" />
```

## Accessibility

- Role: Decorative `<img alt="" aria-hidden="true">` or `<span aria-hidden="true">`
- ARIA: Flag glyphs are always aria-hidden="true"; text passed with the text prop stays readable. A region flag alone carries no name: put the country or language in nearby text or the parent's aria-label.
- Keyboard: None; decorative region mark.
- Focus: Not focusable.

## Props of Flag

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `region?` | `string` | - | An ISO 3166-1 code: the flag alone, at the 16 by 12 of a row of controls. |
| `text?` | `string` | `""` | Text that may hold flag emoji: its flags drawn at the size of the words. |
