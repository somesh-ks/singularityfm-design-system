import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Compiles tokens/glyphs.json into the Icon's registry (src/icons.ts). The app builds its React
 * player's registries from the same published file, so a glyph can never look different in the
 * two places; a glyph's `targets` say which registry draws it.
 *
 *   npx tsx scripts/buildGlyphs.ts           writes the registries
 *   npx tsx scripts/buildGlyphs.ts --check   fails when a committed registry is stale
 *   npx tsx scripts/buildGlyphs.ts --fetch   rebuilds every path from the installed Phosphor package
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const GLYPHS_PATH = resolve(ROOT, "packages/design-system/tokens/glyphs.json");
export const PAGE_REGISTRY_PATH = resolve(ROOT, "packages/design-system/src/icons.ts");

export const GENERATED_HEADER = "GENERATED FILE. Do not edit.";
const LINE_WIDTH = 100;

/** A Phosphor icon name: lower-case words joined by hyphens. */
const SYMBOL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type GlyphWeight = "regular" | "fill" | "bold";

export type GlyphTarget = "page" | "player" | "playerLazy";

export interface Glyph {
  /** Phosphor icon name, kebab-case. */
  phosphor: string;
  /** The Phosphor weight the path is taken from. */
  weight: GlyphWeight;
  targets: GlyphTarget[];
  /** The single path of the icon, in the document's view box. */
  d: string;
  /**
   * The same icon in Phosphor's bold weight, on a regular glyph. The Icon draws both and a token
   * (component.icon.bold) chooses which one shows, so a style can thicken every icon (D268).
   */
  bold?: string;
  /**
   * How the paths were cut from the Phosphor icon named above, when the set has no icon for the
   * need. `--fetch` keeps a derived glyph's paths as written.
   */
  derived?: string;
}

export interface GlyphDocument {
  $description: string;
  viewBox: string;
  source: string;
  sourceVersion: string;
  glyphs: Record<string, Glyph>;
}

export function loadGlyphs(path: string = GLYPHS_PATH): GlyphDocument {
  return JSON.parse(readFileSync(path, "utf8")) as GlyphDocument;
}

/** Problems that would produce a broken or misleading registry. Empty when the document is sound. */
export function validateGlyphs(doc: GlyphDocument): string[] {
  const problems: string[] = [];
  if (!/^-?\d+ -?\d+ \d+ \d+$/.test(doc.viewBox)) problems.push(`viewBox "${doc.viewBox}"`);
  for (const [name, glyph] of Object.entries(doc.glyphs)) {
    if (!/^[a-z][A-Za-z0-9]*$/.test(name)) problems.push(`${name}: name is not camelCase`);
    if (!SYMBOL_NAME.test(glyph.phosphor ?? "")) problems.push(`${name}: no Phosphor name`);
    if (!["regular", "fill", "bold"].includes(glyph.weight)) problems.push(`${name}: no weight`);
    if (glyph.targets.length === 0) problems.push(`${name}: no target`);
    for (const target of glyph.targets) {
      if (target !== "page" && target !== "player" && target !== "playerLazy")
        problems.push(`${name}: target "${target}"`);
    }
    // A path is move, line and curve commands only. Anything else is not a path from the set.
    if (!/^[Mm][\dA-Za-z .,-]+$/.test(glyph.d)) {
      problems.push(`${name}: path is missing or malformed`);
    }
    if (glyph.bold !== undefined) {
      if (glyph.weight !== "regular")
        problems.push(`${name}: only a regular glyph has a bold twin`);
      else if (!/^[Mm][\dA-Za-z .,-]+$/.test(glyph.bold))
        problems.push(`${name}: bold path is malformed`);
    }
  }
  return problems;
}

/** The document as the formatter prints it: two-space JSON with each list of targets on one line. */
export function serializeGlyphs(doc: GlyphDocument): string {
  const json = JSON.stringify(doc, null, 2);
  const oneLine = (_list: string, body: string): string =>
    `[${body.trim().split(/,\s*/).join(", ")}]`;
  return `${json.replace(/\[\n\s+([^\]{}]+?)\n\s+\]/g, oneLine)}\n`;
}

function namesFor(doc: GlyphDocument, target: GlyphTarget): string[] {
  return Object.keys(doc.glyphs)
    .filter((name) => doc.glyphs[name]?.targets.includes(target))
    .sort();
}

/**
 * One object property the way the formatter prints it, so the generated file passes the lint
 * untouched: on one line when it fits, otherwise broken after the colon, except that a key shorter
 * than five characters never breaks (the overlap would be too small to help).
 */
function property(name: string, value: string, indent: string): string {
  const oneLine = `${indent}${name}: ${value},`;
  if (oneLine.length <= LINE_WIDTH || name.length < 5) return oneLine;
  return `${indent}${name}:\n${indent}  ${value},`;
}

