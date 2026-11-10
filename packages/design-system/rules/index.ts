/**
 * The design system's lint rules, as plain functions of a file's text and path: no I/O, so the app's
 * design-check, `ds validate` and a later MCP call run the same code. Each returns findings; `validate`
 * runs every rule that reads the file's kind. Biome runs the raw colour rule on CSS through
 * `rules/raw-colour.grit` (rules/biome.json); markup is not parsed by Biome, so it stays here.
 */
import { COMPONENTS } from "../src/registry";
import system from "../tokens/system.json" with { type: "json" };
import { GRID_EXCEPTIONS, PX_EXCEPTIONS, RETIRED_PATHS } from "./data";

export { GRID_EXCEPTIONS, PX_EXCEPTIONS, RETIRED_PATHS, type RetiredPath } from "./data";

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
  /** The rule's selector as written, for a message. */
  selector: string;
  /** Each selector the declaration applies to, nesting resolved: `.a, .b { &:hover {} }` is two. */
  selectors: string[];
  property: string;
  value: string;
  /** Where the property starts in the stylesheet. */
  index: number;
}

/** A selector list's members, split on the commas outside parentheses, brackets and quotes. */
function selectorList(text: string): string[] {
  const out = [""];
  let depth = 0;
  let quote = "";
  for (const character of text) {
    if (quote) quote = character === quote ? "" : quote;
    else if (character === '"' || character === "'") quote = character;
    else depth += "([".includes(character) ? 1 : ")]".includes(character) ? -1 : 0;
    if (character === "," && depth === 0 && !quote) out.push("");
    else out[out.length - 1] += character;
  }
  return out.map((selector) => selector.trim()).filter(Boolean);
}

/** A nested list under its parents: `&` takes each parent's place, else the rule is a descendant. */
const nest = (parents: string[], children: string[]): string[] =>
  parents.length === 0
    ? children
    : parents.flatMap((parent) =>
        children.map((child) =>
          child.includes("&") ? child.split("&").join(parent) : `${parent} ${child}`,
        ),
      );

/**
 * The stylesheet with each brace and semicolon inside a quoted string made a space, reading quotes and
 * backslash escapes as CSS's tokenizer does.
 */
function quotedStructure(css: string): string {
  let out = "";
  let quote = "";
  for (let at = 0; at < css.length; at += 1) {
    const character = css[at] ?? "";
    // An escape is two characters wherever it stands: `url(it\'s.svg)` opens no string.
    if (character === "\\") {
      out += css.slice(at, at + 2).replace(/[{};]/g, " ");
      at += 1;
      continue;
    }
    if (quote) quote = character === quote ? "" : quote;
    else if (character === '"' || character === "'") quote = character;
    out += quote && "{};".includes(character) ? " " : character;
  }
  return out;
}

/**
 * Every declaration at every nesting level, with the selectors it applies to: a parent keeps its own
 * declarations beside a nested rule, and an at-rule (`@media`) passes its parent's selectors through.
 */
