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

- Role: Decorative <img alt="" aria-hidden="true"> or <span aria-hidden="true">
- ARIA: Always aria-hidden="true"; keep the country or language name in adjacent visible text or parent aria-label.
- Keyboard: None; decorative region mark.
- Focus: Not focusable.

## Props of Flag

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `region?` | `string` | - | An ISO 3166-1 code: the flag alone, at the 16 by 12 of a row of controls. |
| `text?` | `string` | `""` | Text that may hold flag emoji: its flags drawn at the size of the words. |
