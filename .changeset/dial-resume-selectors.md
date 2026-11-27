---
"@singularityfm/design-system": minor
---

`@singularityfm/design-system/dial` exports DIAL_SELECTORS and `@singularityfm/design-system/resumeCard` exports RESUME_CARD_SELECTORS, so a page's script that fills tiles or cards cloned from a template finds their parts without typing the classes.

The app navigation takes `data-nav-bar-only` on a destination's link: the bottom bar shows it and the side column from 64rem leaves it out.

Band: a card group of rows inside it lies on the band's tint and reaches its edges, instead of drawing a second card inside the band.

Fixes from a design review of the app's Home and Settings: the wide Dial's tiles sit 8px apart, so a pin and a "New" count no longer overlap; a ResumeCard stretched by a taller neighbour keeps its cover and words centred; a Band that ends on a group of rows no longer adds its padding under the last row.
