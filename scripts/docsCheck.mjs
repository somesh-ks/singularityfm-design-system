// The docs check for the library repository (DS-1). Fails on:
//
// - a relative Markdown link that resolves to nothing here: the docs came from singularityfm-app, so
//   such a link almost always names a file that lives only there (a spec, the ledger core, a decision).
//   Link it as https://github.com/somesh-ks/singularityfm-app/blob/main/<path> instead;
// - a path to app code written as `apps/web/...`, `apps/admin/...` or `packages/<app package>/...` in a
//   doc written for this repository (AGENTS.md, README.md, docs/state.md, docs/decisions/): it reads as
//   a file here. The ledger and the specs keep such paths: their rows record where a fix was made;
// - an en or em dash in authored text (AGENTS.md, house rule).
//
// Usage: node scripts/docsCheck.mjs [--fix --app-tree <file>]
//   --fix rewrites a broken relative link to the app repository when <file> (one path per line, the app
//   repository's `git ls-tree -r --name-only` output) lists its target. extract.sh runs it once.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, normalize, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const APP = "https://github.com/somesh-ks/singularityfm-app/blob/main/";
const APP_CODE = /`((?:apps\/(?:web|admin)|packages\/(?:engine|core|cover|sound))\/[^`\s]*)`/g;
const OWN_DOCS = /^(AGENTS\.md|README\.md|docs\/state\.md|docs\/decisions\/)/;
// Built from code points so this file does not contain the characters it forbids.
const DASH = new RegExp(`[${String.fromCharCode(0x2013)}${String.fromCharCode(0x2014)}]`);
const DASH_FILES = /\.(md|ts|mjs|js|astro|css|json|ya?ml|sh)$/;

const args = process.argv.slice(2);
const fix = args.includes("--fix");
const treeArg = args.indexOf("--app-tree");
const appTree = treeArg >= 0 ? new Set(readFileSync(args[treeArg + 1], "utf8").split("\n")) : null;

// Tracked and new files alike (extract.sh runs this before its commit), never ignored ones.
const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
  cwd: ROOT,
  encoding: "utf8",
})
  .split("\n")
  .filter((file) => file && existsSync(join(ROOT, file)));

const problems = [];
let fixed = 0;

for (const file of files.filter((name) => name.endsWith(".md"))) {
  const path = join(ROOT, file);
  let text = readFileSync(path, "utf8");
  const before = text;
  text = text.replace(/\]\(([^)\s]+)\)/g, (whole, target) => {
    if (/^([a-z]+:|#)/i.test(target)) return whole;
    const [link, anchor] = target.split("#");
    const repoPath = normalize(relative(ROOT, join(dirname(path), link)))
      .split("\\")
      .join("/");
    if (existsSync(join(ROOT, repoPath))) return whole;
    if (fix && appTree?.has(repoPath)) {
      fixed += 1;
      return `](${APP}${repoPath}${anchor ? `#${anchor}` : ""})`;
    }
    problems.push(`${file}: link to ${target} resolves to nothing here (an app-repo file?)`);
    return whole;
  });
  if (text !== before) writeFileSync(path, text);
  if (OWN_DOCS.test(file)) {
    for (const [, code] of text.matchAll(APP_CODE)) {
      if (!existsSync(join(ROOT, code)))
        problems.push(`${file}: \`${code}\` is app-repo code; link it in singularityfm-app`);
    }
  }
}

for (const file of files.filter((name) => DASH_FILES.test(name) && name !== "pnpm-lock.yaml")) {
  const lines = readFileSync(join(ROOT, file), "utf8").split("\n");
  lines.forEach((line, index) => {
    if (DASH.test(line)) problems.push(`${file}:${index + 1}: en or em dash`);
  });
}

if (fix) console.log(`docs check: ${fixed} links now point at singularityfm-app`);
if (problems.length > 0) {
  console.error(problems.join("\n"));
  console.error(`docs check: ${problems.length} problems`);
  process.exitCode = 1;
} else {
  console.log(
    `docs check: ${files.filter((name) => name.endsWith(".md")).length} docs, no problems`,
  );
}
