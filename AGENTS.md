# Singularity design system

`@singularityfm/design-system`: the Astro components, stylesheets, tokens, fonts and flags the Singularity reader is drawn with, published to npm, and the style guide that shows them. The reader lives in [somesh-ks/singularityfm-app](https://github.com/somesh-ks/singularityfm-app) and installs this package at an exact version. History came from there by git filter-repo (DS-1).

## Read first

1. [docs/state.md](docs/state.md): what works, what is unverified (each with `closed when:`), what is next. Rewritten, never appended.
2. [docs/decisions/](docs/decisions/README.md): DS records from DS-1, and [app-records.md](docs/decisions/app-records.md) for the app's D-records that still govern the library.
3. [COMPATIBILITY.md](packages/design-system/COMPATIBILITY.md) before any change to what the package ships.

On demand: [docs/specs/](docs/specs/) (style guide, motion), [docs/ledger/](docs/ledger/) (the owner's asks for components, tokens and type). The ledger core, the owner's taste, is in the app repo: [design-engineering-ledger.md](https://github.com/somesh-ks/singularityfm-app/blob/main/docs/design-engineering-ledger.md). Read it before UI work.

## Layout

| Path | What |
| --- | --- |
| `packages/design-system/` | The published package: `src/` components and behaviour, `styles/`, `tokens/`, `fonts/`, `flags/`, `scripts/` (token and system generators, the `ds` CLI) |
| `apps/design/` | The style guide (`@singularity/design`, private), its own Vercel project at news.someshks.work/design |
| `.changeset/` | Pending release notes |
| `scripts/` | Repository checks: the pack-and-install test, the docs check, the deploy batch rule |

## Commands

- `pnpm install --frozen-lockfile`, then `pnpm run gate`: typecheck (tsc and `astro check`), lint, unit tests, the docs check, the token and guide build, the pack-and-install test.
- `pnpm run ds find "<need>"`: before you write a class, token or value, find the part that already does it.
- `pnpm run tokens`: rebuild `styles/tokens.css` from `tokens/tokens.json`. `pnpm run dev`: the guide on port 4323.
- `pnpm exec changeset`: add the release note a PR needs.

## Rules

- No em dashes or en dashes anywhere (`pnpm run docs:check` fails on one). Persisted data is snake_case; docs and config files are lowercase kebab-case.
- Commits and PR titles are Conventional Commits.
- Never read, print or ask for key values. This repository needs none: npm publishing is trusted publishing (OIDC), no token.
- Review before merge, by tier (the app's [code-review.md](https://github.com/somesh-ks/singularityfm-app/blob/main/docs/engineering/code-review.md) is the procedure). Tier 0, `[skip-review]` and green CI: docs outside `docs/decisions/` and `docs/ledger/`, a few-line copy fix. Tier 2, `cr review --deep` first and CodeRabbit on the head before merge: `packages/design-system/` (components, tokens, `primitives.css`, `buttons.css`), `.github/`, `AGENTS.md`, `.coderabbit.yaml`, `scripts/`. Everything else is Tier 1, one CodeRabbit review. CodeRabbit reviews on open, then only on `@coderabbitai review`.
- TypeScript stays on 6.x. Changes to `.github/workflows` are merged by hand.
- Do not edit `CHANGELOG.md` by hand; the version PR writes it.
- End the reply with what you skipped or did not check.

## The design system

- A control is a component named for what it is (Button); an app draws it, never types its class (D237, D253). A UI fix starts at the component.
- Spacing keeps the 8pt grid (4px for named cases only). Use a token; a new token or control class needs the owner's OK first. If the system cannot express a request, stop, propose a small deviation and wait.
- Design fixes are load-bearing: a rule or markup with a rationale comment is never removed or rewritten for another task. Before changing `primitives.css`, `buttons.css` or the tokens, read `git log -L '/<selector>/,+20:<file>'` and the ledger.
- No flag emoji: Flag (D367).
- The style guide shows only what the package exports (D226).

## Releases

- A PR that changes what the package ships adds a changeset: patch, minor or major by [COMPATIBILITY.md](packages/design-system/COMPATIBILITY.md), one line a consumer can act on. A breaking one starts with `BREAKING:`.
- `release.yml` runs weekly and on demand: pending changesets open or update the version PR; merging it publishes with provenance. Nothing pending, nothing published.
- A PR labelled `canary` publishes `0.0.0-canary-<sha>` under the `canary` tag, so an app PR can try the fix first.
- The app's bump PR: the app thread merges green patch and minor bumps; the owner merges a breaking one.
- Scope: one PR per task. Before a PR, `git diff --stat origin/main` lists only the task's files.

## Tests

Few, one layer each, aimed at what fails silently ([the app's postmortem](https://github.com/somesh-ks/singularityfm-app/blob/main/docs/engineering/postmortem-test-suite.md)).

- A test names the bug it prevents: no sentence, no test. Extend or replace a test before adding one; delete tests of removed behaviour in the same commit.
- Never pin copy, CSS values, class names, markup, geometry or constants. Fake the clock, crypto and network; never sleep.
- The pack-and-install test (`scripts/designSystemPack.mjs`) is the consumer contract: a file missing from `files` or a broken export fails only there.

## Code

The smallest complete change: list every caller, test and config it must reach first; reuse what the repo has; no abstraction, option or "for later" code nobody asked for. A shortcut with a known limit gets `// shortcut: <the limit>, <when to upgrade>`. Never cut validation, accessibility or data-loss guards.
