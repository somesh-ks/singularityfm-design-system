/**
 * ds find "<what you need>" | part <id or Component> | token <words> | list | batch "<command>"... | version
 *   | validate [--exceptions <file.json>] <files or globs>; --json on any of them answers in JSON.
 * Reads tokens/system.json, so it answers in milliseconds and never greps a stylesheet. An app runs
 * it as `pnpm exec ds`, the bundle the package's `bin` names (scripts/bundleCli.mjs).
 */
import { createHash } from "node:crypto";
import { existsSync, globSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { declaredProperties, type Finding, validate } from "../../rules/index.js";
import { componentsOf } from "./pages.js";
import { PACKAGE, SYSTEM_PATH } from "./paths.js";
import {
  answer,
  describePart,
  describeProps,
  describeTokenLine,
  editDistance,
  findTokens,
  lookup,
} from "./query.js";
import type { System } from "./types.js";

function load(): System {
  if (!existsSync(SYSTEM_PATH)) {
    console.error("tokens/system.json is missing. In the repository, run: pnpm run system");
    process.exit(1);
  }
  return JSON.parse(readFileSync(SYSTEM_PATH, "utf8")) as System;
}

const USAGE_VALIDATE = "Usage: ds validate [--exceptions <file.json>] <files or globs>";
const USAGE =
  'Usage: ds find "<need>" | part <id or Component> | token <words> | list | batch "<command>"... | version | validate [--exceptions <file.json>] <files or globs>. Add --json for JSON.';

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

/** One command's answer: words for a person or an agent, the same as data, and the exit code. */
interface Answer {
  text: string;
  json: Record<string, unknown>;
  code: number;
}

/** The commands that only read the system, so `batch` can run several in one call. */
function read(system: System, command: string, argument: string): Answer | undefined {
  if (["find", "part", "token"].includes(command) && argument.trim() === "")
    return { text: USAGE, json: { error: "missing argument" }, code: 2 };
  switch (command) {
    case "find": {
      const found = lookup(system, argument);
      const hit = found.parts.length > 0 || found.tokens.length > 0;
      return { text: answer(system, argument), json: { ...found }, code: hit ? 0 : 1 };
    }
    case "part": {
      const part = system.parts.find((candidate) => candidate.id === argument);
      if (part) {
        const drawn = componentsOf(part, system.components);
        return {
          text: describePart(part, drawn),
          json: { part, components: drawn },
          code: 0,
        };
      }
      // A component no part covers yet (Avatar, Flag) still answers with its import and props.
      const component = system.components.find(
        (candidate) => candidate.name.toLowerCase() === argument.toLowerCase(),
      );
      if (component)
        return {
          text: [`${component.name}: import ${component.import}`, ...describeProps(component)].join(
            "\n",
          ),
          json: { part: null, components: [component] },
          code: 0,
        };
      const ids = system.parts.map((candidate) => candidate.id);
      const names = system.components.map((candidate) => candidate.name);
      const near = [...ids, ...names]
        .map((id) => ({ id, distance: editDistance(argument.toLowerCase(), id.toLowerCase()) }))
        .filter(({ distance }) => distance <= 2)
        .sort((x, y) => x.distance - y.distance)[0]?.id;
      return {
        text: `No part or component "${argument}".${near ? ` Did you mean ${near}?` : ""} Parts: ${ids.join(", ")}. Components: ${names.join(", ")}`,
        json: {
          part: null,
          ...(near ? { didYouMean: near } : {}),
          parts: ids,
          components: [],
          componentNames: names,
        },
        code: 1,
      };
    }
    case "token": {
      const exact = system.tokens.filter(
        (token) =>
          (token.tier !== "primitive" || token.type !== "color") &&
          (token.name === argument ||
            token.name.startsWith(`--${argument}-`) ||
            token.name.startsWith(`${argument}-`)),
      );
      const hits = (
        exact.length > 0 ? exact : findTokens(system, argument, 8).map((hit) => hit.token)
      ).slice(0, 40);
      return {
        text:
          hits.length === 0
            ? `No token matches "${argument}".`
            : hits.map(describeTokenLine).join("\n"),
        json: { tokens: hits },
        code: hits.length > 0 ? 0 : 1,
      };
    }
    case "list":
      return {
        text: system.parts.map((part) => `${part.id}: ${part.summary}`).join("\n"),
        json: {
          parts: system.parts.map(({ id, name, kind, summary, imports, experimental }) => ({
            id,
            name,
            kind,
            summary,
            imports,
            ...(experimental ? { experimental } : {}),
          })),
        },
        code: 0,
      };
    default:
      return undefined;
  }
}

/** Which package and which build of system.json answered, so an agent can tell what it asked. */
function version(): Answer {
  load(); // A missing system.json says how to make it, not a stack trace.
  const { name, version: packageVersion } = JSON.parse(
    readFileSync(join(PACKAGE, "package.json"), "utf8"),
  ) as { name: string; version: string };
  const system = createHash("sha256").update(readFileSync(SYSTEM_PATH)).digest("hex").slice(0, 12);
  return {
    text: `${name} ${packageVersion}, system.json ${system}`,
    json: { package: name, version: packageVersion, system },
    code: 0,
  };
}

/**
 * Several read commands in one call, one per argument ("find primary button", "part dialog") or, with
 * none, one per line of stdin: an agent asks once instead of looping over the shell.
 */
function batch(system: System, lines: string[]): Answer {
  const results = lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [command = "", ...words] = line.split(/\s+/);
      const argument = words.join(" ").replace(/^(["'])(.*)\1$/, "$2");
      const result = read(system, command, argument) ?? {
        text: `"${command}" cannot run in a batch: find, part, token or list.`,
        json: { error: "unknown command" },
        code: 2,
      };
      return { line, ...result };
    });
  return {
    text: results.map(({ line, text }) => `## ds ${line}\n${text}`).join("\n\n"),
    json: { results: results.map(({ line, json, code }) => ({ query: line, code, ...json })) },
    code: Math.max(0, ...results.map((result) => result.code)),
  };
}

// exitCode, not exit(): exit() can cut off a long answer still being written to a pipe.
function finish(command: string, result: Answer, asJson: boolean): void {
  if (asJson) console.log(JSON.stringify({ schema: 1, command, ...result.json }, null, 2));
  else console.log(result.text);
  process.exitCode = result.code;
}

const flags = process.argv.slice(2);
const asJson = flags.includes("--json");
const [command = "", ...rest] = flags.filter((flag) => flag !== "--json");
const argument = rest.join(" ").trim();

switch (command) {
  case "version":
    finish(command, version(), asJson);
    break;
  case "batch":
    // Each argument is one quoted command; with none it reads lines from a pipe, never a terminal.
    if (rest.length === 0 && process.stdin.isTTY) {
      console.error('Usage: ds batch "find <need>" "part <id>"..., or pipe one command per line');
      process.exitCode = 2;
    } else
      finish(
        command,
        batch(load(), rest.length > 0 ? rest : readFileSync(0, "utf8").split("\n")),
        asJson,
      );
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
    const errors = findings.filter((finding) => finding.severity === "error").length;
    const summary = `${files.length} files, ${errors} errors, ${findings.length - errors} warnings`;
    finish(
      command,
      {
        text: [
          ...findings.map(
            ({ file, line, severity, rule, message }) =>
              `${file}:${line} ${severity} ${rule}: ${message}`,
          ),
          summary,
        ].join("\n"),
        json: { files: files.length, errors, warnings: findings.length - errors, findings },
        code: errors > 0 ? 1 : 0,
      },
      asJson,
    );
    break;
  }
  default: {
    const result = command ? read(load(), command, argument) : undefined;
    if (result) finish(command, result, asJson);
    else {
      console.error(USAGE);
      process.exitCode = command ? 2 : 0;
    }
  }
}
