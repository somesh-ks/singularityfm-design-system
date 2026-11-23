# Using @singularityfm/design-system

For an agent that builds UI with this package. (Working on the package itself: the repository's root AGENTS.md.)
Add one line to your app's own AGENTS.md so this file is read:

```markdown
Before writing UI, read node_modules/@singularityfm/design-system/AGENTS.md and follow it.
```

## Read the foundations and check the installed version first

1. Check what is actually installed in this project: run `pnpm exec ds version` (or check `node_modules/@singularityfm/design-system/package.json` and `tokens/system.json`). Never assume an older or newer version's exports from memory.
2. Read `tokens/foundations.md`: it holds the rules for every screen (the grid, text and colour roles, what never moves, the words, the phone).
3. Read `GAPS.md` before touching unshipped or partial parts (`empty-state`, `drawer`, `multiselect`, `cover`). Never invent `<EmptyState>`, `<SheetFrame>`, or unstyled `.empty` / `.empty-actions` markup.

## Find the part before you write anything

1. Ask the lookup: `ds find "<what you need>"`. It names the part, what to import, the markup, when not to use it and the tokens it reads. `ds part <id>` shows one part with the props of each component it imports (`ds part Avatar` takes a component's name too), `ds token <words>` a token, and `ds icons [query]` searches exported `<Icon name="..." />` glyphs. `ds` is the package's own command: `pnpm exec ds` (`npx ds` with npm). Add `--json` for data, and ask several at once with `ds batch "find <need>" "part <id>" "icons arrow"`.
2. No lookup? Read `tokens/llms.txt` (one page: every part, the colour roles, the scales), then the part's or component's page it links (`tokens/parts/<id>.md`, `tokens/components/<Component>.md`: import, example, props, accessibility, tokens). `tokens/llms-full.txt` is every page in one file; `tokens/system.json` holds the data. Without the package, the style guide serves the same files under news.someshks.com/design/ (and every guide page has a `.md` sibling route, e.g. `/design/components.md`).
3. Nothing fits: stop and ask the owner. Do not invent a class, and do not restyle a part from a page.

## Rules

- Never invent a prop, component or icon name: use only `ds part <id>` (or `tokens/parts/<id>.md` / `tokens/components/<Component>.md`) and `ds icons [query]` for exact exported APIs and prop unions.
- A control is a component named for what it is. Import it by name (`@singularityfm/design-system/Button`) and draw it. Never type its class (`button-filled`, `filter-chip`, `search-field`) on your own markup.
- In an Astro page pass `className`, not `class`: `@astrojs/react` drops `class`.
- Colour, spacing, type, corners, shadow and motion come from tokens (`var(--color-surface)`, `var(--space-4)`, `var(--shape-md)`). No hex, no `oklch()` literal, no pixel length. Spacing keeps the 8pt grid.
- Text roles are the `--text-*` tokens and the `.text-*` classes. Icons are `Icon`; flags are `Flag`, never an emoji.
- A control hugs its words; only its glyph slot is fixed, so a mark that swaps moves nothing (DS-13). Never reserve or measure a width (`reserve` is deprecated).
- Leave a rule or markup that carries a rationale comment alone.
- An option the lookup marks experimental (DS-11: `Field` `tonal`, `Menu` `flush`, ...) may change or go in a minor release: use it only where its reason fits, and prefer a stable option.
- `@singularityfm/design-system/<Name>.astro` paths are retired: import `<Name>`.

## Setup the package expects

- It ships source, not compiled output: your build compiles it. `tsconfig.json` needs `"allowImportingTsExtensions": true` with `"noEmit": true`.
- Peers and types: `react`, `react-dom`, and dev type packages `@types/react` and `@types/react-dom` for TSX checks; `astro` and `@astrojs/react` in an Astro app; `@base-ui/react` for `Field` and `Avatar` / drawer islands.
- Import the sheets you draw (`styles/tokens.css` first, then each part's own, as `ds part` lists) and `scripts/themeInit.js` in the head.

## Check your work

`ds validate <files or globs>` runs the package's rules: raw colour, off-grid spacing, an unknown custom property, a component class typed by a page, a retired import, a raw pixel length. It exits 1 on an error. `ds version` names the package and the build of `system.json` that answered. A biome user extends `@singularityfm/design-system/rules/biome-config.json` for the raw-colour rule.
