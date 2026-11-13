---
"@singularityfm/design-system": patch
---

Every props table (system.json, the part pages, llms-full.txt and `ds` answers) lists a component's props in one reading order: what it says, how it looks, wiring, value, then placement, and names the native attributes a component does not pass on (DialogTitle drops `className`, Switch `type` and `role`; system.json's `except`). No prop changed.
