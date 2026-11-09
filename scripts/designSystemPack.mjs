// The package as a customer gets it (D382 step 5): `pnpm pack` the design system, install the tarball into
// a throwaway Astro project with React outside the workspace, and build a page that imports a component (by
// its name, and by the deprecated .astro path), a component that imports its own stylesheet (the Icon, by
// its name and by its .astro shim), one that holds words (the Badge, by both paths), one that holds a
// row and its attributes (the Row exit, by both paths), a stylesheet (fonts.css, which pulls the font
// files), a token file and the rules module, then lint a stylesheet with the shipped Biome plugin config;
// and a second page that draws Link, IconButton and Fab by their names (the Fab brings its own
// stylesheet); and a third that draws Field, Switch and Slider by their names and by their .astro shims,
// the Switch and the Slider hydrated where they are drawn (DS-7); and a fourth that draws Dialog,
// DialogTitle, DialogActions, Sheet and SheetHeader by their names and by their .astro shims, native
// dialogs with no island (DS-3). The workspace link serves every file in the folder, so a path missing from `files`, a
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
      '<html lang="en"><body><Button variant="filled">Play</Button><OldButton variant="text">Stop</OldButton><Icon name="play" className="placed-icon" /><OldIcon name="play" class="placed-icon" /><Badge className="placed-badge">Words</Badge><OldBadge class="placed-badge">Words</OldBadge><ul><RowExit className="placed-row" data-id="s1">Row</RowExit><OldRowExit class="placed-row" data-id="s1" style="order: 1; background-image: url(data:image/gif;base64,R0lGOD)">Row</OldRowExit></ul><p data-tokens={Object.keys(tokens).length} data-findings={findings}></p></body></html>',
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
  // A Switch and a Slider answer a press only once hydrated, so a page draws them with client:load
  // and each shim carries it; the Field is a native input and draws no island.
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
      '<html lang="en"><body><form><Field className="placed-field" data-id="f1" defaultValue="Words" /><OldField class="placed-field" data-id="f1" value="Words" style="order: 1" /><Switch client:load className="placed-switch" data-id="s1" name="s1" defaultChecked /><OldSwitch class="placed-switch" data-id="s1" name="s1" checked /><Slider client:load className="placed-slider" data-id="v1" name="v1" min={0} max={100} defaultValue={30} /><OldSlider class="placed-slider" data-id="v1" name="v1" min="0" max="100" value="30" /></form></body></html>',
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
        '<Dialog className="placed-dialog" data-confirm aria-labelledby="d1" form={{ "data-form": "", novalidate: true }}><DialogTitle id="d1" data-confirm-title>Question</DialogTitle><DialogActions stacked><b>Answer</b></DialogActions><p slot="after" data-copy>After</p></Dialog>' +
        '<OldDialog class="placed-dialog" data-confirm aria-labelledby="d1" form={{ "data-form": "", novalidate: true }}><OldDialogTitle id="d1" data-confirm-title>Question</OldDialogTitle><OldDialogActions stacked><b>Answer</b></OldDialogActions><p slot="after" data-copy>After</p></OldDialog>' +
        '<Sheet className="placed-sheet" title="Sheet words" titleId="s1" close="data-panel-close" titleData={{ "data-panel-title": true }} data-health-sheet><i>Body</i><p slot="after" data-foot>Foot</p></Sheet>' +
        '<OldSheet class="placed-sheet" title="Sheet words" titleId="s1" close="data-panel-close" titleData={{ "data-panel-title": true }} data-health-sheet><i>Body</i><Fragment slot="after"><p data-foot>Foot</p></Fragment></OldSheet>' +
        '<SheetHeader title="Head words" titleId="h1" close="data-menu-close" subtitle="Sub words" /><OldSheetHeader title="Head words" titleId="h1" close="data-menu-close" subtitle="Sub words" />' +
        "</body></html>",
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
  pnpm(["exec", "astro", "build"], app);
  const html = readFileSync(join(app, "dist/index.html"), "utf8");
  const actions = readFileSync(join(app, "dist/actions/index.html"), "utf8");
  const inputs = readFileSync(join(app, "dist/inputs/index.html"), "utf8");
  const overlays = readFileSync(join(app, "dist/overlays/index.html"), "utf8");
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
  // Each path keeps the test's own class and data-id on the component's root, and its value: the
  // Field's in its input, the Switch's in its hidden checkbox (checked, named), the Slider's in its
  // hidden range. A shim that loses `class`, an attribute or `value`/`checked` fails here.
  const roots = (part) =>
    [...inputs.matchAll(new RegExp(`<(?!astro-island)\\w+[^>]*\\b${part}\\b[^>]*>`, "g"))].map(
      (tag) => tag[0],
    );
  const fields = roots("placed-field");
  if (
    fields.length !== 2 ||
    fields.some((tag) => !/data-id="f1"/.test(tag) || !/value="Words"/.test(tag))
  )
    problems.push("the page drew no placed Field with its attribute and value by each path");
  if (!fields.some((tag) => /style="order:\s*1"/.test(tag)))
    problems.push("the Field shim lost a style string");
  const switches = roots("placed-switch");
  const checkboxes = inputs.match(/<input[^>]*type="checkbox"[^>]*>/g) ?? [];
  if (
    switches.length !== 2 ||
    switches.some((tag) => !/data-id="s1"/.test(tag) || !/data-checked=""/.test(tag)) ||
    checkboxes.filter((tag) => /name="s1"/.test(tag) && /checked=""/.test(tag)).length !== 2
  )
    problems.push("the page drew no placed, checked Switch with its attribute by each path");
  const sliders = roots("placed-slider");
  const ranges = inputs.match(/<input[^>]*type="range"[^>]*>/g) ?? [];
  if (
    sliders.length !== 2 ||
    sliders.some((tag) => !/data-id="v1"/.test(tag) || !/--range-fill:\s*30%/.test(tag)) ||
    ranges.filter((tag) => /name="v1"/.test(tag) && /value="30"/.test(tag)).length !== 2
  )
    problems.push("the page drew no placed Slider with its attribute and value by each path");
  // Hydration (DS-7): the Switch and the Slider by each path are islands that load with the page, each
  // naming a component module and a renderer the build emitted; the Field is none, and no other page
  // carries the renderer.
  const islands = [...inputs.matchAll(/<astro-island\b[^>]*>/g)].map((tag) => tag[0]);
  if (islands.length !== 4 || islands.some((tag) => !/client="load"/.test(tag)))
    problems.push(
      `the inputs page drew ${islands.length} islands, not the four Switch and Slider ones`,
    );
  for (const tag of islands)
    for (const [, url] of tag.matchAll(/(?:component|renderer)-url="([^"]+)"/g))
      if (!existsSync(join(app, "dist", url))) problems.push(`an island names ${url}, not built`);
  // Each path draws the dialog with the test's class and the data attribute its script finds it by,
  // empty as on a plain element; the body a form that keeps `novalidate` (React drops the lowercase
  // name, and prints its own as noValidate); the title, the answers in a column and the `after` slot after the form, in that order. The
  // Sheet keeps its kind, its label, its data attribute, its header (title data, Close), its body and
  // its `after` slot; the header alone keeps its subtitle.
  const dialogs = [...overlays.matchAll(/<dialog[^>]*\bplaced-dialog\b[\s\S]*?<\/dialog>/g)].map(
    (match) => match[0],
  );
  const dialogParts = [
    /^<dialog[^>]*\bdata-dialog=""[^>]*\bdata-confirm=""[^>]*aria-labelledby="d1"/,
    /<form class="dialog-body"[^>]*data-form=""[^>]*novalidate=""/i,
    /<h2 class="text-heading" id="d1" data-confirm-title="">Question<\/h2>/,
    /<div class="dialog-actions dialog-actions-stacked"><b>Answer<\/b><\/div><\/form>\s*<p data-copy(?:="")?>After<\/p>\s*<\/dialog>$/,
  ];
  if (dialogs.length !== 2 || dialogs.some((tag) => dialogParts.some((part) => !part.test(tag))))
    problems.push(
      "the page drew no placed Dialog with its parts, attributes and slots by each path",
    );
  const sheets = [...overlays.matchAll(/<dialog[^>]*\bplaced-sheet\b[\s\S]*?<\/dialog>/g)].map(
    (match) => match[0],
  );
  const sheetParts = [
    /^<dialog[^>]*\bdata-sheet="panel"[^>]*aria-labelledby="s1"[^>]*data-health-sheet=""/,
    /<div class="sheet-head"><h2 class="sheet-title text-heading" id="s1" data-panel-title>Sheet words<\/h2><button[^>]*aria-label="Close" data-panel-close>/,
    /<div class="sheet-body"><i>Body<\/i><\/div>\s*<p data-foot(?:="")?>Foot<\/p>\s*<\/dialog>$/,
  ];
  if (sheets.length !== 2 || sheets.some((tag) => sheetParts.some((part) => !part.test(tag))))
    problems.push(
      "the page drew no placed Sheet with its parts, attributes and slots by each path",
    );
  if (overlays.match(/<p class="sheet-subtitle text-meta">Sub words<\/p>/g)?.length !== 2)
    problems.push("the page drew no SheetHeader with its subtitle by each path");
  if (overlays.includes("<script")) problems.push("the overlays page ships a script");
  if (/<astro-island/.test(html) || /<astro-island/.test(actions) || /<astro-island/.test(overlays))
    problems.push("a page that draws no Switch or Slider hydrates");
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
  for (const [page, rule] of [
    [inputs, ".field-input{"],
    [inputs, ".switch-input[data-checked]{"],
    [inputs, ".slider-input{"],
    [overlays, "dialog.dialog-panel{"],
    [overlays, "dialog.sheet-side{"],
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
