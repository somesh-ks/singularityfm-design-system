---
"@singularityfm/design-system": minor
---

ResumeCard is one press area and nothing else (owner, 26 Nov: too many options, odd type, small targets; no Dismiss). Looks different: the whole card resumes, with the play glyph on a larger cover; there is no Dismiss and no Play circle; the title is regular weight and leads; the facts are one smaller line under it, and the progress bar sits last. A shelf of them clears itself as episodes finish. `dismissLabel` is optional and deprecated: passed, it still draws a Dismiss at the top end; 1.0.0 removes it. New optional prop `remaining` takes the time left ("12 min left"), never cut short; with it, pass the show's name alone in `facts`. The page's hook `data-resume-play` is now on the card's press area (`.resume-card-hit`). `.resume-card-acts` is deprecated: the card no longer draws it, and 1.0.0 removes it.
