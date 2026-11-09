---
"@singularityfm/design-system": minor
---

Link, IconButton and Fab are React components (D237): import them as `@singularityfm/design-system/Link`, `/IconButton` and `/Fab`. Each draws the markup and classes the app types by hand today (`text-link` and `source-link`; `icon-btn`, `icon-btn-tonal`, `icon-btn-end` with `.press`; `create-fab` and its word), so a page can switch with no visual change. IconButton and Fab require `label`, their accessible name. `iconButtonClass()` gives an island or a script the icon button's classes, and `FAB_SELECTOR` finds the FAB. The FAB's rules move into the library as `styles/fab.css` (Fab imports it): the app's copy in `create-sheet.css` can go once its FABs draw `<Fab>`; the Play face (`.play-fab`) stays in the app. The registry now lists these classes, so the app's `systemUse.test.ts` fails a page that still types them, from the bump that takes this release. Nothing existing changes its look.
