# Foundations

Read this before any UI drawn with this package; then find each part with `ds find`. Every rule holds on every screen, in every mood (`data-mood`) and in light and dark. The owner's reasons, with dates: https://github.com/somesh-ks/singularityfm-design-system/blob/main/docs/ledger/taste.md

## Space and size

- Spacing keeps the 8pt grid: `--space-2` and up. The half step, `--space-1`, only where a part already uses it.
- No pixel lengths: a token, rem, em, ch or a calc() of them. The 1px hairline is `--stroke-hairline`.
- Every control's target is at least `--size-touch`, a field's `--size-touch-comfortable`; a mood may enlarge them.
- A box never changes with its state. A width that must hold comes from the content (`reserve` on `Button`, `Fab`, `PlayChip`), never a measured number. A check takes no room. Any layout shift is a bug.

## Type

- Text is a role, from its `--text-<role>-*` tokens or its `.text-<role>` class (body is the page's default and has none): display a page's title, lead a hero, title a story's headline, heading a section (regular weight, never bold), label a control's words, body running text, reading a story, meta the facts under a title, caption a count.
- Hierarchy comes from size and space, never from crowding: a secondary line sits below its title, a full spacing step away, never above it.
- Banned: all-caps labels, monospace eyebrows, italic accent words, bold labels, a meta line above a headline.

## Colour

- Colour is a role (`--color-*`), never a hex, an `oklch()` literal or a primitive. Colour is information, not decoration.
- One filled action per screen, on `--cta-bg`: Button `filled`, or the `Fab` below 64rem. Everything beside it is tonal or text.
- The accent marks what is chosen or current (`--color-accent-container`); everything at rest is neutral. Only the cover art decorates.
- Red (`--color-danger`) is a failure, or the confirm of a delete inside the dialog that asks.
- Hover and press step the control's own fill (`--color-<fill>-hover`, `-pressed`); never a grey overlay, and a press never shrinks words.
- Banned: gradient washes, grey shadows, cream backgrounds, terracotta, boxes around everything.

## Controls and words

- Use the plainest control people already know. Glyphs come from `Icon` (Phosphor: the regular weight, fill where a glyph must read solid, bold for plus and More); never draw or paste an SVG.
- A control shows what it does by how it looks and answers. No instruction text the control makes obvious. A glyph names what a press does.
- A control that cannot act stays in place, dimmed and named; it is never hidden.
- The interface speaks only when the person can act: no saving chatter, no waiting copy. A status is three or four words; a failure is told once, with a plain cause and a short code.
- Plain American English, few words, one noun for one thing. No emoji (a flag is `Flag`), no em dashes.

## Motion

- Nothing moves that the person did not move. A page never opens with motion.
- A wait the person can feel is a bug: show the result first, confirm after.
- Durations and easing are `--duration-*` and `--ease-*`; reduced motion follows the OS.

## On a phone (under 40rem)

- A list opens as a bottom sheet, never a popover (`Sheet`, `Menu` and `Select` do it).
- Identity leads a row (an icon, a flag, an avatar); a mark trails it (a check, a chevron).
- A row's actions live in a menu at its end, never a row of icon buttons. The one primary action floats bottom-end (`Fab`).
- One control, one shape, at every width: a control that looks different in one place is a bug.
- A text input is 16px so iOS never zooms; `Field` and `SearchField` hold it.

## When nothing fits

Stop and ask the owner. Never invent a class, restyle a part from a page, or deviate silently.
