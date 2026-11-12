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

/** The props of the component whose source is given. */
export function propsTable(source: string): PropsTable {
  const frontmatter = source.startsWith("---") ? (source.split("---")[1] ?? "") : source;
  const rows: PropRow[] = [];
  const declared = /interface\s+(?:Props|\w+Props)\s*\{/.exec(frontmatter);
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
  const element =
    /(?:HTMLAttributes|ComponentProps)<"(\w+)">/.exec(frontmatter)?.[1] ??
    /(Button|Input)HTMLAttributes/.exec(frontmatter)?.[1]?.toLowerCase();
  return { rows, ...(element ? { element } : {}) };
}
