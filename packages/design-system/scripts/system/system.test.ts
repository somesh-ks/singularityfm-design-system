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
import { COMPONENTS_DIR, FOUNDATIONS_PATH, LLMS_PATH, PARTS_DIR, SYSTEM_PATH } from "./paths.js";
import { PROP_ORDER, propsTable, stringUnionValues } from "./props.js";
import { describePart, findIcons, lookup, shownTokens } from "./query.js";
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
    const componentPages = files
      .filter(([path]) => path.startsWith(COMPONENTS_DIR))
      .map(([path]) => basename(path));
    expect(readdirSync(COMPONENTS_DIR).sort()).toEqual(componentPages.sort());
    expect(system.version.length).toBeGreaterThan(0);
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
    const gaps = readFileSync(new URL("GAPS.md", pkg), "utf8");
    expect(manifest.files).toContain("AGENTS.md");
    expect(manifest.files).toContain("GAPS.md");
    // A name with an extension is a file under the package; one without is an import specifier.
    const combined = `${guide}\n${gaps}`;
    const named = [
      ...combined.matchAll(/@singularityfm\/design-system\/([A-Za-z][\w./-]*\w)/g),
    ].map((match) => match[1] ?? "");
    const imports = named.filter((name) => !/\.\w+$/.test(name) && name !== "drawer");
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
  // take a fieldset's. DialogTitle's props, in a type alias, were not read at all, and its page then
  // said every heading attribute passes when it drops className.
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
      except: ["role"],
      rows: [{ name: "label", required: true }],
    });
    // The same Props as an interface, and as an alias whose object comes first.
    const item = "type Item = InputHTMLAttributes<HTMLInputElement>;\n";
    const label = { element: "fieldset", rows: [{ name: "label", required: true }] };
    expect(
      propsTable(
        `${item}interface Props extends FieldsetHTMLAttributes<HTMLFieldSetElement> {\n  label: string;\n}`,
      ),
    ).toMatchObject(label);
    expect(
      propsTable(`${item}type Props = {\n  label: string;\n} & ComponentProps<"fieldset">;`),
    ).toMatchObject(label);
  });

  // Prevents a props table in the order its source happened to declare: Slider listed className and
  // style before what it is, Badge className before its words (owner, 2026-11-13). Every table reads
  // in one order, and a prop that order does not name would fall to the end unnoticed.
  it("gives every documented prop its place in the reading order", () => {
    const unplaced = system.components.flatMap((component) =>
      component.props
        .filter((prop) => !PROP_ORDER.includes(prop.name))
        .map((prop) => `${component.name}.${prop.name}`),
    );
    expect(unplaced).toEqual([]);
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

  // Prevents inline prop unions such as Sheet's `kind?: "create" | "panel"` from omitting choices.
  it("extracts inline string-literal union choices from prop types", () => {
    const sheet = system.components.find((component) => component.name === "Sheet");
    expect(sheet?.props.find((prop) => prop.name === "kind")?.values).toEqual(["create", "panel"]);

    const parsed = propsTable(
      [
        "interface Props {",
        '  kind?: "create" | "panel";',
        "  size?:",
        '    | "sm"',
        '    | "md"',
        '    | "lg";',
        '  wide?: "a" | string;',
        '  only?: "single";',
        "}",
      ].join("\n"),
    );
    expect(parsed.rows.find((row) => row.name === "kind")?.values).toEqual(["create", "panel"]);
    expect(parsed.rows.find((row) => row.name === "size")?.values).toEqual(["sm", "md", "lg"]);
    expect(parsed.rows.find((row) => row.name === "wide")?.values).toBeUndefined();
    expect(parsed.rows.find((row) => row.name === "only")?.values).toBeUndefined();
    expect(stringUnionValues("\"a\" | 'b' | undefined")).toEqual(["a", "b"]);
  });

  // Prevents build.ts from copying the first child component's a11y (e.g. Icon decorative SVG) onto composite parts.
  it("derives accessibility only from part or single-component ownership, never imports[0]", () => {
    const rowAction = system.parts.find((part) => part.id === "row-action");
    const emptyState = system.parts.find((part) => part.id === "empty-state");
    const icon = system.components.find((component) => component.name === "Icon");
    expect(rowAction?.a11y?.role).toContain("<a href>");
    expect(rowAction?.a11y?.role).not.toContain("<svg");
    const rowText = rowAction ? describePart(rowAction, icon ? [icon] : []) : "";
    expect(rowText).not.toContain("Decorative <svg");
    expect(emptyState?.a11y).toBeUndefined();
  });

  // Prevents unshipped or partial parts from emitting broken imports or unstyled `.empty` recipes.
  it("keeps empty-state and drawer docs honest and provides accurate markup on styled parts", () => {
    const emptyDoc = readFileSync(join(PARTS_DIR, "empty-state.md"), "utf8");
    const drawerDoc = readFileSync(join(PARTS_DIR, "drawer.md"), "utf8");
    expect(emptyDoc).not.toContain("<EmptyState");
    expect(emptyDoc).not.toContain('<section class="empty"');
    expect(drawerDoc).not.toContain("<SheetFrame");

    for (const id of [
      "btn-action-tonal",
      "card-group",
      "settings-row",
      "stat-tiles",
      "section-head",
      "meta",
    ]) {
      const part = system.parts.find((candidate) => candidate.id === id);
      expect(part?.markup, `${id} missing markup`).toContain(id);
    }

    for (const id of ["empty-state", "multiselect", "cover"]) {
      const part = system.parts.find((candidate) => candidate.id === id);
      expect(part?.styles, `${id} should have no stylesheets`).toEqual([]);
      expect(part?.markup, `${id} should omit broken markup`).toBeUndefined();
    }
  });

  // Prevents markdown pages from dropping metadata or introducing em/en dashes.
  it("writes complete YAML front-matter on generated part and component markdown pages", () => {
    const pages = [
      ...readdirSync(PARTS_DIR).map((file) => join(PARTS_DIR, file)),
      ...readdirSync(COMPONENTS_DIR).map((file) => join(COMPONENTS_DIR, file)),
    ];
    for (const page of pages) {
      const text = readFileSync(page, "utf8");
      expect(text, page).toMatch(/^---\n/);
      const front = text.split(/^---\n/m)[1] ?? "";
      expect(front, page).toContain(`version: "${system.version}"`);
      expect(front, page).toMatch(/^id:\s+\S+/m);
      expect(front, page).toMatch(/^name:\s+/m);
      expect(front, page).toMatch(/^kind:\s+/m);
      expect(front, page).toMatch(/^imports:/m);
      expect(text, page).not.toMatch(/[\u2013\u2014]/);
    }
  });

  // Prevents `ds icons` from drifting out of sync with exported ICON_PATHS.
  it("lists and filters exported icon glyphs via findIcons", () => {
    expect(system.icons.length).toBeGreaterThan(20);
    expect(findIcons(system)).toEqual(system.icons);
    const chevrons = findIcons(system, "chevron");
    expect(chevrons).toContain("chevronRight");
    expect(chevrons).not.toContain("trash");
    expect(findIcons(system, "nonexistent-icon-query")).toEqual([]);
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
