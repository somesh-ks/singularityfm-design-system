// The package as a customer gets it (D382 step 5): `pnpm pack` the design system, install the tarball into
// a throwaway Astro project with React outside the workspace, and build a page that imports a component (by
// its name, and by the deprecated .astro path), a component that imports its own stylesheet (the Icon, by
// its name and by its .astro shim), one that holds words (the Badge, by both paths), one that holds a
// row and its attributes (the Row exit, by both paths), a stylesheet (fonts.css, which pulls the font
// files), a token file and the rules module, then lint a stylesheet with the shipped Biome plugin config;
// and a second page that draws Link, IconButton and Fab by their names (the Fab brings its own
// stylesheet); and a third that draws Field, Switch and Slider by their names and by their .astro shims,
// each a native element that hydrates nowhere (DS-8); and a fourth that draws the chips, the segmented
// controls and the Search field by their names, none hydrated, and installs the segmented nav's script
// from its export (DS-8); and a fifth that draws Dialog,
// DialogTitle, DialogActions, Sheet and SheetHeader by their names and by their .astro shims, native
// dialogs with no island (DS-3); and a sixth that draws a Menu, its rows and a Select, by their
// names and by their .astro shims, native and with no island (DS-8); and a seventh that draws Avatar and Code by their
// names and shims, the Code hydrated; then it runs the installed `ds` command. The workspace link serves every file in the folder, so a path missing from `files`, a
// broken exports entry or a lost astro peer (Astro then leaves the .astro source to Node) passes every
// other check and fails only here.
//
// Usage: pnpm run pack:check  (installs offline from the pnpm store when it can)
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const packageDir = join(root, "packages/design-system");
const { name } = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8"));
// The versions the style guide builds with, exact, so the install resolves from the store without the
// network. (In singularityfm-app this read apps/web, which this repository does not have.)
const guideVersion = (dependency) =>
  JSON.parse(
    readFileSync(join(root, "apps/design/node_modules", dependency, "package.json"), "utf8"),
  ).version;
const dependencies = Object.fromEntries(
  ["astro", "@astrojs/react", "react", "react-dom", "@base-ui/react"].map((name) => [
    name,
    guideVersion(name),
  ]),
);
dependencies["@biomejs/biome"] = JSON.parse(
  readFileSync(join(root, "node_modules/@biomejs/biome/package.json"), "utf8"),
).version;

const work = mkdtempSync(join(tmpdir(), "ds-pack-"));
// Windows has no `pnpm` executable, only `pnpm.cmd`, which execFile cannot start without a shell (Node
// 20.12+), and a shell with arguments is deprecated (DEP0190). Run under pnpm (`pnpm run pack:check`), the
// script calls pnpm through the program pnpm itself was started from: its JavaScript entry with this
// Node, or its own binary. Outside pnpm it falls back to `pnpm` on the PATH, which works on macOS and Linux.
const pnpmEntry = process.env.npm_execpath ?? "";
const pnpmCommand = /pnpm[^/\\]*$/i.test(pnpmEntry)
  ? /\.[cm]?js$/i.test(pnpmEntry)
    ? [process.execPath, [pnpmEntry]]
    : [pnpmEntry, []]
  : ["pnpm", []];
