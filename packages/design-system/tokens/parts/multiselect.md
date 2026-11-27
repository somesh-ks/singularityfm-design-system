---
version: "0.19.0"
id: multiselect
name: "Multi-select"
kind: field
imports: []
---

# Multi-select (`multiselect`)

A field-like trigger that opens a list of checkable choices.

## Use when

- choose several from a long list
- pick sources or topics in a field

## Not when

- a few choices that fit on screen: use [`filter-chip`](filter-chip.md)

## Rules

- Not yet exported or styled by this package (see GAPS.md). Use Chip and ChipGroup (filter-chip) for 2 to 6 short options, or ask the owner before building a custom multi-select.

## Where it is drawn

- Classes: `.multiselect-trigger` (not yet exported or styled by this package; see GAPS.md before using)
- Styled in: no stylesheet in this package yet
