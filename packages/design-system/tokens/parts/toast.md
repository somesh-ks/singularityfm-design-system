# Toast (`toast`)

One quiet message at a time on the inverse surface, with an optional action.

## Import

- `@singularityfm/design-system/Toast`
- `@singularityfm/design-system/toastStore`

## Markup

```astro
showToast({ message: "Deleted", actionLabel: "Undo", onAction })
```

## Use when

- A brief message with Undo after a delete
- A failure, which stays until it is closed or retried, or a partial save
- A run that finished while its sheet was closed

## Not when

- A notice that must stay: use [`banner`](banner.md)
- A person must decide before going on: use [`dialog`](dialog.md)

## Rules

- Mount <Toast client:idle /> once per page; call showToast() from toastStore, or sendToast() from toastEvent in code that must not load the store.
- The page says where it sits with --toast-nav, --toast-dock, --toast-lift and --toast-inline-start/-end on the root, never with a rule on .toast.

## Props of Toast

No props of its own.

## Tokens it reads

`--color-accent-on-inverse` `--color-surface-inverse` `--color-surface-inverse-action-hover` `--color-surface-inverse-action-pressed` `--color-surface-inverse-hover` `--color-surface-inverse-pressed` `--layout-dialog` `--shape-md` `--shape-round` `--size-touch` `--toast-bg` `--toast-fg`

## Where it is drawn

- Classes: `.toast` `.toast-action` `.toast-dismiss` (a page draws the component, never types these)
- Styled in: `styles/buttons.css`, `styles/toast.css`
- Files: `src/Toast.tsx`, `src/toast.ts`, `src/toastStore.ts`, `src/toastEvent.ts`

## Owner's note

The Toast (Toast.tsx). One quiet message at a time: a flat, inverse surface with a hairline radius, an optional leading icon (a check or an alert, so the outcome is not told by colour alone), the message at the label size, at most one text action in the accent and a close button, shown only to a mouse (below). A top-layer popover above whatever is docked at the bottom. Where it sits is the page's to say, by custom properties set on the root (never on .toast, so the component's rules stay the only ones that draw it): --toast-nav the navigation bar at the bottom; else --bottom-nav-height, else the safe area --toast-dock a docked bar above the navigation (the reader's mini player); 0 by default --toast-lift more room under it (the reader's run line); 0 by default --toast-inline-start the start inset it centres from; else --side-nav-width, else 0 --toast-inline-end the end inset; 0 by default
