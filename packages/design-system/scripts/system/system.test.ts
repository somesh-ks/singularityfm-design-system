import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildSystem, systemFiles } from "./build.js";
import { FOUNDATIONS_PATH, LLMS_PATH, PARTS_DIR, SYSTEM_PATH } from "./paths.js";
import { propsTable } from "./props.js";
import { lookup, shownTokens } from "./query.js";
import type { System } from "./types.js";
import { usageComment } from "./usage.js";

type GoldenRow = { area: string; need: string; why?: string } & (
  | { part: string | null }
  | { token: string }
);
const golden = JSON.parse(
  readFileSync(new URL("./golden.json", import.meta.url), "utf8"),
) as GoldenRow[];

/** The file as published, which `npm run ds` answers from. */
const system = JSON.parse(readFileSync(SYSTEM_PATH, "utf8")) as System;
const ids = new Set(system.parts.map((part) => part.id));

describe("the design system file", () => {
  // Prevents publishing a lookup file that no longer says what the package ships: the library builds
  // it from its own files alone (DS-2), so a part or token edit without `npm run system` fails here.
  it("is what the package's own files build", () => {
    const files = systemFiles();
    for (const [path, text] of files) expect(readFileSync(path, "utf8")).toBe(text);
    // A page left from a renamed or retired part would still be published and linked by nothing.
    const pages = files
      .filter(([path]) => path.startsWith(PARTS_DIR))
      .map(([path]) => basename(path));
    expect(readdirSync(PARTS_DIR).sort()).toEqual(pages.sort());
  });

  // Prevents a "not this, use that" pointing at a part that does not exist.
  it("points every alternative at a part", () => {
    const dangling = system.parts.flatMap((part) =>
      (part.not ?? [])
        .filter((item) => !ids.has(item.use) && !item.use.startsWith("nothing"))
        .map((item) => `${part.id} -> ${item.use}`),
    );
    expect(dangling).toEqual([]);
    expect(ids.size).toBe(system.parts.length);
  });

  // Prevents shipping the consumer's agent guide with an import or a file the package does not have, or
  // dropping it from `files`: an agent reads it by path under node_modules, so a stale name sends every
  // consuming team's agent to a path that does not resolve.
  it("ships an agent guide that names only what the package has", () => {
    const pkg = new URL("../../", import.meta.url);
    const manifest = JSON.parse(readFileSync(new URL("package.json", pkg), "utf8")) as {
      name: string;
      files: string[];
      exports: Record<string, string>;
    };
    const guide = readFileSync(new URL("AGENTS.md", pkg), "utf8");
    expect(manifest.files).toContain("AGENTS.md");
    // A name with an extension is a file under the package; one without is an import specifier.
    const named = [...guide.matchAll(/@singularityfm\/design-system\/([A-Za-z][\w./-]*\w)/g)].map(
      (match) => match[1] ?? "",
    );
    const imports = named.filter((name) => !/\.\w+$/.test(name));
    const paths = [
      ...named.filter((name) => /\.\w+$/.test(name)),
      ...[...guide.matchAll(/\b((?:tokens|styles|scripts)\/[\w./-]*\w)/g)].map(
        (match) => match[1] ?? "",
      ),
    ];
    expect(imports.length).toBeGreaterThan(0);
    const missing = [
      ...imports.filter((name) => !(`./${name}` in manifest.exports)),
      ...paths.filter((path) => !existsSync(new URL(path, pkg))),
    ];
    expect(missing).toEqual([]);
  });

  // Prevents the rules an agent reads before every task from naming what the package no longer has: a
  // renamed token or component leaves foundations.md sending each consuming agent to a dead name. And
  // it is read whole every time, so it stays under 4 KB (DS-12).
  it("keeps foundations.md under 4 KB, naming only tokens and components the package has", () => {
    const text = readFileSync(FOUNDATIONS_PATH, "utf8");
    expect(Buffer.byteLength(text)).toBeLessThan(4 * 1024);
    const names = [...system.tokens.map((token) => token.name), ...system.properties];
    const spans = [...text.matchAll(/`([^`]+)`/g)].map((match) => match[1] ?? "");
    // `--text-*` and `--color-<fill>-hover` name a family: some token must fit the whole pattern, so
    // renaming the hover tokens fails here even though other colour tokens still start `--color-`.
    const family = (span: string): RegExp =>
      new RegExp(
        `^${span
          .split(/\*|<[^>]+>/)
          .map((piece) => piece.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
          .join("[a-z0-9-]+")}$`,
      );
    const tokens = spans.filter((span) => span.startsWith("--"));
    const components = spans.filter((span) => /^[A-Z][A-Za-z]+$/.test(span));
    expect(tokens.length).toBeGreaterThan(0);
    expect(components.length).toBeGreaterThan(0);
    const missing = [
      ...tokens.filter((span) => !names.some((name) => family(span).test(name))),
      ...components.filter(
        (name) => !system.components.some((component) => component.name === name),
      ),
    ];
    expect(missing).toEqual([]);
  });

  // Prevents a props table that hides or misnames what a component passes on: Link, Select and four
  // others spread every attribute to their element and the table said nothing, and SegmentedChoice
  // was said to take an input's attributes because its file types its inputs first, when its Props
  // take a fieldset's. DialogTitle's props, in a type alias, were not read at all.
  it("names the element each component passes its attributes to", () => {
    const silent = system.components.filter(
      (component) =>
        !component.element &&
        /\.\.\.(rest|passed)\b/.test(
          readFileSync(new URL(`../../../../${component.file}`, import.meta.url), "utf8"),
        ),
    );
    expect(silent.map((component) => component.name)).toEqual([]);
    const source = `import type { FieldsetHTMLAttributes, InputHTMLAttributes } from "react";
type Item = InputHTMLAttributes<HTMLInputElement>;
type Props = Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "role"> & {
  /** The legend. */
  label: string;
};`;
    expect(propsTable(source)).toMatchObject({
      element: "fieldset",
      rows: [{ name: "label", required: true }],
    });
  });

  // Prevents publishing an opaque hex for a translucent color: the scrim was listed as #151618, which
  // reads as solid and drops the 42% that makes it a scrim.
  it("gives no hex to a translucent color", () => {
    for (const built of [system, buildSystem()]) {
      const scrim = built.tokens.find((token) => token.name === "--color-scrim");
      expect(scrim?.light).toContain(" / ");
      expect(scrim?.hex).toBeUndefined();
      expect(built.tokens.find((token) => token.name === "--color-surface")?.hex).toBeDefined();
    }
  });

  // Prevents a part showing another rule's comment: `.settings-row .multiselect` has a comment of its
  // own, and it was shown as the usage of the settings row. A class may also open a group ("a, b {")
  // elsewhere with no comment of its own; the comment is the one over its own rule. A lint suppression
  // sits right on its rule, and it was published as the filter chip's usage.
  it("takes a usage comment from the class's own rule, past a lint suppression", () => {
    const root = mkdtempSync(join(tmpdir(), "usage-"));
    mkdirSync(join(root, "styles"), { recursive: true });
    writeFileSync(
      join(root, "styles/x.css"),
      "/* inside the row */\n.row .field {\n  color: red;\n}\n\n.row,\n.plain {\n  display: flex;\n}\n\n/* the row itself */\n.row {\n  color: blue;\n}\n\n/* a chip */\n/* biome-ignore lint/style/noDescendingSpecificity: why. */\n.chip {\n  color: green;\n}\n",
    );
    expect(usageComment("styles/x.css", ".row", root)).toBe("the row itself");
    expect(usageComment("styles/x.css", ".plain", root)).toBe("");
    expect(usageComment("styles/x.css", ".chip", root)).toBe("a chip");
  });

  // Prevents the index outgrowing its purpose: it is read whole, so each byte is paid for on every task.
  it("keeps llms.txt under 14 KB", () => {
    expect(Buffer.byteLength(readFileSync(LLMS_PATH))).toBeLessThan(14 * 1024);
  });
});

describe("the lookup", () => {
  // Prevents a lookup that stops answering a real need: each row of golden.json is a need an agent
  // asked (the first 11 from the first lookup trial, 14 tasks given to agents with no tool) and the
  // part an experienced person would pick, which must come first, or the token, which must be among those
  // `ds find` shows. A new case is a row, never a test; every miss is listed at once.
  it("answers every need in golden.json", () => {
    const misses = golden.flatMap((row) => {
      if ("token" in row) {
        const names = shownTokens(system, row.need).map((hit) => hit.token.name);
        return names.includes(row.token)
          ? []
          : [`${row.need} -> ${row.token}, got ${names.join(", ") || "nothing"}`];
      }
      const first = lookup(system, row.need).parts[0]?.id ?? null;
      return first === row.part ? [] : [`${row.need} -> ${row.part}, got ${first}`];
    });
    expect(misses).toEqual([]);
  });

  // Prevents a golden row that can never pass: a part or token renamed away leaves its row pointing
  // at nothing, which would read as a lookup miss instead of a stale row.
  it("names only parts and tokens that exist", () => {
    const tokens = new Set(system.tokens.map((token) => token.name));
    const stale = golden.filter((row) =>
      "token" in row ? !tokens.has(row.token) : row.part !== null && !ids.has(row.part),
    );
    expect(stale).toEqual([]);
  });
});
