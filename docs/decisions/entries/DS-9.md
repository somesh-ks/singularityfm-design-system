## DS-9: a control's box never depends on its state; the words it may say and the glyphs it may show are reserved, and a browser test measures it

- Status: active
- Date: 2026-11-09
- Decision: the owner's call (Play button in a podcast's header, filter chips, "there shouldn't be any jerks"). In every component, what changes with state (a glyph appears or swaps, a check shows, a spinner runs, words change) never changes the component's width or height, nor where its neighbours or its own words stand.
  - A glyph slot is a fixed box; the state picks which glyph shows in it (the Play chip's glyph slot, the filter chip's check, which takes no room of its own).
  - Words that may change are reserved: the component is as wide as the widest words it can say (`reserve` on PlayChip, Button, Fab and the tonal Select, drawn hidden in the same grid cell) and its live words add nothing to the width; words longer than the reserve are cut with an ellipsis, never grown into. A neighbour is never moved by a label.
  - A busy spinner stands in the button's start padding, hidden until `aria-busy` or `data-busy`, so the words do not move.
  - `layoutStability.test.ts` renders each component in a browser, in every mood and both themes, flips each of its states and fails on any change of its box, or of the place of its next sibling. A state that must change the box (the Fab folding while the page scrolls, a Badge that grows with its number) is listed there with its reason, which is how it is allowed.
- Why: a width that follows a label made the header's heart and share buttons jump each time Play said "Preparing audio" or "13 min left"; the filter chip did it as its check appeared. Fixing one place at a time left the next. A control that holds still is a rule of the component, and only a measurement catches the next one.
- Rejected: padding the widest label into one fixed width for every chip (a wide idle "3 min" for no reason on a story's chip: the reserve is per place); animating the width (the neighbours still move); a lint over CSS only (it cannot see a label's width).
- Revisit if: the browser step costs more than the pack-and-install step in CI, or a component needs a width that changes as its state does (then it joins the test's list of exceptions with the reason).
