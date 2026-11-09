/**
 * npm run ds -- find "<what you need>" | part <id> | token <words> | list
 *   | validate [--exceptions <file.json>] <files or globs>
 * Reads tokens/system.json, so it answers in milliseconds and never greps a stylesheet.
 */
import { existsSync, globSync, readFileSync, statSync } from "node:fs";
import { declaredProperties, type Finding, validate } from "../../rules/index.js";
import { SYSTEM_PATH } from "./build.js";
import { answer, describePart, describeTokenLine, findTokens } from "./query.js";
import type { System } from "./types.js";

function load(): System {
  if (!existsSync(SYSTEM_PATH)) {
    console.error("tokens/system.json is missing. Run: npm run system");
    process.exit(1);
  }
  return JSON.parse(readFileSync(SYSTEM_PATH, "utf8")) as System;
}

const USAGE_VALIDATE = "Usage: npm run ds -- validate [--exceptions <file.json>] <files or globs>";

/** A finding the caller exempts by name: one rule, in one file, on a line holding `text`. */
interface Exemption {
  file: string;
  rule: string;
  text: string;
  reason: string;
}

/**
 * The caller's own exceptions (the style guide's), as JSON: `grid`, its 4px cases as offGrid takes
 * them, and `exempt`, findings it means. Every entry carries its reason; one without fails.
 */
function readExceptions(path: string | undefined): {
  grid: [string, string][];
  exempt: Exemption[];
} {
  if (!path || !existsSync(path)) {
    console.error(`No exceptions file at "${path ?? ""}". ${USAGE_VALIDATE}`);
    process.exit(1);
  }
  const { grid = [], exempt = [] } = JSON.parse(readFileSync(path, "utf8")) as {
    grid?: [string, string][];
    exempt?: Exemption[];
  };
  const filled = (...values: unknown[]) =>
    values.every((value) => typeof value === "string" && value.trim() !== "");
  if (!Array.isArray(grid) || !Array.isArray(exempt)) {
    console.error(`${path}: "grid" and "exempt" are lists`);
    process.exit(1);
  }
  const bad = [
    ...grid.filter((entry) => !Array.isArray(entry) || !filled(entry[0], entry[1])),
    ...exempt.filter((entry) => !filled(entry?.file, entry?.rule, entry?.text, entry?.reason)),
  ];
  if (bad.length > 0) {
    console.error(`${path}: each entry needs its names and a reason: ${JSON.stringify(bad)}`);
    process.exit(1);
  }
  return { grid, exempt };
}

/** The exemption that names this finding (its rule, its file and its line's text), if one does. */
const exemptionFor = (finding: Finding, text: string, list: Exemption[]): Exemption | undefined =>
  list.find(
    (entry) =>
      entry.rule === finding.rule &&
      entry.file === finding.file.split("\\").join("/") &&
      (text.split("\n")[finding.line - 1] ?? "").includes(entry.text),
  );

const [command, ...rest] = process.argv.slice(2);
const argument = rest.join(" ").trim();
const system = load();

switch (command) {
  case "find":
    console.log(answer(system, argument));
    break;
  case "part": {
    const part = system.parts.find((candidate) => candidate.id === argument);
    if (!part) {
      console.error(`No part "${argument}". Parts: ${system.parts.map((p) => p.id).join(", ")}`);
      process.exit(1);
    }
    console.log(describePart(part));
    break;
  }
  case "token": {
    const exact = system.tokens.filter(
      (token) =>
        (token.tier !== "primitive" || token.type !== "color") &&
        (token.name === argument ||
          token.name.startsWith(`--${argument}-`) ||
          token.name.startsWith(`${argument}-`)),
    );
    const hits = exact.length > 0 ? exact : findTokens(system, argument, 8).map((hit) => hit.token);
    if (hits.length === 0) console.log(`No token matches "${argument}".`);
    for (const token of hits.slice(0, 40)) console.log(describeTokenLine(token));
    break;
  }
  case "list":
    for (const part of system.parts) console.log(`${part.id}: ${part.summary}`);
    break;
  case "validate": {
    const flag = rest.indexOf("--exceptions");
    const exceptions = flag === -1 ? undefined : readExceptions(rest[flag + 1]);
    const patterns = flag === -1 ? rest : rest.filter((_, at) => at !== flag && at !== flag + 1);
    // A pattern that matches nothing, or no pattern, is a typo, not a clean bill: it fails.
    if (patterns.length === 0) {
      console.error(USAGE_VALIDATE);
      process.exit(1);
    }
    const unmatched = patterns.filter((pattern) => globSync(pattern).length === 0);
    if (unmatched.length > 0) {
      console.error(`No file matches ${unmatched.map((pattern) => `"${pattern}"`).join(", ")}`);
      process.exit(1);
    }
    // A glob matches folders too; tests hold violations on purpose, as fixtures.
    const files = [...new Set(patterns.flatMap((pattern) => globSync(pattern)))].filter(
      (file) => statSync(file).isFile() && !/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(file),
    );
    if (files.length === 0) {
      console.error("The patterns match no file to validate (folders and tests are skipped)");
      process.exit(1);
    }
    const texts = new Map(files.map((file) => [file, readFileSync(file, "utf8")]));
    // A property one file sets (a page's style attribute) and another reads is declared.
    const declared = new Set(
      [...texts].flatMap(([file, text]) => [...declaredProperties(text, file)]),
    );
    const gridExceptions = exceptions?.grid;
    const exemptions = exceptions?.exempt ?? [];
    const used = new Set<Exemption>();
    const findings = [...texts].flatMap(([file, text]) =>
      validate(text, file, { gridExceptions, declared }).filter((finding) => {
        const entry = exemptionFor(finding, text, exemptions);
        if (entry) used.add(entry);
        return !entry;
      }),
    );
    // An exemption that names nothing is stale: the code moved or was fixed, and the entry would
    // otherwise sit there excusing whatever lands on that line next.
    for (const entry of exemptions.filter((item) => !used.has(item)))
      findings.push({
        rule: entry.rule,
        file: entry.file,
        line: 0,
        message: `the exemption "${entry.text}" matches no finding; remove it from the exceptions file`,
        severity: "error",
      });
    for (const { file, line, severity, rule, message } of findings)
      console.log(`${file}:${line} ${severity} ${rule}: ${message}`);
    const errors = findings.filter((finding) => finding.severity === "error").length;
    console.log(`${files.length} files, ${errors} errors, ${findings.length - errors} warnings`);
    if (errors > 0) process.exit(1);
    break;
  }
  default:
    console.error(
      'Usage: npm run ds -- find "<need>" | part <id> | token <words> | list | validate [--exceptions <file.json>] <files or globs>',
    );
    process.exit(command ? 1 : 0);
}
