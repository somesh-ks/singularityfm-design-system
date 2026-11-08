# State

Rewritten, never appended. As of 2026-11-08 (DS-4, the golden file).

## Works

- The repository was made from `somesh-ks/singularityfm-app` by `extract.sh` (DS-1): the library's history back to 2026-10-06, the package in `packages/design-system/`, the style guide in `apps/design/`.
- `pnpm run gate` runs green from a clean clone: typecheck, lint, unit tests, the docs check, the token and guide build, the pack-and-install test. CI runs the same in one job, `check`. The pack-and-install test starts pnpm through the program `pnpm run` was started from, so it no longer needs a `pnpm` executable on the PATH (Windows has only `pnpm.cmd`).
- Releases are automatic: `release.yml` (guarded to this repository) opens the version pull request with the library's GitHub App token, so `check` runs on it, and merging it publishes. 0.1.1 and 0.2.0 are on npm. Provenance waits for the repository to go public: npm refuses it from a private one (E422).
- The style guide's Components section is an accordion in the nav and an index of cards, grouped by function (Actions, Inputs, Navigation, Overlays, Feedback, Display); each component has its own page with a live preview and controls (Select and Switch), the code for the current state, its use and do-not-use lines and its props table read from its source (DS-2). The pages draw every state on the server and a 1.7 kB script shows the one the controls name; `components.test.ts` fails a library component with no page. Wheel, Drawer, Glow and ChapterAside have no preview (their page says why). `npm run system` builds `tokens/system.json` and `tokens/llms.txt` from the library alone; `system.test.ts` fails when either is stale, and walks `scripts/system/golden.json` (44 needs an agent asked, each with the part that must come first or the token `ds find` must show; a new case is a row).
- The library's one component framework is React with Base UI (DS-3; DS-4 puts Base UI under every control with state, Button and Field included). The Button is `src/Button.tsx`, imported as `<pkg>/Button` (and, deprecated, `<pkg>/Button.astro`); it renders on the server with no script, and the guide's pages and a page of every Button case match the Astro Button pixel for pixel (390 and 1280, light and dark). `designSystem.test.ts` fails a new `.astro` file in `src` and a `.tsx` component with no exports entry; the pack-and-install test builds an Astro page with React and fails on a shipped script.
- The app draws the published package only: it pins 0.1.1 (app #769), draws the React Button with `className`, and its monorepo copy is deleted (app #771).
- Dark surfaces keep their order and a step of at least one just-noticeable difference (0.02 in OKLab) between each elevation (`buildTokens.test.ts`).

## Unverified

- The style guide's Vercel project builds from this repository. closed when: a push to main deploys news.someshks.work/design from this repository and `ignore-build.sh` skips a docs-only push.
- The ruleset (`.github/rulesets/main.json`) is imported. closed when: a PR without a green `check` cannot merge.
- The pack-and-install test runs on Windows. closed when: `pnpm run gate` passes in PowerShell on the owner's machine.
- Six parts read empty in `system.json` (settings row, toast, empty state, multiselect, cover, fab): their base rules live in the app's stylesheets, not the library's, so the library has no comment to read. closed when: each one's CSS moves into the library with its component (Fab, D237), or the app writes its usage report (DS-2) and the part moves there.
- "The primary fill" does not reach `--color-accent` in `ds find`: its role never says "primary". closed when: the accent's role names the primary fill and `golden.json` has a row for it.

## Next

The order is the design system master plan's (owner, 2026-11-08); the non-breaking work ships first, as minors.

1. App #772 renames the workspace alias to `@singularityfm/*` (D382 step 9, the owner's merge); the app then takes 0.2.0 by a bump PR.
2. The static families, one pull request each, each trimming `ASTRO_LEFT` and proving pixel identity as the Button did: Icon, BrandMark, Flag (first: Banner, Code, Select and the guide draw Icon); Badge; Banner; ChapterAside, RowExit, Ripple, SectionTabs (markup only; their scripts stay). With them, the record-named parts that need no Base UI yet: Link (D237), and IconButton and Fab as native buttons.
3. A rules module in the package (raw colour, the 8pt grid with its named exceptions, unknown custom properties, `class=` on a component, retired paths) that the app's design-check, `ds validate` and later the MCP call, with Biome plugins for the pattern rules.
4. A release of those minors, then the app's bump.
5. The `1.0.0-next` pre-release line (DS-4): Button, IconButton and Fab on Base UI with `@base-ui/react` a required peer; Field, Switch, Slider; Avatar; Dialog; Sheet (Sheet and Drawer stay two components, D262); Menu; Select; Code; the Base UI parts Chip, the segmented controls and Search field. Then 1.0.0, keeping the `.astro` aliases until COMPATIBILITY.md's window has passed.
6. After 1.0.0: a remote MCP on the style guide's project (a DS record first, amending D236), local evals through the editors' headless modes, and one agent plugin for Claude Code, Codex and Antigravity.
