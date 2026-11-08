// Stages the library's current version on npm for a maintainer to approve: the owner keeps every
// release behind a 2FA approval on npmjs.com (2026-11-08), so the trusted publisher allows
// `npm stage publish` only. Run by release.yml through changesets/action.
// shortcut: a version already staged but not yet approved is staged again on the next run (weekly,
// or on demand), and npm refuses the duplicate; approve or reject the staged one first.
import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(import.meta.dirname, "..", "packages", "design-system");
const { name, version } = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
const spec = `${name}@${version}`;

let live = "";
try {
  live = execFileSync("npm", ["view", spec, "version"], { encoding: "utf8" }).trim();
} catch {
  // npm view exits non-zero (E404) for a version that is not on the registry yet.
}
if (live === version) {
  console.log(`${spec} is on npm; nothing to stage.`);
  process.exit(0);
}

execFileSync("npm", ["stage", "publish"], { cwd: dir, stdio: "inherit" });

const note = `Staged ${spec}. Approve it on npmjs.com: https://www.npmjs.com/package/${name}, Staged Packages tab, Approve (2FA).`;
console.log(note);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${note}\n`);
