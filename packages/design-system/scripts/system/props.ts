/**
 * A component's props, read from its own source so the table cannot drift from it: the members of its
 * Props interface (name, type, the comment above it) and the defaults its destructuring writes.
 * Attributes it passes through to the element are named in one line, not listed. The system build
 * writes them into tokens/system.json, where the style guide, `ds part` and an agent all read them.
 */
export interface PropRow {
  name: string;
  type: string;
  required: boolean;
  default: string;
  description: string;
  /** The choices, when the type is a named union of strings the package exports (ButtonVariant). */
  values?: string[];
}

export interface PropsTable {
  rows: PropRow[];
  /** The element whose attributes it also takes, when it passes them on. */
  element?: string;
}

const OPENERS = "{([<";
const CLOSERS = "})]>";

/** The text between the braces that open at `from`, braces matched. */
function block(source: string, from: number): string {
  let depth = 0;
  for (let i = from; i < source.length; i++) {
    if (source[i] === "{") depth++;
    if (source[i] === "}" && --depth === 0) return source.slice(from + 1, i);
  }
  return "";
}

/** Splits at `separator` where no bracket is open. */
function splitTop(text: string, separator: RegExp): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  let quote = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i] ?? "";
    if (quote) {
      if (c === quote && text[i - 1] !== "\\") quote = "";
      continue;
    }
    if (c === '"' || c === "'" || c === "`") quote = c;
    else if (c === "=" && text[i + 1] === ">") i++;
    else if (OPENERS.includes(c)) depth++;
    else if (CLOSERS.includes(c)) depth--;
    else if (depth === 0 && separator.test(c)) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts;
}

const tidy = (text: string): string => text.replace(/\s+/g, " ").trim();

function defaults(source: string): Map<string, string> {
  const found = new Map<string, string>();
  const match = /\{([^}]*(?:\{[^}]*\}[^}]*)*)\}\s*(?:=\s*Astro\.props|:\s*Props)/.exec(source);
  if (!match?.[1]) return found;
  for (const part of splitTop(match[1], /,/)) {
    const equals = splitTop(part, /=/);
    if (equals.length < 2) continue;
    const name = (equals[0] ?? "").split(":")[0]?.trim() ?? "";
    found.set(name, tidy(equals.slice(1).join("=")));
  }
  return found;
}

/** The tag of a DOM interface, where it is not the interface's name in lower case. */
const TAGS: Record<string, string> = {
  Anchor: "a",
  Image: "img",
  OList: "ol",
  Paragraph: "p",
  TableCell: "td",
  TableRow: "tr",
  UList: "ul",
};

/**
 * The element whose attributes the component passes on: the one its `Props` type takes them from
 * (`Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, ...>`), not the first named in the file, which
 * may type a child (SegmentedChoice's inputs). A heading's level comes from the tag it renders.
 */
function passedTo(source: string): string | undefined {
  // The Props declaration to its last line: an interface's closing brace, or an alias's line that
  // ends it with a semicolon. A file whose Props name no element (it types the attributes where the
  // function takes them) is read whole.
  const start = /^(?:export\s+)?(?:type\s+Props\s*=|interface\s+Props\b)/m.exec(source)?.index;
  const rest = start === undefined ? "" : source.slice(start);
  const end = /^(?:\}|\S.*;)\s*$/m.exec(rest);
  const declared = end ? rest.slice(0, end.index + end[0].length) : rest;
  const tag = (text: string): string | undefined => {
    const named = /ComponentProps<"(\w+)">/.exec(text)?.[1];
    if (named) return named;
    const dom = /HTMLAttributes<HTML(\w+)Element>/.exec(text)?.[1];
    if (!dom) return undefined;
    if (dom === "Heading") return /<(h[1-6])\b/.exec(source)?.[1];
    return TAGS[dom] ?? dom.toLowerCase();
  };
  return tag(declared) ?? tag(source);
}

/**
 * The order every props table reads in, whatever order a source declares its props: what it says and
 * shows, then how it looks, then where it goes and what it is wired to, then its value, then the hooks
 * a page places it by (owner, 2026-11-13: "order the parameters right so it makes natural sense").
 * A prop the list does not name fails system.test.ts, so a new one is given its place.
 */
export const PROP_ORDER: readonly string[] = [
  // What it says and shows
  "name",
  "region",
  "label",
  "title",
  "subtitle",
  "text",
  "body",
  "icon",
  "iconFrom",
  "photo",
  "action",
  "sections",
  "tabs",
  "options",
  "children",
  "after",
  // How it looks
  "variant",
  "tone",
  "kind",
  "size",
  "shape",
  "compact",
  "primary",
  "hue",
  "wavy",
  "scroll",
  "multiline",
  "maxLines",
  "stacked",
  "flush",
  "clearable",
  "tonal",
  "rowEnd",
  // Where it goes and what it is wired to
  "href",
  "target",
  "rel",
  "form",
  "close",
  "copy",
  "copied",
  "id",
  "titleId",
  "titleData",
  "bodyId",
  // Its value
  "state",
  "defaultValue",
  "value",
  "onValueChange",
  // How a page places it
  "reserve",
  "className",
  "slot",
  "style",
];

/** A prop's place in PROP_ORDER; one the list does not name goes last, where the test finds it. */
const place = (name: string): number => {
  const at = PROP_ORDER.indexOf(name);
  return at === -1 ? PROP_ORDER.length : at;
};

/** The props of the component whose source is given. */
export function propsTable(source: string): PropsTable {
  const frontmatter = source.startsWith("---") ? (source.split("---")[1] ?? "") : source;
  const rows: PropRow[] = [];
  // The members sit in a `Props` interface, or in the object a `type Props = ... & {` alias adds.
  const declared =
    /interface\s+(?:Props|\w+Props)\s*\{/.exec(frontmatter) ??
    /type\s+Props\s*=[^;{]*&\s*\{/.exec(frontmatter);
  const given = defaults(frontmatter);
  if (declared) {
    // Comments come out first, so a quote or a semicolon in one cannot split a member.
    const comments: string[] = [];
    const body = block(frontmatter, declared.index + declared[0].length - 1).replace(
      /\/\*\*([\s\S]*?)\*\//g,
      (_, text: string) => `@@c${comments.push(text) - 1}@@`,
    );
    for (const member of splitTop(body.replace(/\/\/.*$/gm, ""), /;/)) {
      const marked = /@@c(\d+)@@/.exec(member);
      const comment = marked ? comments[Number(marked[1])] : "";
      const code = member.replace(/@@c\d+@@/g, "");
      const named = /^\s*(\[[^\]]+\]|[\w"-]+)(\?)?\s*:\s*([\s\S]+)$/.exec(code);
      if (!named?.[1] || named[1].startsWith("[")) continue;
      const name = named[1];
      rows.push({
        name,
        type: tidy(named[3] ?? ""),
        required: !named[2],
        default: given.get(name) ?? "",
        description: tidy((comment ?? "").replace(/^\s*\*/gm, "")),
      });
    }
  }
  rows.sort((a, b) => place(a.name) - place(b.name));
  const element = passedTo(frontmatter);
  return { rows, ...(element ? { element } : {}) };
}
