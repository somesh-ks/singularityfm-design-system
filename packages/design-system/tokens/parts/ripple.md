# Ripple (`ripple`)

A wave from the touch point that fills a control's touch area, then fades.

## Import

- `@singularityfm/design-system/Ripple`

## Markup

```astro
<a href="/library" data-ripple><Ripple />Library</a>
```

## Use when

- A large touch target on a phone must show where it was pressed: a bottom bar tab

## Not when

- A small control needs a press state: use [`icon-btn`](icon-btn.md)

## Rules

- The control is `position: relative` with its own stacking context (isolation: isolate); the layer sits beneath its icon and label.
- To reach past the control's box set --ripple-reach-start, --ripple-reach-end or --ripple-reach-bottom on the control; --ripple-display: none turns the layer off where the control has a pointer state.
- installRipple() (design-system/ripple.ts) is called once by the app script; the control sets nothing else.

## Props of Ripple

No props of its own.

## Tokens it reads

`--color-on-surface`

## Where it is drawn

- Classes: `.ripple-area` `.ripple-wave` (a page draws the component, never types these)
- Styled in: `styles/ripple.css`
- Files: `src/Ripple.tsx`, `src/ripple.ts`