const pnpm = (args, cwd) =>
  execFileSync(pnpmCommand[0], [...pnpmCommand[1], ...args], {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

try {
  pnpm(["pack", "--pack-destination", work], packageDir);
  const tarball = readdirSync(work).find((file) => file.endsWith(".tgz"));
  const app = join(work, "app");
  mkdirSync(join(app, "src/pages"), { recursive: true });
  writeFileSync(
    join(app, "package.json"),
    JSON.stringify({
      name: "ds-pack-check",
      private: true,
      type: "module",
      dependencies: { ...dependencies, [name]: `file:../${tarball}` },
    }),
  );
  writeFileSync(
    join(app, "astro.config.mjs"),
    'import react from "@astrojs/react";\nexport default { integrations: [react()] };\n',
  );
  writeFileSync(
    join(app, "src/pages/index.astro"),
    [
      "---",
      `import Button from "${name}/Button";`,
      `import OldButton from "${name}/Button.astro";`,
      `import Icon from "${name}/Icon";`,
      `import OldIcon from "${name}/Icon.astro";`,
      `import Badge from "${name}/Badge";`,
      `import OldBadge from "${name}/Badge.astro";`,
      `import RowExit from "${name}/RowExit";`,
      `import OldRowExit from "${name}/RowExit.astro";`,
      `import "${name}/styles/tokens.css";`,
      `import "${name}/styles/fonts.css";`,
      `import tokens from "${name}/tokens/tokens.json";`,
      `import { validate } from "${name}/rules";`,
      'const findings = validate(".a { color: #fff; }", "page.css").length;',
      "---",
      '<html lang="en"><body><Button variant="filled">Play</Button><OldButton variant="text" style="order: 2">Stop</OldButton><Icon name="play" className="placed-icon" /><OldIcon name="play" class="placed-icon" /><Badge className="placed-badge">Words</Badge><OldBadge class="placed-badge">Words</OldBadge><ul><RowExit className="placed-row" data-id="s1">Row</RowExit><OldRowExit class="placed-row" data-id="s1" style="order: 1; background-image: url(data:image/gif;base64,R0lGOD)">Row</OldRowExit></ul><p data-tokens={Object.keys(tokens).length} data-findings={findings}></p></body></html>',
      "",
    ].join("\n"),
  );
  writeFileSync(
    join(app, "biome.json"),
    JSON.stringify({ extends: [`${name}/rules/biome-config.json`] }),
  );
  writeFileSync(join(app, "src/raw.css"), ".a { color: #fff; }\n");
  // An exports entry lost from the map sends `<pkg>/IconButton` to "./*", src/IconButton.ts, which does
  // not exist: the build fails here, where the workspace link would have served the .tsx.
  writeFileSync(
    join(app, "src/pages/actions.astro"),
    [
      "---",
      `import Fab from "${name}/Fab";`,
      `import Icon from "${name}/Icon";`,
      `import IconButton from "${name}/IconButton";`,
      `import Link from "${name}/Link";`,
      "---",
      '<html lang="en"><body><Link href="/">Link words</Link><IconButton label="Icon name"><Icon name="close" /></IconButton><Fab icon="plus" label="Fab name">Fab word</Fab></body></html>',
      "",
    ].join("\n"),
  );
  // Each is a native element that works before any script (DS-8): the page draws them with no directive.
  writeFileSync(
    join(app, "src/pages/inputs.astro"),
    [
      "---",
      `import Field from "${name}/Field";`,
      `import OldField from "${name}/Field.astro";`,
      `import Slider from "${name}/Slider";`,
      `import OldSlider from "${name}/Slider.astro";`,
      `import Switch from "${name}/Switch";`,
      `import OldSwitch from "${name}/Switch.astro";`,
      "---",
      '<html lang="en"><body><form><Field className="placed-field" data-id="f1" defaultValue="Words" /><OldField class="placed-field" data-id="f1" value="Words" style="order: 1" readonly maxlength="60" /><Switch className="placed-switch" data-id="s1" name="s1" defaultChecked /><OldSwitch class="placed-switch" data-id="s1" name="s1" checked /><Slider className="placed-slider" data-id="v1" name="v1" min={0} max={100} defaultValue={30} /><OldSlider class="placed-slider" data-id="v1" name="v1" min="0" max="100" value="30" /></form></body></html>',
      "",
    ].join("\n"),
  );
  // The overlays are native dialogs a page's script opens: they render whole on the server and draw
  // no island, and each path keeps what the app's scripts find them by.
  writeFileSync(
    join(app, "src/pages/overlays.astro"),
    [
      "---",
      `import Dialog from "${name}/Dialog";`,
      `import OldDialog from "${name}/Dialog.astro";`,
      `import DialogActions from "${name}/DialogActions";`,
      `import OldDialogActions from "${name}/DialogActions.astro";`,
      `import DialogTitle from "${name}/DialogTitle";`,
      `import OldDialogTitle from "${name}/DialogTitle.astro";`,
      `import Sheet from "${name}/Sheet";`,
      `import OldSheet from "${name}/Sheet.astro";`,
      `import SheetHeader from "${name}/SheetHeader";`,
      `import OldSheetHeader from "${name}/SheetHeader.astro";`,
      "---",
      '<html lang="en"><body>' +
        '<Dialog className="placed-dialog" data-confirm aria-labelledby="d1" form={{ "data-form": "", noValidate: true, style: { order: 1 } }}><DialogTitle id="d1" data-confirm-title style={{ order: 2 }}>Question</DialogTitle><DialogActions stacked><b>Answer</b></DialogActions><p slot="after" data-copy>After</p></Dialog>' +
        '<OldDialog class="placed-dialog" data-confirm aria-labelledby="d1" form={{ "data-form": "", novalidate: true, style: "order: 1" }}><OldDialogTitle id="d1" data-confirm-title style="order: 2">Question</OldDialogTitle><OldDialogActions stacked><b>Answer</b></OldDialogActions><p slot="after" data-copy>After</p></OldDialog>' +
        '<Sheet className="placed-sheet" title="Sheet words" titleId="s1" close="data-panel-close" titleData={{ "data-panel-title": true }} data-health-sheet><i>Body</i><p slot="after" data-foot>Foot</p></Sheet>' +
        '<OldSheet class="placed-sheet" title="Sheet words" titleId="s1" close="data-panel-close" titleData={{ "data-panel-title": true }} data-health-sheet><i>Body</i><Fragment slot="after"><p data-foot>Foot</p></Fragment></OldSheet>' +
        '<SheetHeader title="Head words" titleId="h1" close="data-menu-close" subtitle="Sub words" /><OldSheetHeader title="Head words" titleId="h1" close="data-menu-close" subtitle="Sub words" />' +
        "</body></html>",
      "",
    ].join("\n"),
  );
  // The chips, the segmented choice and the Search field are native inputs and the Play chip a
  // native button and the Segmented navigation the app's tablist, all React-rendered with no directive
  // (DS-8); the page mounts the nav's script from its export, so a lost `./*` entry fails the build.
  writeFileSync(
    join(app, "src/pages/chips.astro"),
    [
      "---",
      `import Chip from "${name}/Chip";`,
      `import ChipGroup from "${name}/ChipGroup";`,
      `import PlayChip from "${name}/PlayChip";`,
      `import SearchField from "${name}/SearchField";`,
      `import SegmentedChoice from "${name}/SegmentedChoice";`,
      `import SegmentedNav from "${name}/SegmentedNav";`,
      "---",
      '<html lang="en"><body><form><ChipGroup className="placed-chips" aria-label="Show"><Chip className="placed-chip" name="c1" value="v1" data-id="c1" defaultChecked>Chip words</Chip></ChipGroup><SegmentedChoice className="placed-choice" name="r1" aria-label="Length" defaultValue="b" options={[{ value: "a", label: "Choice A" }, { value: "b", label: "Choice B", "data-id": "r1" }]} /><SearchField className="placed-search" label="Search words" name="q1" data-id="q1" /><PlayChip className="placed-play" label="1:24" aria-label="Play name" data-play-item="0" /><SegmentedNav className="placed-nav" aria-label="Views" tabs={[{ value: "a", label: "View A", controls: "pa" }, { value: "b", label: "View B" }]} /></form>',
      `<script>import { mountSegmentedNav } from "${name}/segmentedNav"; for (const list of document.querySelectorAll('[role="tablist"]')) mountSegmentedNav(list, () => {});</script>`,
      "</body></html>",
      "",
    ].join("\n"),
  );
  // The Menu and the Select are native (DS-8): drawn on the server, no directive, no island. Each path
  // keeps the test's class and attributes on its root, the Menu its rows and the Select its options.
  writeFileSync(
    join(app, "src/pages/menus.astro"),
    [
      "---",
      `import Menu from "${name}/Menu";`,
      `import OldMenu from "${name}/Menu.astro";`,
      `import MenuItem from "${name}/MenuItem";`,
      `import OldMenuItem from "${name}/MenuItem.astro";`,
      `import Select from "${name}/Select";`,
      `import OldSelect from "${name}/Select.astro";`,
      "---",
      '<html lang="en"><body><button popovertarget="m1">More</button><Menu id="m1" title="Row" className="placed-menu"><MenuItem className="placed-item" data-id="i1" data-block>Row words</MenuItem></Menu><button popovertarget="m2">More</button><OldMenu id="m2" title="Row" class="placed-menu"><OldMenuItem class="placed-item" data-id="i1" data-block style="order: 1">Row words</OldMenuItem></OldMenu><Select className="placed-select" label="Sort" name="sort" data-id="x1"><option value="a">Newest</option><option value="b" selected>Oldest</option></Select><OldSelect class="placed-select" label="Sort" name="sort" data-id="x1"><option value="a">Newest</option><option value="b" selected>Oldest</option></OldSelect></body></html>',
      "",
    ].join("\n"),
  );
  // The Code copies only once hydrated, so it is an island by each path; the Avatar's shape is static
  // markup a script redraws in place, so it is none.
  writeFileSync(
    join(app, "src/pages/display.astro"),
    [
      "---",
      `import Avatar from "${name}/Avatar";`,
      `import OldAvatar from "${name}/Avatar.astro";`,
      `import Code from "${name}/Code";`,
      `import OldCode from "${name}/Code.astro";`,
      "---",
      '<html lang="en"><body><Avatar className="placed-avatar" shape="ghost" size="lg" /><OldAvatar class="placed-avatar" shape="ghost" size="lg" /><Code client:load className="placed-code" label="Code name" text="Code words" /><OldCode class="placed-code" label="Code name" text="Code words" /></body></html>',
      "",
    ].join("\n"),
  );
  let install = "offline";
  try {
    pnpm(["install", "--offline"], app);
  } catch {
    // shortcut: a store without astro's metadata (a fresh CI cache) fetches it; offline stays the default.
    install = "prefer-offline";
    pnpm(["install", "--prefer-offline"], app);
  }
  const installed = join(app, "node_modules", name);
  const shipped = readdirSync(installed, { recursive: true }).map(String);
  const problems = [];
  if (shipped.some((file) => file.endsWith(".test.ts"))) problems.push("the tarball ships tests");
  // Flags are copied by the apps, never imported, so the build below cannot see a missing one.
  if (!existsSync(join(installed, "flags/se.svg"))) problems.push("the tarball has no flags");
  // An agent reads these by path under node_modules and nothing imports them, so, like the flags, only
  // this check sees one missing from `files`.
  for (const file of ["AGENTS.md", "tokens/llms.txt", "tokens/system.json"])
    if (!existsSync(join(installed, file))) problems.push(`the tarball has no ${file}`);
  // `ds` runs as the bundle `prepack` builds, under plain Node from node_modules: only an installed run
  // shows a bundle that looks for system.json at a depth its own folder does not have.
  if (
    !pnpm(["exec", "ds", "find", "primary button"], app).includes(
      "@singularityfm/design-system/Button",
    )
  )
    problems.push("`ds find` did not name the Button's import");
  const { schema, version } = JSON.parse(pnpm(["exec", "ds", "version", "--json"], app));
  if (schema !== 1 || !version) problems.push("`ds version --json` gave no version");
  writeFileSync(join(app, "raw.css"), ".a { color: #fff; }\n");
  // A crash also exits non-zero, so the finding itself is what passes this.
  let finding = "";
  try {
    pnpm(["exec", "ds", "validate", "raw.css"], app);
  } catch (error) {
    finding = error.status === 1 ? String(error.stdout) : "";
  }
  if (!finding.includes("raw-colour")) problems.push("`ds validate` did not report a raw colour");
  pnpm(["exec", "astro", "build"], app);
  const html = readFileSync(join(app, "dist/index.html"), "utf8");
  const actions = readFileSync(join(app, "dist/actions/index.html"), "utf8");
  const inputs = readFileSync(join(app, "dist/inputs/index.html"), "utf8");
  const overlays = readFileSync(join(app, "dist/overlays/index.html"), "utf8");
  const chips = readFileSync(join(app, "dist/chips/index.html"), "utf8");
  const menus = readFileSync(join(app, "dist/menus/index.html"), "utf8");
  const display = readFileSync(join(app, "dist/display/index.html"), "utf8");
  if (html.match(/<button/g)?.length !== 2) problems.push("the page drew no Button by each path");
  // A static component renders on the server alone (DS-3): a script here means it began to hydrate.
  if (html.includes("<script")) problems.push("the page ships a script");
  if (actions.includes("<script")) problems.push("the actions page ships a script");
  // The test's own words and names, not the parts' markup: an empty component, or one that drops its
  // label, still builds.
  for (const text of ["Link words", 'aria-label="Icon name"', 'aria-label="Fab name"', "Fab word"])
    if (!actions.includes(text)) problems.push(`the actions page lost ${text}`);
  // The shim passes `class` on as className; lost, the old path draws the glyph where nothing places it.
  // The test's own class, wherever the Icon's own classes put it.
  if (html.match(/class="[^"]*(?<![\w-])placed-icon(?![\w-])[^"]*"/g)?.length !== 2)
    problems.push("the page drew no placed Icon by each path");
  // The Badge shim hands its slot to React as children: lost, or left in a wrapper, the app's Admin tag
  // is an empty pill or carries markup the badge's rules never met.
  // The test's own class and words, not the Badge's markup: each path's element carries both, the
  // words as its direct text.
  const badges = [...html.matchAll(/<(\w+)[^>]*\bplaced-badge\b[^>]*>([^<]*)<\/\1>/g)];
  if (badges.length !== 2 || badges.some((badge) => badge[2] !== "Words"))
    problems.push("the page drew no placed Badge with its words by each path");
  // The Row exit shim hands its other attributes and its slot to React: lost, the app's source and
  // blocked rows lose the data-id or data-domain their scripts find them by, or their content. The old
  // path takes a `style` string as the Astro row did; passed to React as it is, the build throws, and
  // split at a `;` inside its url(), the row loses the image.
  const rows = [...html.matchAll(/<(\w+)[^>]*\bplaced-row\b[^>]*>([^<]*)<\/\1>/g)];
  if (
    rows.length !== 2 ||
    rows.some((row) => row[2] !== "Row" || !row[0].includes('data-id="s1"')) ||
    !rows.some((row) => row[0].includes("gif;base64,R0lGOD"))
  )
    problems.push("the page drew no placed Row exit with its attributes and content by each path");
  if (!html.includes('data-findings="1"')) problems.push("the rules module found no raw colour");
  // React throws on a style string: an old-path Button with one fails the build, or loses it here.
  if (!/<button[^>]*style="order:\s*2"/.test(html))
    problems.push("the Button shim lost a style string");
  // Each path keeps the test's own class, data-id, name and value or checked on the native element. A
  // shim that loses `class`, an attribute or `value`/`checked` fails here.
  const roots = (part) =>
    [...inputs.matchAll(new RegExp(`<\\w+[^>]*\\b${part}\\b[^>]*>`, "g"))].map((tag) => tag[0]);
  const fields = roots("placed-field");
  if (
    fields.length !== 2 ||
    fields.some((tag) => !/data-id="f1"/.test(tag) || !/value="Words"/.test(tag))
  )
    problems.push("the page drew no placed Field with its attribute and value by each path");
  if (!fields.some((tag) => /style="order:\s*1"/.test(tag)))
    problems.push("the Field shim lost a style string");
  // React drops a boolean under its HTML name: the old path's `readonly` field would come out editable.
  // React prints readOnly="" and maxLength; HTML reads attribute names in any case.
  if (!fields.some((tag) => /\breadonly=""/i.test(tag) && /\bmaxlength="60"/i.test(tag)))
    problems.push("the Field shim lost an HTML-named attribute (readonly, maxlength)");
  const switches = roots("placed-switch");
  if (
    switches.length !== 2 ||
    switches.some(
      (tag) =>
        !/^<input/.test(tag) ||
        !/type="checkbox"/.test(tag) ||
        !/role="switch"/.test(tag) ||
        !/data-id="s1"/.test(tag) ||
        !/name="s1"/.test(tag) ||
        !/checked=""/.test(tag),
    )
  )
    problems.push("the page drew no placed, checked Switch with its attribute by each path");
  const sliders = roots("placed-slider");
  if (
    sliders.length !== 2 ||
    sliders.some(
      (tag) =>
        !/^<input/.test(tag) ||
        !/type="range"/.test(tag) ||
        !/data-id="v1"/.test(tag) ||
        !/name="v1"/.test(tag) ||
        !/value="30"/.test(tag),
    )
  )
    problems.push("the page drew no placed Slider with its attribute and value by each path");
  // No island and no renderer (DS-8): a shim that grows a client directive ships React to every page
  // that draws a Switch or a Slider.
  if (/<astro-island|<script/.test(inputs))
    problems.push("the inputs page hydrates or ships a script");
  // Each path draws the same dialog, found by the test's class: the attributes its script finds it by;
  // a form body that keeps `novalidate` by either spelling (React drops the lowercase one) and a style
  // string; the title with its id, data attribute and style; the answers inside the form and the
  // `after` slot after it. The Sheet keeps its kind, its label, its data attribute, its title data,
  // its Close, its body and its `after` slot; the header alone keeps its subtitle. The test's own
  // words and attributes only: never the library's classes or the order it prints attributes in.
  const placed = (name) =>
    [...overlays.matchAll(new RegExp(`<dialog[^>]*\\b${name}\\b[\\s\\S]*?</dialog>`, "g"))].map(
      (match) => match[0],
    );
  const drawn = (found, parts) =>
    found.length === 2 && found[0] === found[1] && parts.every((part) => part.test(found[0]));
  const opening = (name, ...attributes) =>
    new RegExp(`<${name}\\b${attributes.map((a) => `(?=[^>]*\\s${a})`).join("")}[^>]*>`, "i");
  if (
    !drawn(placed("placed-dialog"), [
      opening("dialog", 'data-dialog=""', 'data-confirm=""', 'aria-labelledby="d1"'),
      opening("form", 'data-form=""', "novalidate", 'style="order:\\s*1"'),
      /<(h[1-6])\b(?=[^>]*\sid="d1")(?=[^>]*\sdata-confirm-title)(?=[^>]*\sstyle="order:\s*2")[^>]*>Question<\/\1>/,
      /<b>Answer<\/b>(?:<\/\w+>)*<\/form>\s*<p data-copy(?:="")?>After<\/p>\s*<\/dialog>$/,
    ])
  )
    problems.push(
      "the page drew no placed Dialog with its parts, attributes and slots by each path",
    );
  if (
    !drawn(placed("placed-sheet"), [
      opening("dialog", 'data-sheet="panel"', 'aria-labelledby="s1"', 'data-health-sheet=""'),
      /<(h[1-6])\b(?=[^>]*\sid="s1")(?=[^>]*\sdata-panel-title)[^>]*>Sheet words<\/\1>/,
      opening("button", 'aria-label="Close"', "data-panel-close"),
      /<i>Body<\/i>(?:<\/\w+>)*\s*<p data-foot(?:="")?>Foot<\/p>\s*<\/dialog>$/,
    ])
  )
    problems.push(
      "the page drew no placed Sheet with its parts, attributes and slots by each path",
    );
  if (overlays.match(/>Sub words</g)?.length !== 2)
    problems.push("the page drew no SheetHeader with its subtitle by each path");
  if (/<astro-island|<script/.test(overlays))
    problems.push("the overlays page hydrates or ships a script");
  // Each keeps the test's own class, attributes and words on the element the app's scripts and rules
  // find, found by the test's own class and never by the part's classes or wrapper markup: a native checkbox, ticked and named, in its chip; a radio group whose chosen radio is
  // checked; a native search input; a button the player writes; a tablist whose chosen tab is
  // aria-selected with its panel named. A dropped attribute, word or state fails here.
  const tag = (pattern) => chips.match(pattern)?.[0] ?? "";
  const has = (found, ...parts) => found !== "" && parts.every((part) => found.includes(part));
  const wants = [
    [has(tag(/<fieldset[^>]*\bplaced-chips\b[^>]*>/), 'aria-label="Show"'), "the ChipGroup"],
    [
      has(
        tag(/<label[^>]*\bplaced-chip\b[^>]*>.*?<\/label>/),
        'type="checkbox"',
        'name="c1"',
        'value="v1"',
        'data-id="c1"',
        'checked=""',
        "Chip words",
      ),
      "the Chip",
    ],
    [
      has(tag(/<fieldset[^>]*\bplaced-choice\b[^>]*>/), 'role="radiogroup"', 'aria-label="Length"'),
      "the SegmentedChoice",
    ],
    [
      has(
        tag(/<input[^>]*value="b"[^>]*>/),
        'type="radio"',
        'name="r1"',
        'data-id="r1"',
        'checked=""',
      ),
      "the chosen radio",
    ],
    [
      has(
        tag(/<label[^>]*\bplaced-search\b[^>]*>.*?<\/label>/),
        "Search words",
        'type="search"',
        'name="q1"',
        'data-id="q1"',
      ),
      "the SearchField",
    ],
    [
      has(
        tag(/<button[^>]*\bplaced-play\b[^>]*>/),
        'type="button"',
        'data-state="idle"',
        'data-playing="false"',
        'aria-label="Play name"',
        'data-play-item="0"',
      ),
      "the PlayChip",
    ],
    [chips.includes('data-chip-label="">1:24<'), "the PlayChip's words"],
    [
      has(tag(/<[a-z]+[^>]*\bplaced-nav\b[^>]*>/), 'role="tablist"', 'aria-label="Views"'),
      "the SegmentedNav",
    ],
    [
      has(tag(/<button[^>]*role="tab"[^>]*>View A/), 'aria-controls="pa"', 'aria-selected="true"'),
      "the chosen tab and its panel",
    ],
    [
      has(tag(/<button[^>]*role="tab"[^>]*>View B/), 'aria-selected="false"', 'tabindex="-1"'),
      "the other tab, out of the Tab order",
    ],
  ];
  for (const [kept, what] of wants) if (!kept) problems.push(`the chips page lost ${what}`);
  // No island (DS-8): the segmented nav is the app's tablist markup and the page's one script call, so a
  // directive that creeps back ships React's renderer to every page that draws one.
  if (/<astro-island/.test(chips)) problems.push("the chips page hydrates");
  if (!/<script\b/.test(chips)) problems.push("the chips page lost the segmented nav's script");
  // Native: each Menu is a popover holding its row whole, each Select a select holding its options,
  // and nothing hydrates. The deprecated Select still loads the phone's sheet; the named one leaves it
  // to the page (installSelectSheet).
  const menuLists = [
    ...menus.matchAll(
      /<div[^>]*\bplaced-menu\b[^>]*>[\s\S]*?<button[^>]*\bplaced-item\b[^>]*>([^<]*)<\/button>/g,
    ),
  ];
  if (
    menuLists.length !== 2 ||
    menuLists.some(
      ([list, words]) =>
        !/\bpopover="(?:auto)?"/.test(list) ||
        !/role="menu"/.test(list) ||
        !/<button[^>]*\bplaced-item\b[^>]*data-id="i1"[^>]*data-block=""|<button[^>]*data-id="i1"[^>]*data-block=""[^>]*\bplaced-item\b/.test(
          list,
        ) ||
        !/role="menuitem"/.test(list) ||
        words !== "Row words",
    )
  )
    problems.push("the page drew no placed Menu holding its placed row by each path");
  // React throws on a style string: the old path's styled row fails the build, or loses it here.
  if (
    !menuLists.some(([list]) =>
      /\bplaced-item\b[^>]*style="order:\s*1"|style="order:\s*1"[^>]*\bplaced-item\b/.test(list),
    )
  )
    problems.push("the MenuItem shim lost a style string");
  const selects = [
    ...menus.matchAll(/<(?:label|span)[^>]*\bplaced-select\b[^>]*>([\s\S]*?)<\/select>/g),
  ];
  if (
    selects.length !== 2 ||
    selects.some(
      ([, inside]) =>
        !/<select[^>]*name="sort"[^>]*data-id="x1"|<select[^>]*data-id="x1"[^>]*name="sort"/.test(
          inside,
        ) || !/<option value="b" selected(?:="")?>Oldest<\/option>/.test(inside),
    )
  )
    problems.push("the page drew no placed Select with its attributes and options by each path");
  if (/<astro-island/.test(menus)) problems.push("the menus page hydrates");
  // Each path draws the same Avatar, found by the test's class, with its shape drawn in it (the clip
  // id aside, which React makes per instance): a shim that drops the shape or the size draws another.
  // Each Code keeps the test's class, its name and its words, and the hooks the Astro snippet carried
  // (a script or rule that finds it by them fails silently without them). The test's own class,
  // attributes and words only, never the library's markup.
  const avatars = [...display.matchAll(/<(\w+)\b[^>]*\bplaced-avatar\b[\s\S]*?<\/svg>/g)].map(
    (match) => match[0].replace(/(?<=id="|#)[^")]+/g, "id"),
  );
  if (avatars.length !== 2 || avatars[0] !== avatars[1])
    problems.push("the page drew no placed Avatar, the same by each path");
  const count = (pattern) => display.match(pattern)?.length ?? 0;
  if (
    count(/class="[^"]*\bplaced-code\b/g) !== 2 ||
    count(/aria-label="Code name"/g) !== 2 ||
    count(/>Code words</g) !== 2
  )
    problems.push("the page drew no placed Code with its name and words by each path");
  const hooks = display.match(
    /data-code=""|data-copied-word="Copied"|data-code-copy=""|data-code-said=""/g,
  );
  if (hooks?.length !== 8) problems.push("a Code lost a data-code hook the Astro snippet carried");
  const codeIslands = [...display.matchAll(/<astro-island\b[^>]*>/g)].map((tag) => tag[0]);
  if (codeIslands.length !== 2 || codeIslands.some((tag) => !/client="load"/.test(tag)))
    problems.push(`the display page drew ${codeIslands.length} islands, not the two Code ones`);
  for (const tag of codeIslands)
    for (const [, url] of tag.matchAll(/(?:component|renderer)-url="([^"]+)"/g))
      if (!existsSync(join(app, "dist", url))) problems.push(`an island names ${url}, not built`);
  // The shipped plugin, through the shared config a consumer extends: a raw colour fails the lint.
  let lint = "";
  try {
    lint = pnpm(["exec", "biome", "lint", "src/raw.css"], app);
  } catch (error) {
    lint = `${error.stdout}${error.stderr}`;
  }
  if (!/A raw colour: read a colour token/.test(lint))
    problems.push("the Biome plugin did not fire on a raw colour");
  const assets = readdirSync(join(app, "dist/_astro"));
  // A .tsx in node_modules carries its stylesheet only if the consumer's build follows the import.
  const styles = assets
    .filter((file) => file.endsWith(".css"))
    .map((file) => readFileSync(join(app, "dist/_astro", file), "utf8"));
  if (![html, ...styles].some((text) => text.includes(".icon-glyph{")))
    problems.push("the Icon's stylesheet did not reach the page");
  if (![actions, ...styles].some((text) => text.includes(".create-fab{")))
    problems.push("the Fab's stylesheet did not reach the page");
  if (![chips, ...styles].some((text) => text.includes(".search-field{")))
    problems.push("the Search field's stylesheet did not reach the page");
  for (const [page, rule] of [
    [inputs, ".field-input{"],
    [inputs, ".switch-input:checked{"],
    [inputs, ".slider-input{"],
    [overlays, "dialog.dialog-panel{"],
    [overlays, "dialog.sheet-side{"],
    [menus, ".menu-list{"],
    [menus, ".select-outlined{"],
    [display, ".avatar{"],
    [display, ".code-snippet{"],
  ])
    if (![page, ...styles].some((text) => text.includes(rule)))
      problems.push(`${rule.slice(0, -1)} did not reach the page`);
  if (!assets.some((file) => file.endsWith(".woff2")))
    problems.push("the build emitted no font file");
  if (problems.length > 0) throw new Error(problems.join("; "));
  console.log(`${tarball}: packs, installs (${install}) and builds (${shipped.length} files)`);
} catch (error) {
  const output = [error.stdout, error.stderr].filter(Boolean).join("\n").trim();
  console.error(`${name} failed the pack-and-install check: ${error.message}`);
  if (output) console.error(output.split("\n").slice(-30).join("\n"));
  process.exitCode = 1;
} finally {
  rmSync(work, { recursive: true, force: true });
}
