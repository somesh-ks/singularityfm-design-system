# @singularityfm/design-system

## 0.8.1

### Patch Changes

- f9729a6: Toast: the close button also shows on a tablet with a trackpad or mouse (any fine pointer, not only the primary one), and on a touch screen it reappears while it has keyboard focus.

## 0.8.0

### Minor Changes

- 07df10b: Select: an option with `data-wheel-text` now shows that text in the desktop list too (Chromium and Safari), while the closed field and screen readers keep the option's own text. Stories lists 45 and its field reads "Auto (45)".
- b5b628b: Toast: the close button now shows only with a mouse, on every toast, a short one included; on a touch screen it is hidden (a swipe closes the toast) and stays reachable by keyboard and screen reader. Errors and toasts with an action still stay until closed.

## 0.7.0

### Minor Changes

- d3ae77b: A control's box no longer depends on its state (DS-9). PlayChip takes `reserve` (the widest words it can say; "Play again" by default) and is as wide as those words in every state, cutting longer words with an ellipsis; Button, Fab and a tonal Select take `reserve` too (a script that swaps a Button's words writes `[data-button-label]`, and a Fab's words go in one child span, which a script may write); a `.spinner` child of a filled or tonal Button now shows only while `aria-busy="true"` or `data-busy="true"` is set (it was always drawn), and stands in the start padding so the words stay put; check any Button of yours that draws a spinner. A story's Play chip is about 10px wider (it fits "Play again"). A chip drawn without `data-reserve` keeps its old sizing. The words of a waiting PlayChip (`data-state="preparing"`) and of a Fab with `data-state="preparing"` now shimmer: a light band crosses the letters, which keep their colour at 70% and show full strength in the band (a mask; the `sheen` keyframes are in foundations.css), still under reduced motion and forced colours. A hero chip's `reserve` should name the widest of its words, "Processing". The shipped rules gain `raw-px` (`ds validate`, `rawPixels`, `PX_EXCEPTIONS`): a pixel length in a stylesheet is an error, except 0, the 1px hairline and a named exception (DS-10). A PlayChip waiting with no playback (`data-state="preparing"` without `data-playing="true"`, the Processing state) keeps its play mark and shows no spinner; buffering while it plays still shows the spinner.

## 0.6.0

### Minor Changes

- 22c013d: Toast: an error now stays until it is closed or swiped, and draws the close button, like a toast with an action; the close button now shows on phones too, also on a one-line toast; a short message still goes by itself with no close button.

### Patch Changes

- c504ef1: COMPATIBILITY.md: the app's bump pull request merges like any other once its checks are green, a breaking one included.

## 0.5.0

### Minor Changes

