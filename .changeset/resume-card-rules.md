---
"@singularityfm/design-system": minor
---

ResumeCard is one press area (owner, 26 Nov: too many options, odd type, small targets). Looks different: the whole card resumes, with the play glyph on a larger cover; Dismiss is the one other control, in the top end corner; the title is regular weight and leads; the facts are one smaller line under it, and the progress bar sits last. New prop `remaining` takes the time left ("12 min left"), which is never cut short; pass the show's name alone in `facts`, which gives way on a narrow card. Play's hook `data-resume-play` moves from the tonal circle to the card's press area (`.resume-card-hit`); `.resume-card-acts` is retired.
