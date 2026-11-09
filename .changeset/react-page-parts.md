---
"@singularityfm/design-system": minor
---

ChapterAside, RowExit, Ripple and SectionTabs are React components (DS-3): import them as `@singularityfm/design-system/ChapterAside` (and `/RowExit`, `/Ripple`, `/SectionTabs`) and give RowExit `className` and its row as children. Their `.astro` paths are deprecated but work as before, RowExit's `class`, attributes (a `style` string too) and slot included, until a breaking release removes them, and `ds validate` warns on them. Look is unchanged and they ship no script; `ripple.ts`, `rowExit.ts` and `section.ts` are untouched, so call `installRipple()` as before.
