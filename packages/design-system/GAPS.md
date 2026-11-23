# Known Package Gaps and Unshipped Parts

Some parts indexed in `tokens/system.json` are lookup placeholders or class helpers without standalone exported React components or package stylesheets yet. Do not invent imports, props, or unstyled markup for them. Check `pnpm exec ds version` first to confirm which package version is installed.

## Empty state (`empty-state`)

- **Status:** Planned (`DS-14`), not yet exported or styled by `@singularityfm/design-system`.
- **Do not do:** Do not import or invent `<EmptyState>`, and do not hand-write unstyled `.empty` or `.empty-actions` markup. `styles/shell.css` only references `.empty` as a layout hook and provides no visual empty-state styling or `.empty-actions` rules.
- **Instead:** Use `<Banner>` (`@singularityfm/design-system/Banner`) when an inline notice fits above existing content, or stop and ask the owner before creating custom empty-state markup or styles.

## Drawer (`drawer`)

- **Status:** `<SheetFrame>` is a host-app React wrapper and is not exported by this package.
- **What is exported:** `@singularityfm/design-system/Sheet` and `@singularityfm/design-system/SheetHeader` for native modal `<dialog>` sheets, plus `@singularityfm/design-system/drawer` (`drawerScrimClass`, `drawerViewportClass`, `drawerPopupClass`, `drawerPanelClass`) and `@singularityfm/design-system/styles/drawer.css` when composing a host Base UI Drawer island.

## Multi-select (`multiselect`)

- **Status:** Not yet exported or styled by this package (`multiselect-trigger` has no component or package stylesheet yet).
- **Instead:** Use `<ChipGroup>` and `<Chip>` (`filter-chip`) when choosing from 2 to 6 short options, or ask the owner before building a custom multi-select.

## Cover (`cover`)

- **Status:** Not yet exported or styled by this package (`cover` has no component or package stylesheet yet).
- **Instead:** Generated cover artwork lives in the consumer app; ask the owner before adding cover styling.
