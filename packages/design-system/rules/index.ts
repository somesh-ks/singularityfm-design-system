/**
 * The design system's lint rules, as plain functions of a file's text and path: no I/O, so the app's
 * design-check, `ds validate` and a later MCP call run the same code. Each returns findings; `validate`
 * runs every rule that reads the file's kind. Biome runs the raw colour rule on CSS through
 * `rules/raw-colour.grit` (rules/biome.json); markup is not parsed by Biome, so it stays here.
 */
import { COMPONENTS } from "../src/registry";
import system from "../tokens/system.json" with { type: "json" };
import { GRID_EXCEPTIONS, RETIRED_PATHS } from "./data";

export { GRID_EXCEPTIONS, RETIRED_PATHS, type RetiredPath } from "./data";

export interface Finding {
  rule: string;
  file: string;
  line: number;
  message: string;
  severity: "error" | "warning";
  /** The text to write instead, when there is one. */
  fix?: string;
}

const PACKAGE = "@singularityfm/design-system";

const lineAt = (text: string, index: number): number => text.slice(0, index).split("\n").length;

/** Blanks what a pattern matches, keeping every newline, so an index still finds its line. */
const blank = (text: string, pattern: RegExp): string =>
  text.replace(pattern, (match) => match.replace(/[^\n]/g, " "));

