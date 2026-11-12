# Empty state (`empty-state`)

A spot illustration, a title, one line and at most two actions, for a page with nothing in it.

## Markup

```astro
<EmptyState art="library" title="Nothing saved yet" body="..." primary={{ label: "Go to Latest", href: "/" }} />
```

## Use when

- a page or section with nothing to list yet
- no results, offline, not found

## Not when

- a list that has items: use [`card-group`](card-group.md)
- a notice above content that exists: use [`banner`](banner.md)

## Rules

- Never hand-write `.empty` markup.

## Where it is drawn

- Classes: `.empty` `.empty-actions` (drawn by the app's own component the markup names; this package does not ship it yet)
- Styled in: no stylesheet in this package yet
