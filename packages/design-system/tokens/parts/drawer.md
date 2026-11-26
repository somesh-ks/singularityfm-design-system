---
version: "0.14.0"
id: drawer
name: "Drawer"
kind: container
imports: []
---

# Drawer (`drawer`)

The island modal for a form: the whole screen on a phone, a panel at the right from 40rem, with Close in the header.

## Use when

- A React island opens a form over the page, as Regenerate does

## Not when

- The sheet is drawn by Astro or a script: use [`sheet`](sheet.md)
- One question and its answers: use [`dialog`](dialog.md)

## Rules

- SheetFrame is not exported by this package: use <Sheet> for modal dialogs/sheets, or compose a host Base UI Drawer island with drawerScrimClass(), drawerViewportClass(), drawerPopupClass() and drawerPanelClass() from @singularityfm/design-system/drawer plus @singularityfm/design-system/styles/drawer.css and <SheetHeader>.
- Motion uses --duration-sheet-in, --duration-sheet-out and --ease-drawer.

## Accessibility

- Role: Host Base UI drawer/dialog island contract (not exported as a React component yet)
- ARIA: Host island provides dialog role, aria-labelledby on SheetHeader titleId and aria-label on the Close IconButton.
- Keyboard: Escape dismisses the drawer and closes the modal viewport.
- Focus: Base UI primitive traps focus while open and returns focus to trigger on close.

## Tokens it reads

`--color-on-surface` `--color-scrim` `--color-surface` `--color-surface-hover` `--color-surface-pressed` `--shape-sheet` `--sheet-bg` `--sheet-bg-hover` `--sheet-bg-pressed` `--sheet-shadow` `--sheet-tile-bg` `--sheet-tile-bg-hover` `--sheet-tile-bg-pressed`

## Where it is drawn

- Classes: `.drawer-scrim` `.drawer-viewport` `.drawer-popup` `.drawer-panel` (class helpers exported in files; no standalone component wrapper yet (see rules and GAPS.md))
- Styled in: `styles/buttons.css`, `styles/drawer.css`, `styles/foundations.css`
- Files: `src/drawer.ts`

## Owner's note

The Drawer's surface: a scrim over the page that fades as the sheet is swiped away, a viewport, and the popup that rests on the screen's edge.
