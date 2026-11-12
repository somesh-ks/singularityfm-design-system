# Drawer (`drawer`)

The island modal for a form: the whole screen on a phone, a panel at the right from 40rem, with Close in the header.

## Markup

```astro
<SheetFrame open={open} onOpenChange={setOpen} title="Create" closeLabel="Close">...</SheetFrame>
```

## Use when

- A React island opens a form over the page, as Regenerate does

## Not when

- The sheet is drawn by Astro or a script: use [`sheet`](sheet.md)
- One question and its answers: use [`dialog`](dialog.md)

## Rules

- Mount SheetFrame; it draws the scrim, viewport, popup and panel from drawer.ts, and the Sheet's head.
- Motion uses --duration-sheet-in, --duration-sheet-out and --ease-drawer.

## Tokens it reads

`--color-on-surface` `--color-scrim` `--color-surface` `--color-surface-hover` `--color-surface-pressed` `--shape-sheet` `--sheet-bg` `--sheet-bg-hover` `--sheet-bg-pressed` `--sheet-shadow` `--sheet-tile-bg` `--sheet-tile-bg-hover` `--sheet-tile-bg-pressed`

## Where it is drawn

- Classes: `.drawer-scrim` `.drawer-viewport` `.drawer-popup` `.drawer-panel` (a page draws the component, never types these)
- Styled in: `styles/buttons.css`, `styles/drawer.css`, `styles/foundations.css`
- Files: `src/drawer.ts`

## Owner's note

The Drawer's surface: a scrim over the page that fades as the sheet is swiped away, a viewport, and the popup that rests on the screen's edge.
