---
version: "0.18.0"
id: empty-state
name: "Empty state"
kind: feedback
imports: []
---

# Empty state (`empty-state`)

A spot illustration, a title, one line and at most two actions, for a page with nothing in it.

## Use when

- a page or section with nothing to list yet
- no results, offline, not found

## Not when

- a list that has items: use [`card-group`](card-group.md)
- a notice above content that exists: use [`banner`](banner.md)

## Rules

- EmptyState is planned (DS-14) and not yet exported or styled by this package.
- Do not invent an EmptyState component or hand-write unstyled .empty or .empty-actions markup; shell.css uses .empty only as a layout hook and provides no visual styling. Use Banner for inline notices or ask the owner (see GAPS.md).

## Where it is drawn

- Classes: `.empty` `.empty-actions` (not yet exported or styled by this package; see GAPS.md before using)
- Styled in: no stylesheet in this package yet
