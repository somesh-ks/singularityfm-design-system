# @singularityfm/design-system

## 0.13.0

### Minor Changes

- dde8902: The strip (Banner, variant strip) now looks different over an open player: it sits above the app's player (the mini bar and the open page), so a state of the device or the service stays on screen while a recording is open. A page that fills the window makes room under it with `--strip-body`.

## 0.12.0

### Minor Changes

- 0e11b1a: The tonal Select's chip is tighter and even: 12px from each end, with the chevron 8px after the words (was 16px ends and a 16px gap). No markup change.

### Patch Changes

- 0e11b1a: Every props table (system.json, the part pages, llms-full.txt and `ds` answers) lists a component's props in one reading order: what it says, how it looks, wiring, value, then placement, and names the native attributes a component does not pass on (DialogTitle drops `className`, Switch `type` and `role`; system.json's `except`). No prop changed.

## 0.11.0

### Minor Changes

- d047d39: A control hugs its words (DS-13). `reserve` on PlayChip, Button, Fab and Select is deprecated: drop it, the words set the width (it still works until 1.0.0). PlayChip no longer draws `chip-again` (deprecated; 1.0.0 removes the class). PlayChip with no `label` is its glyph alone (`chip-glyph-only`), a circle as tall as the chip named by its aria-label (required then; a page's player rewrites it with each state), that keeps one box in every state and shimmers its glyph while preparing: use it for the hero's Play and a story's. Looks different: a PlayChip with words no longer has a 7rem floor or a "Play again" reserve, its digits are tabular in every state, and a played chip under a pointer keeps its words (the replay glyph says Play again).
- 53f2a4f: The lookup is a command now: `pnpm exec ds find "<need>"` (also `part`, `token`, `list`, `validate`) replaces `tsx node_modules/@singularityfm/design-system/scripts/system/cli.ts`, with `--json` on every command, `ds batch` for several lookups in one call, `ds version`, and a corrected search when a word is misspelt. A usage error (unknown command, missing argument) exits 2; no match exits 1.
- 5204135: Ship `tokens/foundations.md`: the rules for every screen (grid, text and colour roles, what never moves, words, the phone), under 4 KB. The package's AGENTS.md and `llms.txt` have an agent read it first, and `llms-full.txt` includes it. The style guide serves it at `/design/foundations.md`.
- c47b207: Each part has a markdown page, `tokens/parts/<id>.md` (import, markup, when and when not, props, tokens), and `tokens/llms-full.txt` holds every page in one file. `tokens/llms.txt` takes the llmstxt.org shape: each part id links to its page, and each part keeps one "use when" case there (its page has the rest). The style guide serves them at `/design/parts/<id>.md` and `/design/llms-full.txt`.
  
  `ds part --json` on a miss now keeps `components` a list of component records (empty) and lists the names under `componentNames`, as every other path does.
- b46e15c: `tokens/system.json` lists every component under `components`, with its import and the props its source declares (a named union of strings carries its `values`). `ds part <id>` shows the props of each component the part imports, and `ds part <Component>` answers for a component no part covers yet, such as Avatar or Flag.
- 1f01533: Three 0.10.0 rules now meet the reader's house rules. A SearchField's forced-colours edge is `ButtonBorder`, as the picker's search is, in place of `FieldText`, so its border colour can change in a forced-colours theme. A readonly Field's hover rules sit behind the fine-pointer gate. A SearchField on a `.card-group` takes the overlay tone with no `:focus` in its selector: the focus step comes after it and wins.
- d047d39: Looks different: an icon button's glyph, a glyph-only PlayChip's and the Code copy button's are the regular icon (`--size-icon`), not the large one, so air stands round the glyph in its circle. A page that set `--icon-size` keeps its own size. The pause glyph's bars and a chip's playing bars are thinner, and the outlined heart takes its control's ink instead of the muted one, so it matches the line icons beside it.

## 0.10.0

### Minor Changes

- 7152e86: The package ships `AGENTS.md`, a guide for an agent that builds UI with it: add `Before writing UI, read node_modules/@singularityfm/design-system/AGENTS.md and follow it.` to your app's own `AGENTS.md`. `ds find` and `ds part` now name the import to use and print file paths as they sit in the package. Semantic colour, shadow, shape, size and text tokens carry a `$description`, so `ds token danger` and `ds find` reach them. `ds find` no longer marks a part down for a word it names itself by ("primary call to action button" now finds the Filled button). `llms.txt` drops the Avatar's animation durations and the component-token counts to stay under its budget.
- dcecb5d: A filled Button with `data-busy="true"` keeps its fill and shows a progress cursor while it is also aria-disabled, and a SearchField whose input is disabled (a disabled fieldset included) dims like every other disabled control. What looks different: a busy filled button that was grey is now in its primary fill, and a disabled search field is now dimmed. A page can drop its own copies of these two rules.
- b81624b: Search field, picker search and wheel draw their keyboard focus ring unless the last input was a pointer, so a page without an input-mode script still shows keyboard users their place (with one, nothing changes). The search field keeps an edge in forced colours, a Toast's role settles before its words so an error after a status is announced, and `.create-fab-label`'s 4px margin is a named grid exception, so `ds validate` passes on the library's own styles.
- 7641c35: The reader's page restyles move into the library (DS-11). New experimental options, each listed by `ds find` with its reason and date and free to change or go in a minor release: `--icon-size` on the control that holds an Icon (sets the glyph's size without a rule on the glyph), IconButton `variant="filled"`, SearchField `clearable` (a Clear text button, `.search-field-wrap` and `.search-field-clear`; call `installSearchClear()` from `design-system/searchField` on each page load, and `syncSearchClear(input)` after setting the text from a script; a form reset and a page shown from the back-forward cache resync on their own), Field `tonal` (an outlined Select takes it as `data-tonal`), PlayChip `primary` and Menu `flush` (`menuListClass(sheet, flush)`). New stable states: a standard IconButton with `aria-pressed="true"` takes the accent container (a tonal or filled one keeps its own fill) and, holding two Icons, shows the second while on; a readonly Field draws itself sunken and keeps the accent edge while focused; a failed tonal select keeps its danger edge under the pointer and in focus; a `chevronDown` or `chevronUp` in an icon button or an `aria-haspopup` control turns while `aria-expanded="true"`, and in an `aria-haspopup="listbox"` trigger it takes the muted ink; the `chevronUp` glyph joins the player's registry. A page can delete its own copies of these rules. What looks different: every Play triangle (hero cover, dock, transport, queue Start listening) now sits 1/16rem right of its box, as the play chip's and the FAB's already did; a SearchField inside a `.card-group` is white in light and one grey up in dark, with the card's chip hover, instead of the container grey, and takes the focus step while focused (a page's own card gets this by being a `.card-group`); a Banner's words start at its start even inside a centred column; in a Settings or Manage row only the trailing chevron is muted and pulled out to the row's end, so another glyph there keeps its own colour and size; a tonal IconButton on a phone's menu sheet takes the sheet's tile tone.
- b81624b: SegmentedChoice, Select and Slider log one console warning in development when drawn with no accessible name. Name a SegmentedChoice with `aria-label` or `aria-labelledby`; a Select with `label`, `aria-label`, `aria-labelledby` or an `id` an outside `<label for>` names; a Slider the same less `label`. Production builds stay silent.

## 0.9.1

### Patch Changes

- 85a1d3c: Rules: a `/*` inside a string or an unquoted `url()` no longer hides the lines after it. A colour function with a literal channel (`rgb(255 0 0 / var(--a))`) is now a raw colour, and so is a colour in a `@media` or `@container` prelude; a relative colour from a token, currentColor or an interpolated source, and channels that are all tokens, still pass. Off-grid now reads the space steps inside `max()`, `clamp()` or a sum with a percentage or a dimension, and flags a space step no token defines. A computed style key (`["--x"]: 1`) declares its property. Run `ds validate` after the bump: a check that passed may now name a real finding.

## 0.9.0

### Minor Changes

- 3db28df: Adds `styles/settings-rows.css`: a settings list's rows (label, hint, value at the end, a row that is one action, a select as the value, rows inside a card), moved unchanged from the app's settings.css so the reader and the admin draw their lists from one copy. Import it after `page-frame.css`.

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
