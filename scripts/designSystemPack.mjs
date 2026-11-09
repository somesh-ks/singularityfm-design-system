// The package as a customer gets it (D382 step 5): `pnpm pack` the design system, install the tarball into
// a throwaway Astro project with React outside the workspace, and build a page that imports a component (by
// its name, and by the deprecated .astro path), a component that imports its own stylesheet (the Icon, by
// its name and by its .astro shim), a stylesheet (fonts.css, which pulls the font files), a token file
// and the rules module, then lint a stylesheet with the shipped Biome plugin config. The workspace link
// serves every file in the folder, so a path missing from `files`, a broken
// exports entry or a lost astro peer (Astro then leaves the .astro source to Node) passes every other
// check and fails only here.
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
  ["astro", "@astrojs/react", "react", "react-dom"].map((name) => [name, guideVersion(name)]),
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
      `import "${name}/styles/tokens.css";`,
      `import "${name}/styles/fonts.css";`,
      `import tokens from "${name}/tokens/tokens.json";`,
      `import { validate } from "${name}/rules";`,
      'const findings = validate(".a { color: #fff; }", "page.css").length;',
      "---",
      '<html lang="en"><body><Button variant="filled">Play</Button><OldButton variant="text">Stop</OldButton><Icon name="play" className="placed" /><OldIcon name="play" class="placed" /><p data-tokens={Object.keys(tokens).length} data-findings={findings}></p></body></html>',
      "",
    ].join("\n"),
  );
  writeFileSync(
    join(app, "biome.json"),
    JSON.stringify({ extends: [`${name}/rules/biome-config.json`] }),
  );
  writeFileSync(join(app, "src/raw.css"), ".a { color: #fff; }\n");
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
  if (html.match(/<button/g)?.length !== 2) problems.push("the page drew no Button by each path");
  // A static component renders on the server alone (DS-3): a script here means it began to hydrate.
  if (html.includes("<script")) problems.push("the page ships a script");
  // The shim passes `class` on as className; lost, the old path draws the glyph where nothing places it.
  if (html.match(/class="icon-glyph placed"/g)?.length !== 2)
    problems.push("the page drew no placed Icon by each path");
  if (!html.includes('data-findings="1"')) problems.push("the rules module found no raw colour");
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