- c73eee7: PlayingBars is a component: import it as `@singularityfm/design-system/PlayingBars` to draw the three moving bars that show something playing (the Play chip's mark), on any play control, with `className` to place it, instead of typing `chip-bars`. The Play chip draws it; its markup is the same but for `aria-hidden="true"` on the bars, inside a glyph that was already hidden. `.chip-bars` now lays itself out (`display: flex`), so the bars show wherever they are drawn; in the chip they still show only while it plays.
- 8c159c2: Toast is a component (D237, D253): import `@singularityfm/design-system/Toast` and mount `<Toast client:idle />` once per page; `showToast`, `dismissToast`, `getToast` and `subscribeToast` come from `/toastStore`, and `sendToast` (with `TOAST_EVENT` and `TOAST_READY`) from `/toastEvent` for code that must not load the store. It is the reader's Toaster moved unchanged, popover, swipe, one-line mode, flags and all, with its rules in `styles/toast.css`. Where it sits is the page's to say with `--toast-nav`, `--toast-dock`, `--toast-lift`, `--toast-inline-start` and `--toast-inline-end` set on the root; with none set it sits above `--bottom-nav-height` or the safe area, centred past `--side-nav-width`, as before. Also new: `/swipe` (the swipe-away rule and velocity tracker the toast and the app's rows share) and `/pageLeaving` (`endedByLeaving()`, whether a request ended because the page was going away). The registry now lists `toast-icon`, `toast-text`, `toast-action` and `toast-dismiss`, so the app's `systemUse.test.ts` fails a page that types them, from the bump that takes this release.

### Patch Changes

- d4cb176: Toast keeps a visible edge in high-contrast (forced colors) mode.

## 0.4.0

### Minor Changes

- c7dbdd6: Avatar and Code are React components (DS-7, DS-8): import them as `@singularityfm/design-system/Avatar` and `/Code` and pass `className`; the Avatar is on Base UI's Avatar, so a page that draws it needs `@base-ui/react` installed (the optional peer the Field already uses). `Avatar.astro` and `Code.astro` are deprecated but work as before, `class` and every prop included, until a breaking release removes them, and `ds validate` warns on them. What looks or acts different:
  
  - Avatar, a shape: the same `<span class="avatar">` (a `<button>` with `label`) and SVG, on the server with no script. Draw it with no client directive, as before, so a script that redraws it in place (`avatarMarkup()`, `data-play`, `data-state`, `data-face`, `data-tone`) keeps working. `avatarArt(id, clip)` is new, the SVG's contents.
  - Avatar, a photo: drawn with `client:load` (or in a React island), the shape stands in once it hydrates when the photo fails to load, even a load that failed before. The `<img>` carries `aria-hidden="true"` (its `alt` was already empty) and React may write a `<link rel="preload">` for it. The shim draws no island, so its photo stays as before.
  - Code: draw `<Code client:load ...>` in an Astro page; a React island draws it as it is. The shim carries `client:load`. It renders whole on the server, keeps its `data-code`, `data-copied-word`, `data-code-copy`, `data-code-said` and `data-copied` hooks, and copies by its own press once hydrated (a press before that is lost unless the page runs `wireCodeCopy()`, which copies it; after, `wireCodeCopy()` leaves it alone). It sits in an `<astro-island>` (`display: contents`), so check a rule that reaches `.code-snippet` by a child combinator (`.x > .code-snippet`); a descendant selector still does.
  - Code's Copy button, and the one `codeSnippetHtml()` builds, gain `.press`: a hover and press fade like every Icon button. `copySnippetText()` and `COPIED_MS` are new exports of `code.ts`.
- 9696eb5: Chip, ChipGroup, PlayChip, SegmentedChoice, SegmentedNav and SearchField are React components (D237, D243): import them as `@singularityfm/design-system/Chip`, `/ChipGroup`, `/PlayChip`, `/SegmentedChoice`, `/SegmentedNav` and `/SearchField`. Each draws the markup and classes the app types by hand today, so a page can switch with no visual change. Chip, ChipGroup, SegmentedChoice and SearchField are native inputs, PlayChip a native button and SegmentedNav the app's `role="tablist"` of buttons, all React-rendered with no client directive (DS-8), and a page's script reads and sets them as it does now. Start them with `defaultChecked` or `defaultValue` in an Astro page, and control the inputs in a React island. SegmentedNav ships no script: its behaviour (a press, Left, Right, Home and End, `data-param`) moved unchanged from the app's `segmentedNav.ts` to `@singularityfm/design-system/segmentedNav`, so the page calls `mountSegmentedNav(list, onSelect)` once for each list, and `selectTab(list, value)` for a view read from the address, as it does now; only the import path changes. The page draws the panels and names each with a tab's `controls`. Chip and SearchField take `className` on the pill and every other attribute on the input; SearchField requires `label`, its input's name for a screen reader. The registry now lists `filter-chip`, `filter-chips`, `filter-chips-scroll`, the play chip's `chip` classes, `segmented-choice`, `segmented-choice-item`, `segmented-nav`, `segmented-nav-tab`, `segmented-nav-compact` and `search-field`, so the app's `systemUse.test.ts` fails a page that still types them, from the bump that takes this release. No existing class, rule or markup changes.
- 0f2d499: Field, Switch and Slider are React components (DS-8): import them as `@singularityfm/design-system/Field`, `/Switch` and `/Slider` and pass `className`. An Astro page starts them with `defaultValue` or `defaultChecked`; a React island passes `value` or `checked` with `onChange`. None takes a client directive, and none ships a script. The Switch and the Slider draw the same native checkbox (`role="switch"`) and range as before, and the Field draws the same input or textarea, now on Base UI's Field control, which adds an `id` when none is passed and `data-disabled` when disabled. The Field, by either path, imports `@base-ui/react` (^1.9.0, still an optional peer), so a consumer that draws a Field installs it. Deprecated: `Field.astro`, `Switch.astro` and `Slider.astro`, shims that keep `class`, every attribute and `value` or `checked`, and that `ds validate` warns on. Looks different: a wavy Slider in Default now draws the fill its caller keeps in `--range-fill` on the field; before, only the Expressive and Halloween waves read it.
- aa12547: Menu, MenuItem and Select are React components on native elements (DS-8): import them as `@singularityfm/design-system/Menu`, `/MenuItem` and `/Select` and pass `className`. They render whole on the server and take no client directive: the Menu is the same native popover its button opens with `popoverTarget` before any script (keys and focus stay the page's script, `:popover-open` and `toggle` hold), and the Select is the same native select with its drawn list. The Select ships no script of its own: a page that draws one calls `installSelectSheet()` from `@singularityfm/design-system/selectSheet` once, for the phone's bottom sheet and Wheel; until it does, a phone opens the browser's own list. Their `.astro` paths are deprecated shims that keep `class`, every attribute and their slot (the rows, the options), and `Select.astro` still installs the sheet; `ds validate` warns on them. The markup is the same but for two attribute forms a selector matching either still matches: the Menu's `popover="auto"` (was `popover`) and the Select wrapper's `data-select=""` (was `data-select="true"`).
- c577976: Dialog, DialogTitle, DialogActions, Sheet and SheetHeader are React components (DS-3). Import them as `@singularityfm/design-system/Dialog`, `/DialogTitle`, `/DialogActions`, `/Sheet` and `/SheetHeader` and pass `className`; what a page puts in the `after` slot becomes the `after` prop. Each still draws a native `<dialog>` closed, on the server, with no client directive and no script: a page's script finds it by `DIALOG_SELECTOR` or `SHEET_SELECTOR`, opens it with `showModal()` and gives it `sheetGestures()` as before, and a React island passes `ref` (the speed offer can draw `<Dialog ref={ref}>` instead of `dialogClass()`). The markup, the classes and the stylesheets are unchanged; the whitespace between the dialog's own elements is gone. Their `.astro` paths are deprecated shims that keep `class`, every attribute, `form` (`novalidate` included), the slot and the `after` slot; `ds validate` warns on them. `sheetHeadContentHtml()` is new: the header row's content without the row, which SheetHeader draws inside its own element.

### Patch Changes

- 2a9f0d4: The README says a consumer's `tsc` needs `allowImportingTsExtensions` (with `noEmit`): the source imports its own files with their `.ts` extension.
- 0f2d499: The deprecated `.astro` paths pass every attribute on as an `.astro` component took it: a `style` string (`<Button style="order: 2">`) no longer throws, and an HTML-named attribute (`readonly`, `autofocus`, `maxlength`, `tabindex`) reaches the element instead of being dropped or warned on.

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