function declarations(css: string): Declaration[] {
  // The walk reads `mask`, where a brace or semicolon inside a quoted value (`content: "}"`) is a
  // space; the selectors and values come from `css` at the same indices.
  const mask = quotedStructure(css);
  const out: Declaration[] = [];
  const stack: { written: string; selectors: string[] }[] = [];
  const read = (from: number, to: number) => {
    const rule = stack.at(-1);
    if (!rule) return;
    for (const match of mask.slice(from, to).matchAll(/(^|;)(\s*)([\w-]+)\s*:\s*([^;]+)/g)) {
      const end = from + (match.index ?? 0) + match[0].length;
      out.push({
        selector: rule.written,
        selectors: rule.selectors,
        property: match[3] ?? "",
        value: css.slice(end - (match[4]?.length ?? 0), end).trim(),
        index: from + (match.index ?? 0) + (match[1]?.length ?? 0) + (match[2]?.length ?? 0),
      });
    }
  };
  let start = 0;
  for (let at = 0; at < mask.length; at += 1) {
    if (mask[at] === "{") {
      // Declarations end at the last semicolon; what follows it is the nested rule's prelude.
      const end = mask.lastIndexOf(";", at - 1) + 1;
      if (end > start) read(start, end);
      const prelude = css.slice(Math.max(start, end), at).trim();
      const parents = stack.at(-1)?.selectors ?? [];
      const selectors = prelude.startsWith("@")
        ? parents.length > 0
          ? parents
          : [prelude]
        : nest(parents, selectorList(prelude));
      stack.push({
        written: prelude.startsWith("@") ? (stack.at(-1)?.written ?? prelude) : prelude,
        selectors,
      });
      start = at + 1;
    } else if (mask[at] === "}") {
      read(start, at);
      stack.pop();
      start = at + 1;
    }
  }
  return out;
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

/**
 * Raw colours in a piece of text, as [index, literal]. A colour function that reads var() is a
 * token's; a url() names a resource (`url(#gradient)`), never a colour.
 */
function rawColours(source: string): [number, string][] {
  const text = blank(source, /url\([^)]*\)/gi);
  const hex = [...text.matchAll(HEX)].map((m): [number, string] => [m.index ?? 0, m[0]]);
  const functions = [...text.matchAll(COLOUR_FUNCTION)]
    .filter((m) => !/var\(/.test(argumentsAt(text, (m.index ?? 0) + m[0].length - 1)))
    .map((m): [number, string] => [m.index ?? 0, m[0]]);
  return [...hex, ...functions].sort((a, b) => a[0] - b[0]);
}

/**
 * Strings in markup and script that hold a reference, never a colour: a link or an id
 * (`href="#abc"`), and a selector or a hash a script reads (`querySelector("#face")`).
 */
const withoutReferences = (code: string): string =>
  blank(
    blank(
      code,
      /\b(?:href|src|srcset|action|formaction|for|id|list|form|usemap|poster|xlink:href|aria-[\w-]+)\s*=\s*\{?\s*(["'`])[^"'`\n]*\1/gi,
    ),
    /\b(?:querySelector(?:All)?|getElementById|closest|matches|hash\s*(?:[!=]==?|=))\s*\(?\s*(["'`])[^"'`\n]*\1/g,
  );

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
    return rawColours(withoutReferences(withoutCodeComments(text))).map(([at, literal]) =>
      finding(at, literal),
    );
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
    // Through Number, so a leading zero (08px) is 8 and never strict mode's octal error.
    .replace(/(-?\d*\.?\d+)(?:px\b)?/g, (_, n: string) => `(${Number(n)})`);
  if (failed || !/^[\d\s.+\-*/()]+$/.test(numeric)) return null;
  try {
    const value = Number(Function(`"use strict"; return (${numeric});`)());
    return Number.isFinite(value) ? Math.round(value * 100) / 100 : null;
  } catch {
    // An expression that is not arithmetic (a stray operator) is no fixed length.
    return null;
  }
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
 * up; 4px only in a rule GRID_EXCEPTIONS, or the caller's own `exceptions`, names. A 1px offset is
 * a hairline's (a border overlap, the visually hidden pattern's -1px margin), not spacing.
 */
export function offGrid(
  text: string,
  file: string,
  exceptions: readonly [selector: string, reason: string][] = [],
): Finding[] {
  if (!isCss(file) || isTokenFile(file)) return [];
  return declarations(withoutCssComments(text))
    .filter(({ property }) => SPACING.test(property))
    .flatMap(({ selector, selectors, property, value, index }) =>
      terms(value).flatMap((term) => {
        const resolved = pixels(term);
        if (resolved === null || resolved % 8 === 0 || Math.abs(resolved) === 1) return [];
        // Each selector in the list must be named: an exception covers its rule, not a neighbour.
        const allowed = [...GRID_EXCEPTIONS, ...exceptions].map(([name]) => wholeName(name));
        const named = selectors.every((one) => allowed.some((name) => name.test(one)));
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

/** Quoted text and url() arguments, blanked: `content: "12px"` and a file name hold no length. */
const withoutStrings = (value: string): string =>
  blank(value, /(["'])(?:\\.|(?!\1)[^\\])*\1|url\([^)]*\)/g);

// Not after a letter, digit, dot, # or `name-` (an identifier such as a-12px); a sign (-6px) is a length.
const PIXELS = /(?<![\w.#])(?<![a-zA-Z]-)(\d*\.?\d+)px\b/g;

/**
 * Prevents a pixel length written into a stylesheet (owner, 2026-11-10: "avoid pixel values as hardcoded
 * thing, as a rule"). A length is a token, rem, em, ch, lh, a percentage or a calc() of those, so it
 * follows the reader's text size, the mood and the words it holds; a width found by measuring one
 * state's words is a number that goes stale in the next. Zero (0px, which a calc() or a registered
 * property needs) and the 1px hairline pass. A media or container query reads rem too; a feature query
 * (@supports) tests a value and is not read. An exception names its rule, with the reason (PX_EXCEPTIONS,
 * or the caller's own here; through `ds validate`, the exceptions file's `exempt`).
 */
export function rawPixels(
  text: string,
  file: string,
  exceptions: readonly [selector: string, reason: string][] = [],
): Finding[] {
  if (!isCss(file) || isTokenFile(file)) return [];
  const css = withoutCssComments(text);
  const allowed = [...PX_EXCEPTIONS, ...exceptions].map(([name]) => wholeName(name));
  const found = (value: string, index: number, where: string): Finding[] =>
    [...withoutStrings(value).matchAll(PIXELS)]
      .filter((match) => ![0, 1].includes(Number(match[1])))
      .map((match) => ({
        rule: "raw-px",
        file,
        line: lineAt(text, index),
        message: `${where} writes ${match[0]}; use a token, rem, em, ch or a calc() of them`,
        severity: "error" as const,
      }));
  const inDeclarations = declarations(css)
    // Each selector in the list must be named: an exception covers its rule, not a neighbour.
    .filter(({ selectors }) => !selectors.every((one) => allowed.some((name) => name.test(one))))
    .flatMap(({ selector, property, value, index }) =>
      found(value, index, `${selector} { ${property} }`),
    );
  const inQueries = [...css.matchAll(/@(?:media|container)\b[^{]*/g)].flatMap((match) =>
    found(match[0], match.index ?? 0, match[0].trim()),
  );
  return [...inDeclarations, ...inQueries].sort((a, b) => a.line - b.line);
}

/** The tokens, and the properties the library's stylesheets declare (a type role's parts, the insets). */
const LIBRARY_PROPERTIES = new Set([
  ...system.tokens.map((token) => token.name),
  ...system.properties,
]);

const withoutComments = (text: string, file: string): string =>
  isCss(file) ? withoutCssComments(text) : withoutCodeComments(text);

/**
 * The custom properties a file declares, sets with setProperty, or keys in a style object (a markup
 * file's `style` attribute declares too).
 */
export function declaredProperties(text: string, file: string): Set<string> {
  if (!(isCss(file) || isCode(file))) return new Set();
  const source = withoutComments(text, file);
  return new Set(
    [
      ...source.matchAll(/(--[\w-]+)\s*:/g),
      ...source.matchAll(/@property\s+(--[\w-]+)/g),
      // A script's write and a style object's key; a getPropertyValue read declares nothing.
      ...source.matchAll(/setProperty\(\s*["'`](--[\w-]+)["'`]/g),
      ...source.matchAll(/["'`](--[\w-]+)["'`]\s*:/g),
    ].map((match) => match[1] ?? ""),
  );
}

/**
 * Prevents a read of a property nothing defines: `var(--space-5)` with no --space-5 is no error to
 * the browser, which drops the whole declaration silently. A read with a fallback is an input that a
 * script or a caller may set, so it passes, as does any name the file itself declares, sets with
 * setProperty, or keys in a style object, and any name in `declared`: what the other files validated
 * with it declare (a page's style attribute sets what its stylesheet reads).
 */
export function unknownProperty(
  text: string,
  file: string,
  declared: ReadonlySet<string> = new Set(),
): Finding[] {
  if (isTokenFile(file) || !(isCss(file) || isCode(file))) return [];
  const source = withoutComments(text, file);
  const own = declaredProperties(text, file);
  return [...source.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)]
    .filter(
      ([, name = ""]) => !LIBRARY_PROPERTIES.has(name) && !own.has(name) && !declared.has(name),
    )
    .map((match) => ({
      rule: "unknown-property",
      file,
      line: lineAt(text, match.index ?? 0),
      message: `${match[1]} is neither a library property nor declared in the files validated`,
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

export const RULES = [
  rawColour,
  offGrid,
  rawPixels,
  unknownProperty,
  classOnComponent,
  retiredPath,
];

export interface ValidateOptions {
  /** The caller's own 4px cases, as offGrid takes them. */
  gridExceptions?: readonly [selector: string, reason: string][];
  /** Properties the other files validated with this one declare (declaredProperties of each). */
  declared?: ReadonlySet<string>;
}

/** Every rule's findings for one file, in line order. */
export function validate(text: string, file: string, options: ValidateOptions = {}): Finding[] {
  // Every rule in RULES runs; the two that take a caller's list get it.
  return RULES.flatMap((rule) =>
    rule === offGrid
      ? offGrid(text, file, options.gridExceptions)
      : rule === unknownProperty
        ? unknownProperty(text, file, options.declared)
        : rule(text, file),
  ).sort((a, b) => a.line - b.line);
}
