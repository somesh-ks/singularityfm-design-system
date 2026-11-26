---
"@singularityfm/design-system": minor
---

Dial and ResumeCard export DIAL_SELECTORS and RESUME_CARD_SELECTORS, so a page's script that fills tiles or cards cloned from a template finds their parts without typing the classes.

The app navigation takes `data-nav-bar-only` on a destination's link: the bottom bar shows it and the side column from 64rem leaves it out.

Band: a card group of rows inside it lies on the band's tint and reaches its edges, instead of drawing a second card inside the band.
