# State

Rewritten, never appended. As of 2026-11-07 (DS-3).

## Works

- The repository was made from `somesh-ks/singularityfm-app` by `extract.sh` (DS-1): the library's history back to 2026-10-06, the package in `packages/design-system/`, the style guide in `apps/design/`.
- `pnpm run gate` runs green from a clean clone: typecheck, lint, unit tests, the docs check, the token and guide build, the pack-and-install test. CI runs the same in one job, `check`.
- `release.yml` is guarded to this repository; with nothing pending it publishes nothing.
- The style guide's Components page lists every registry component with its use and do-not-use lines (DS-2). `npm run system` builds `tokens/system.json` and `tokens/llms.txt` from the library alone; `system.test.ts` fails when either is stale.
- The library's one component framework is React with Base UI (DS-3). The Button is `src/Button.tsx`, imported as `<pkg>/Button` (and, deprecated, `<pkg>/Button.astro`); it renders on the server with no script, and the guide's pages and a page of every Button case match the Astro Button pixel for pixel (390 and 1280, light and dark). `designSystem.test.ts` fails a new `.astro` file in `src` and a `.tsx` component with no exports entry; the pack-and-install test builds an Astro page with React and fails on a shipped script.

## Unverified

- The first publish of `0.1.0` (the pending `.changeset/first-release.md`). closed when: `npm view @singularityfm/design-system@0.1.0 dist.attestations` shows a provenance statement naming this repository and `release.yml`.
- The version PR starts checks. A PR opened with `GITHUB_TOKEN` starts none, so the required `check` never reports. closed when: `release.yml` opens it with the library's GitHub App token and `check` runs on it.
- The style guide's Vercel project builds from this repository. closed when: a push to main deploys news.someshks.work/design from this repository and `ignore-build.sh` skips a docs-only push.
- The ruleset (`.github/rulesets/main.json`) is imported. closed when: a PR without a green `check` cannot merge.
- The app still builds its own `system.json` with app inputs through its monorepo copy (`scripts/system.ts`), which the 0.1.0 package no longer accepts (DS-2). closed when: the app's pin of the package (D382 step 7) replaces that call with the app's own usage report.

- The app draws the React Button. closed when: the app pins a release with DS-3, adds `@astrojs/react` where it lacks it, passes `className` in its seven `<Button class=...>` uses, and its screenshots match.

## Next

1. The owner: npm trusted publisher, ruleset, Vercel project, GitHub App (see DS-1's step list in the plan).
2. Publish `0.1.0`, with the React Button in it (DS#2 merged first), then the app pins it (D382 step 7) and moves its 7 `<Button class=...>` to `className`, writes its usage report (DS-2), and its monorepo copy is frozen and later deleted (step 8).
3. Parts whose usage came from the reader's CSS (settings row, toast, empty state, multiselect, cover) read empty in `system.json`: give each its comment in the library's stylesheet, or move it to the app's report.
4. Rename the workspace alias `@singularity/design-system` and `@singularity/design` to `@singularityfm/*` with the app's step 9.
5. The rest of DS-3, one family per pull request, each trimming `ASTRO_LEFT` in `designSystem.test.ts` and proving pixel identity as the Button did. Static first (plain React, no script), since the others draw them:
   1. Glyphs: Icon, BrandMark, Flag (Icon is drawn by Banner, Code, Select and the guide; first).
   2. Labels: Badge, Avatar.
   3. Banner (draws Button and Icon).
   4. Page parts: SectionTabs, ChapterAside, RowExit, Ripple (markup only; their scripts, ripple.ts and the row exit, stay as they are).
   5. Form fields: Field, Switch, Slider (native inputs; Field's textarea takes its value as `defaultValue`, its `style` string becomes an object).
   With behaviour (Base UI, hydrated with `client:visible` or `client:idle`; each needs the owner's look at whether the primitive's markup can keep the classes, or is a small deviation):
   6. Dialog, DialogTitle, DialogActions: Base UI Dialog (today a native `<dialog>` the app's scripts open).
   7. Sheet, SheetHeader: Base UI Dialog, or the Drawer the islands already use (pull to dismiss is `pullDismiss.ts`).
   8. Menu, MenuItem: Base UI Menu (today a popover with the app's key and focus script).
   9. Select: Base UI Select (today `selectSheet.ts`, loaded by Select.astro).
   10. Code: its copy button hydrates (`wireCodeCopy` today).
   Then the `.astro` export paths go in one breaking release, and the `astro` peer with them.
