# State

Rewritten, never appended. As of 2026-11-07 (DS-2).

## Works

- The repository was made from `somesh-ks/singularityfm-app` by `extract.sh` (DS-1): the library's history back to 2026-10-06, the package in `packages/design-system/`, the style guide in `apps/design/`.
- `pnpm run gate` runs green from a clean clone: typecheck, lint, unit tests, the docs check, the token and guide build, the pack-and-install test. CI runs the same in one job, `check`.
- `release.yml` is guarded to this repository; with nothing pending it publishes nothing.
- The style guide's Components page lists every registry component with its use and do-not-use lines (DS-2). `npm run system` builds `tokens/system.json` and `tokens/llms.txt` from the library alone; `system.test.ts` fails when either is stale.

## Unverified

- The first publish of `0.1.0` (the pending `.changeset/first-release.md`). closed when: `npm view @singularityfm/design-system@0.1.0 dist.attestations` shows a provenance statement naming this repository and `release.yml`.
- The version PR starts checks. A PR opened with `GITHUB_TOKEN` starts none, so the required `check` never reports. closed when: `release.yml` opens it with the library's GitHub App token and `check` runs on it.
- The style guide's Vercel project builds from this repository. closed when: a push to main deploys news.someshks.work/design from this repository and `ignore-build.sh` skips a docs-only push.
- The ruleset (`.github/rulesets/main.json`) is imported. closed when: a PR without a green `check` cannot merge.
- The app still builds its own `system.json` with app inputs through its monorepo copy (`scripts/system.ts`), which the 0.1.0 package no longer accepts (DS-2). closed when: the app's pin of the package (D382 step 7) replaces that call with the app's own usage report.

## Next

1. The owner: npm trusted publisher, ruleset, Vercel project, GitHub App (see DS-1's step list in the plan).
2. Publish `0.1.0`, then the app pins it (D382 step 7), writes its usage report (DS-2), and its monorepo copy is frozen and later deleted (step 8).
3. Parts whose usage came from the reader's CSS (settings row, toast, empty state, multiselect, cover) read empty in `system.json`: give each its comment in the library's stylesheet, or move it to the app's report.
4. Rename the workspace alias `@singularity/design-system` and `@singularity/design` to `@singularityfm/*` with the app's step 9.