const withoutCssComments = (css: string): string => blank(css, /\/\*[\s\S]*?\*\//g);

/** Comments in markup and script: block, HTML, and `//` lines (not the `//` of a URL). */
const withoutCodeComments = (code: string): string =>
  blank(code, /\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|(?<![:/\w"'`])\/\/[^\n]*/g);

const posix = (file: string): string => file.split("\\").join("/");
const isCss = (file: string): boolean => /\.css$/.test(file);
const isCode = (file: string): boolean => /\.(?:astro|[cm]?[jt]sx?)$/.test(file);
/** The token files, where a raw value is the point. */
const isTokenFile = (file: string): boolean =>
  /(?:^|\/)styles\/tokens\.css$|(?:^|\/)tokens\/[^/]+\.json$/.test(posix(file));

/** The path inside the package when the file is one of the library's own, else undefined. */
const packagePath = (file: string): string | undefined =>
  /(?:^|\/)(?:packages|@singularityfm|@singularity)\/design-system\/(.+)$/.exec(posix(file))?.[1];

const escapeRegex = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** A selector fragment as a whole name: `.aside` matches `.aside:hover`, not `.aside-x`. */
const wholeName = (fragment: string): RegExp => new RegExp(`${escapeRegex(fragment)}(?![\\w-])`);

interface Declaration {
  selector: string;
  property: string;
  value: string;
  /** Where the property starts in the stylesheet. */
  index: number;
}

/** Every declaration of every innermost rule, with its selector. */
function declarations(css: string): Declaration[] {
  return [...css.matchAll(/([^{}]*)\{([^{}]*)\}/g)].flatMap((rule) => {
    const [, selector = "", body = ""] = rule;
    const bodyStart = (rule.index ?? 0) + selector.length + 1;
    return [...body.matchAll(/(^|;)(\s*)([\w-]+)\s*:\s*([^;]+)/g)].map((match) => ({
      selector: selector.trim(),
      property: match[3] ?? "",
      value: (match[4] ?? "").trim(),
      index: bodyStart + (match.index ?? 0) + (match[1]?.length ?? 0) + (match[2]?.length ?? 0),
    }));
  });
}

/** The text inside the parentheses that open at `open`. */
function argumentsAt(text: string, open: number): string {
  let depth = 0;
  for (let at = open; at < text.length; at += 1) {
    if (text[at] === "(") depth += 1;
    else if (text[at] === ")" && --depth === 0) return text.slice(open + 1, at);
  }
  return text.slice(open + 1);
}

const HEX = /(?<![\w&-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g;
const COLOUR_FUNCTION = /(?<![\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/gi;

/** Raw colours in a piece of text, as [index, literal]. A colour function that reads var() is a token's. */
function rawColours(text: string): [number, string][] {
  const hex = [...text.matchAll(HEX)].map((m): [number, string] => [m.index ?? 0, m[0]]);
  const functions = [...text.matchAll(COLOUR_FUNCTION)]
    .filter((m) => !/var\(/.test(argumentsAt(text, (m.index ?? 0) + m[0].length - 1)))
    .map((m): [number, string] => [m.index ?? 0, m[0]]);
  return [...hex, ...functions].sort((a, b) => a[0] - b[0]);
}

/**
 * Prevents colour drifting out of the token files: a hex or a literal rgb(), hsl() or oklch() ships a
 * colour that dark mode, the moods, forced colours and the contrast sweep never see.
 */
export function rawColour(text: string, file: string): Finding[] {
  if (isTokenFile(file) || !(isCss(file) || isCode(file))) return [];
  const finding = (index: number, literal: string): Finding => ({
    rule: "raw-colour",
    file,
    line: lineAt(text, index),
    message: `${literal} is a raw colour; read a colour token (pnpm run ds token color)`,
    severity: "error",
  });
  if (isCode(file))
    return rawColours(withoutCodeComments(text)).map(([at, literal]) => finding(at, literal));
  return declarations(withoutCssComments(text)).flatMap(({ value, index, property }) =>
    rawColours(value).map(([, literal]) => finding(index + property.length, literal)),
  );
}

const SPACING =
  /^(?:margin|padding|gap|row-gap|column-gap|inset|top|right|bottom|left|scroll-margin|scroll-padding)(?:-[a-z-]+)?$/;
/** Tokens that are a part's own geometry (an icon, a touch target, a stroke), not spacing. */
const DIMENSION =
  /size|height|width|thumb|track|icon|touch|stroke|hairline|ring|cover|avatar|fab|glyph|radius|shape|font|leading|dock|bar|room|safe|keyboard|nav|sticky|measure|travel|ink|range|scrubber|switch|chip|player|gutter|top/;
const TOKEN_VALUES = new Map(system.tokens.map((token) => [token.name, token.light]));

/** A spacing term in pixels, through the library's tokens; null when it is not a fixed length. */
function pixels(term: string, depth = 0): number | null {
  if (depth > 8) return null;
  let failed = false;
  const numeric = term
    .replace(/var\((--[\w-]+)(?:,[^()]*)?\)/g, (_, name: string) => {
      const value = TOKEN_VALUES.get(name);
      const resolved = DIMENSION.test(name) || !value ? null : pixels(value, depth + 1);
      if (resolved === null) failed = true;
      return `(${resolved ?? 0})`;
    })
    .replace(/calc\(/g, "(")
    .replace(/(-?\d*\.?\d+)rem\b/g, (_, n: string) => `(${Number(n) * 16})`)
    .replace(/(-?\d*\.?\d+)px\b/g, "($1)");
  if (failed || !/^[\d\s.+\-*/()]+$/.test(numeric)) return null;
  const value = Number(Function(`"use strict"; return (${numeric});`)());
  return Number.isFinite(value) ? Math.round(value * 100) / 100 : null;
}

/** A value's space-separated terms, keeping a calc() whole. */
function terms(value: string): string[] {
  const out = [""];
  let depth = 0;
  for (const character of value) {
    depth += character === "(" ? 1 : character === ")" ? -1 : 0;
    if (/\s/.test(character) && depth === 0) out.push("");
    else out[out.length - 1] += character;
  }
  return out.filter(Boolean);
}

/**
 * Prevents spacing off the 8pt grid: a 12px gap beside a 16px one, or a 4px one between two rows,
 * reads as rows touching. A raw length or a token (followed to pixels) must land on 8, 16, 24 and
 * up; 4px only in a rule GRID_EXCEPTIONS names.
 */
export function offGrid(text: string, file: string): Finding[] {
  if (!isCss(file) || isTokenFile(file)) return [];
  return declarations(withoutCssComments(text))
    .filter(({ property }) => SPACING.test(property))
    .flatMap(({ selector, property, value, index }) =>
      terms(value).flatMap((term) => {
        const resolved = pixels(term);
        if (resolved === null || resolved % 8 === 0) return [];
        const named = GRID_EXCEPTIONS.some(([allowed]) => wholeName(allowed).test(selector));
        if (Math.abs(resolved) === 4 && named) return [];
        return [
          {
            rule: "off-grid",
            file,
            line: lineAt(text, index),
            message: `${selector} { ${property}: ${term} } is ${resolved}px, off the 8pt grid`,
            severity: "error" as const,
          },
        ];
      }),
    );
}

/** The tokens, and the properties the library's stylesheets declare (a type role's parts, the insets). */
const LIBRARY_PROPERTIES = new Set([
  ...system.tokens.map((token) => token.name),
  ...system.properties,
]);

/**
 * Prevents a read of a property nothing defines: `var(--space-5)` with no --space-5 is no error to
 * the browser, which drops the whole declaration silently. A read with a fallback is an input that a
 * script or a caller may set, so it passes, as does any name the file itself declares or sets.
 */
export function unknownProperty(text: string, file: string): Finding[] {
  if (isTokenFile(file) || !(isCss(file) || isCode(file))) return [];
  const source = isCss(file) ? withoutCssComments(text) : withoutCodeComments(text);
  const declared = new Set(
    [
      ...source.matchAll(/(--[\w-]+)\s*:/g),
      ...source.matchAll(/@property\s+(--[\w-]+)/g),
      ...source.matchAll(/["'`](--[\w-]+)["'`]/g),
    ].map((match) => match[1]),
  );
  return [...source.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)]
    .filter(([, name = ""]) => !LIBRARY_PROPERTIES.has(name) && !declared.has(name))
    .map((match) => ({
      rule: "unknown-property",
      file,
      line: lineAt(text, match.index ?? 0),
      message: `${match[1]} is neither a library property nor declared in this file`,
      severity: "error",
    }));
}

/** Each class a component draws, or replaced, with the component and the files that may write it. */
const CLASS_OWNERS = new Map(
  COMPONENTS.flatMap((component) => {
    // Its parts' files, else the files named for it (avatar.ts, Avatar.astro), and the registry.
    const module = component.sheet
      .replace(/\.css$/, "")
      .replace(/-(\w)/g, (_, c: string) => c.toUpperCase());
    const name = component.name.replace(/ (\w)/g, (_, c: string) => c.toUpperCase());
    const own = new Set([
      ...system.parts
        .filter((part) => part.classes.some((name) => component.classes.includes(name)))
        .flatMap((part) => part.files ?? [])
        .map((path) => path.replace(/^packages\/design-system\//, "")),
      ...[`${module}.ts`, `${name}.astro`, `${name}.tsx`, "registry.ts"].map(
        (file) => `src/${file}`,
      ),
    ]);
    return [...component.classes, ...component.retired].map(
      (name) =>
        [
          name,
          { component: component.name, retired: component.retired.includes(name), own },
        ] as const,
    );
  }),
);
const CLASS_NAME = new RegExp(
  `(?<![\\w-])(?:${[...CLASS_OWNERS.keys()]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex)
    .join("|")})(?![\\w-])`,
  "g",
);

/**
 * Prevents a page drawing a component by its class (D237: a page draws the component and never
 * types its class): `<button class="button-filled">` beside the Button, or `<Button
 * className="button-small">` where the component has a prop. A class is read in any string, as a
 * script sets it too; an import path is not a class. A hook class of the page's own on a component
 * (`<Icon class="fav-add">`) is not the component's class and passes.
 */
export function classOnComponent(text: string, file: string): Finding[] {
  if (!isCode(file)) return [];
  const own = packagePath(file);
  const code = blank(withoutCodeComments(text), /\b(?:from|import)\s*\(?\s*(["'])[^"'\n]*\1/g);
  return [...code.matchAll(/(["'`])((?:\\.|(?!\1)[^\\])*)\1/g)].flatMap((string) =>
    [...(string[2] ?? "").matchAll(CLASS_NAME)].flatMap((match) => {
      const name = match[0];
      const owner = CLASS_OWNERS.get(name);
      if (!owner || (own && owner.own.has(own))) return [];
      const index = (string.index ?? 0) + 1 + (match.index ?? 0);
      const tag = /<([A-Z][\w.]*)\b[^<>]*$/.exec(code.slice(0, index))?.[1];
      const message = owner.retired
        ? `${name} is a retired class; draw ${owner.component} instead`
        : tag
          ? `<${tag}> takes ${name} from its props, never from a class`
          : `${name} is ${owner.component}'s class; draw ${owner.component} instead of typing it`;
      return [
        {
          rule: "class-on-component",
          file,
          line: lineAt(text, index),
          message,
          severity: "error" as const,
        },
      ];
    }),
  );
}

/**
 * Prevents an import of a path the package retired: a deprecated one still works (a warning naming
 * its replacement), a removed one breaks the build on the next bump (an error).
 */
export function retiredPath(text: string, file: string): Finding[] {
  if (!isCode(file) && !isCss(file)) return [];
  return [
    ...withoutCodeComments(text).matchAll(/\b(?:from|import)\s*\(?\s*(["'])([^"'\n]+)\1/g),
  ].flatMap((match) => {
    // shortcut: the app and the style guide import the package as @singularity/design-system until
    // app #772 renames the alias; drop the rewrite once no workspace uses the old name.
    const path = (match[2] ?? "").replace(/^@singularity\/design-system\//, `${PACKAGE}/`);
    const retired = RETIRED_PATHS.find((entry) => entry.path === path);
    if (!retired) return [];
    return [
      {
        rule: "retired-path",
        file,
        line: lineAt(text, match.index ?? 0),
        message: `${match[2]} is ${retired.severity === "error" ? "removed" : "deprecated"}; import ${retired.use}`,
        severity: retired.severity,
        fix: retired.use,
      },
    ];
  });
}

export const RULES = [rawColour, offGrid, unknownProperty, classOnComponent, retiredPath];

/** Every rule's findings for one file, in line order. */
export function validate(text: string, file: string): Finding[] {
  return RULES.flatMap((rule) => rule(text, file)).sort((a, b) => a.line - b.line);
}
