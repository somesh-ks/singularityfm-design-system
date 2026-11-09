# @singularityfm/design-system

## 0.3.0

### Minor Changes

- 377650c: New export `@singularityfm/design-system/rules`: `validate(text, file)` and one function per rule (raw colour, spacing off the 8pt grid with the library's `GRID_EXCEPTIONS` plus any you pass to `offGrid`, unknown custom properties, a component's class typed by a page, retired import paths in `RETIRED_PATHS`, where the `Button`, `Icon`, `BrandMark` and `Flag` `.astro` paths warn), and `ds validate <files or globs>`; add `"extends": ["@singularityfm/design-system/rules/biome-config.json"]` to your biome.json to lint raw colour in CSS with the shipped GritQL plugin. `tokens/system.json` gains `properties`, the custom properties the stylesheets declare beside the tokens.
- 1727f43: Link, IconButton and Fab are React components (D237): import them as `@singularityfm/design-system/Link`, `/IconButton` and `/Fab`. Each draws the markup and classes the app types by hand today (`text-link` and `source-link`; `icon-btn`, `icon-btn-tonal`, `icon-btn-end` with `.press`; `create-fab` and its word), so a page can switch with no visual change, except that an icon button typed without `.press` gains its hover and press fade. IconButton and Fab require `label`, their accessible name. `iconButtonClass()` gives an island or a script the icon button's classes, and `FAB_SELECTOR` finds the FAB. The FAB's rules move into the library as `styles/fab.css` (Fab imports it): the app's copy in `create-sheet.css` can go once its FABs draw `<Fab>`; the Play face (`.play-fab`) stays in the app. The registry now lists these classes, so the app's `systemUse.test.ts` fails a page that still types them, from the bump that takes this release. Nothing existing changes its look.
- 7ac2c90: Badge is a React component (DS-3): import it as `@singularityfm/design-system/Badge`, place it with `className` and give it its word or number as children. `Badge.astro` is deprecated but works as before, `class` and slot included, until a breaking release removes it, and `ds validate` warns on it. Markup and look are unchanged; it renders on the server and ships no script.
- f4e8ab3: Banner is a React component (DS-3): import it as `@singularityfm/design-system/Banner`; its props are unchanged. `Banner.astro` is deprecated but works as before until a breaking release removes it, and `ds validate` warns on it. Its look is unchanged, and so are its elements and attributes; the whitespace between its tags is gone, which no rule or script reads. It renders on the server and ships no script.
- 90d8415: Icon, BrandMark and Flag are React components (DS-3): import them as `@singularityfm/design-system/Icon`, `/BrandMark` and `/Flag`, and place an Icon or a BrandMark with `className`. `Icon.astro`, `BrandMark.astro` and `Flag.astro` are deprecated but work as before, `class` included, until a breaking release removes them. Markup and look are unchanged, except that a Flag's `<img>` now closes as `<img ... />`; each renders on the server and ships no script.
- 9258280: ChapterAside, RowExit, Ripple and SectionTabs are React components (DS-3): import them as `@singularityfm/design-system/ChapterAside` (and `/RowExit`, `/Ripple`, `/SectionTabs`) and give RowExit `className` and its row as children. Their `.astro` paths are deprecated but work as before, RowExit's `class`, attributes (a `style` string too) and slot included, until a breaking release removes them, and `ds validate` warns on them. Look is unchanged and they ship no script; `ripple.ts`, `rowExit.ts` and `section.ts` are untouched, so call `installRipple()` as before.
- 8313eab: `ds validate --exceptions <file.json> <files or globs>` reads your own exceptions, each with its reason: `grid`, your 4px cases as `[selector, reason]` pairs (what `offGrid` takes), and `exempt`, findings you mean, as `{ "file", "rule", "text", "reason" }` (one rule in one file, on a line that holds `text`); an exemption that matches no finding fails, so a stale one cannot linger. `validate(text, file, { gridExceptions, declared })` takes the 4px list and the other files' declared properties.

### Patch Changes

- c75b293: `ds find` answers more needs first time: "action" no longer outweighs the words that name a part, a wheel finds Select, a long press finds Menu, a switch row finds the settings row, "error" finds the danger tokens, and the scrim and the sheet's slide-in duration now show in `ds find` (each has a role).
- aaca611: Every relative import in the package names its file (`./banner.ts`), so a bundler that resolves `.tsx` first or reads the disk without case (esbuild, a Windows or macOS disk) no longer picks the component `Banner.tsx` for its module `banner.ts`. That pick made the component import itself, and a consumer's bundle failed with "No matching export" for `bannerClass`, `buttonClass` and `iconClass`. Nothing changes for a build that already worked.
- 8313eab: `ds validate` over several files counts a custom property any of them declares as declared, so a stylesheet that reads what a page's `style` attribute sets (`--swatch`) is no longer reported as unknown; from the rules, pass `unknownProperty(text, file, declared)` the `declaredProperties(text, file)` of the other files.

## 0.2.0

### Minor Changes

- 7bb8213: Button: a tonal button on a dialog, sheet or drawer takes the sheet tile tone, so its fill shows in dark mode. What looks different: in dark mode a tonal button on those surfaces is one step lighter than before; in light mode it is unchanged.

## 0.1.1

### Patch Changes

- 8ff8f43: Dialog: stacked answers hug their labels and line up at the end, as a row of answers already did.

## 0.1.0

### Minor Changes

- 0608083: First release: the components, stylesheets, tokens, fonts and flags the Singularity reader is drawn with.
- d61abb2: The Button is a React component (DS-3). Nothing was published before it, so it ships in the first release, 0.1.0; against the copy the app drew from its own workspace it is breaking: An Astro app adds `react`, `react-dom` (^19.3) and `@astrojs/react` to its integrations, and places a Button with `className` instead of `class` (`@astrojs/react` drops `class`): before `<Button variant="text" class="queue-listen">`, after `<Button variant="text" className="queue-listen">`. Import it as `@singularityfm/design-system/Button`; `Button.astro` still resolves, to the same component, and is deprecated. Markup and look are unchanged; a static Button renders on the server and ships no script.