function header(what: string): string[] {
  return [
    "/**",
    ` * ${GENERATED_HEADER} Source: tokens/glyphs.json, compiled by scripts/buildGlyphs.ts.`,
    " *",
    ` * ${what}`,
    " * One icon set: Phosphor, regular weight, with the fill weight where a glyph must read as",
    " * solid, the bold weight for the plus, and the bold dots for More",
    " * (Phosphor Icons, MIT License). Every glyph is one filled path in currentColor.",
    " * Decorative by default: the button or link that holds an icon carries the accessible name.",
    " */",
  ];
}

/** The bold twins of the listed glyphs, as the second registry every Icon reads beside the first. */
function boldRegistry(doc: GlyphDocument, names: string[]): string[] {
  const twins = names.filter((name) => doc.glyphs[name]?.bold !== undefined);
  return [
    "/** Phosphor's bold weight of a regular glyph. A token (component.icon.bold) picks which one shows. */",
    "export const ICON_BOLD_PATHS: Partial<Record<keyof typeof ICON_PATHS, string>> = {",
    ...twins.map((name) => property(name, JSON.stringify(doc.glyphs[name]?.bold ?? ""), "  ")),
    "};",
    "",
  ];
}

export function buildPageRegistry(doc: GlyphDocument): string {
  const lines = [
    ...header("The icon registry for Astro pages."),
    `export const ICON_VIEW_BOX = "${doc.viewBox}";`,
    "",
    "export const ICON_PATHS = {",
    ...namesFor(doc, "page").map((name) =>
      property(name, JSON.stringify(doc.glyphs[name]?.d ?? ""), "  "),
    ),
    "} as const;",
    "",
    "export type IconName = keyof typeof ICON_PATHS;",
    "",
    ...boldRegistry(doc, namesFor(doc, "page")),
  ];
  return lines.join("\n");
}

/** Where an icon lives inside the Phosphor core package. */
export function symbolFile(glyph: Pick<Glyph, "phosphor" | "weight">): string {
  const suffix = glyph.weight === "regular" ? "" : `-${glyph.weight}`;
  return `assets/${glyph.weight}/${glyph.phosphor}${suffix}.svg`;
}

/** Extracts the single path from a Phosphor file. Throws when the file has another shape. */
export function pathFromSvg(svg: string): string {
  const paths = [...svg.matchAll(/<path d="([^"]+)"\s*\/>/g)];
  if (paths.length !== 1 || !paths[0]?.[1]) throw new Error("Expected exactly one path");
  return paths[0][1];
}

/** Rebuilds every path from the installed @phosphor-icons/core package (a dev dependency). */
export function rebuildGlyphs(doc: GlyphDocument): GlyphDocument {
  const root = resolve(ROOT, "node_modules/@phosphor-icons/core");
  const version = (
    JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")) as { version: string }
  ).version;
  const glyphs: Record<string, Glyph> = {};
  for (const [name, glyph] of Object.entries(doc.glyphs)) {
    if (glyph.derived) {
      glyphs[name] = glyph;
      continue;
    }
    const twin = { phosphor: glyph.phosphor, weight: "bold" as const };
    // A bold twin left from an earlier weight would be written as an invalid record.
    const { bold: _stale, ...rest } = glyph;
    glyphs[name] = {
      ...rest,
      d: pathFromSvg(readFileSync(resolve(root, symbolFile(glyph)), "utf8")),
      // A regular glyph keeps a bold twin; fill is already solid and bold is already bold.
      ...(glyph.weight === "regular"
        ? { bold: pathFromSvg(readFileSync(resolve(root, symbolFile(twin)), "utf8")) }
        : {}),
    };
  }
  return { ...doc, sourceVersion: version, glyphs };
}

function writeRegistries(doc: GlyphDocument, check: boolean): number {
  const problems = validateGlyphs(doc);
  if (problems.length > 0) {
    for (const problem of problems) console.error(`glyphs.json: ${problem}`);
    return 1;
  }
  const outputs: Array<[string, string | null]> = [[PAGE_REGISTRY_PATH, buildPageRegistry(doc)]];
  let stale = 0;
  for (const [path, source] of outputs) {
    if (source === null) continue;
    let current = "";
    try {
      current = readFileSync(path, "utf8");
    } catch {
      current = "";
    }
    if (current === source) continue;
    if (check) {
      console.error(`${path} is stale. Run: npm run glyphs`);
      stale += 1;
    } else {
      writeFileSync(path, source, "utf8");
      console.log(`Wrote ${path}`);
    }
  }
  return stale > 0 ? 1 : 0;
}

async function main(): Promise<number> {
  const args = new Set(process.argv.slice(2));
  let doc = loadGlyphs();
  if (args.has("--fetch")) {
    doc = rebuildGlyphs(doc);
    writeFileSync(GLYPHS_PATH, serializeGlyphs(doc), "utf8");
    console.log(`Rebuilt ${Object.keys(doc.glyphs).length} glyphs at ${doc.sourceVersion}`);
  }
  return writeRegistries(doc, args.has("--check"));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then(
    (code) => process.exit(code),
    (error: unknown) => {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    },
  );
}
