---
"@singularityfm/design-system": minor
---

SegmentedChoice, Select and Slider log one console warning in development when drawn with no accessible name. Name a SegmentedChoice with `aria-label` or `aria-labelledby`; a Select with `label`, `aria-label`, `aria-labelledby` or an `id` an outside `<label for>` names; a Slider the same less `label`. Production builds stay silent.
