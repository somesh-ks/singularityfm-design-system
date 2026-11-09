---
"@singularityfm/design-system": minor
---

A control's box no longer depends on its state (DS-9). PlayChip takes `reserve` (the widest words it can say; "Play again" by default) and is as wide as those words in every state, cutting longer words with an ellipsis; Button and a tonal Select take `reserve` too; a `.spinner` child of a filled or tonal Button stands in its start padding while `aria-busy` or `data-busy` is set, so the words stay put. A story's Play chip is about 10px wider (it fits "Play again"). A chip drawn without `data-reserve` keeps its old sizing.
