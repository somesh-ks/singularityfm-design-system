---
"@singularityfm/design-system": major
---

BREAKING: Button, IconButton and Fab are built on Base UI's Button (DS-4) and still take no client directive (DS-7): each renders a native `<button>`, which presses, submits and stays disabled before any script, so a page that draws them ships no script for them. Their props, classes, `buttonClass()`, `iconButtonClass()` and `FAB_SELECTOR` are unchanged, and with an `href` each is the same plain `<a>` (a link is never a Base UI primitive). No call changes. What a page, a stylesheet or a script may notice:

- Markup. Before: `<button class="button-filled" type="button">`. After: `<button type="button" tabindex="0" class="button-filled">`, Base UI's own `tabindex="0"` (Safari then reaches it by Tab and focuses it on a click), and a disabled one also carries `data-disabled`. A `tabIndex` you pass still wins.
- Scripts. Before and after, a script turns a button on and off with `button.disabled`; `data-disabled` is the server's (or, in a React island, React's) and a script that sets `disabled` leaves it as it was, so select `:disabled`, never `[data-disabled]`, on an Astro page.
- React islands. A disabled one calls none of its `onClick`, `onMouseDown` or `onPointerDown`, and one drawn inside a Base UI composite (Toolbar, Menu, a radio or tab group) joins its roving focus and presses on Space as an item of it.
