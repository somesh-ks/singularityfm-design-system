/** Answers "which part" and "which token" from a built system, so an agent need not grep stylesheets. */
import { RETIRED_PATHS } from "../../rules/data.js";

import type { Component, Part, System, SystemToken } from "./types.js";

// "action" is a stop word: nearly every part is one, so it ranked first whichever part names it most
// often (the side column's Catch up beat Dialog for "confirm before an action that cannot be undone").
const STOP = new Set(
  "a an the to of for in on at by with and or is are be it its this that new add make let want need user users page pages when where how what which should would can show use using get have has from into as action actions".split(
    " ",
  ),
);

/** A crude stem: enough to match "sorting" with "sort" and "tabs" with "tab". */
export function stem(word: string): string {
  let w = word.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const suffix of ["ing", "ed", "es", "s"])
    if (w.length > suffix.length + 2 && w.endsWith(suffix)) {
      w = w.slice(0, -suffix.length);
      if (/([a-z])\1$/.test(w) && suffix !== "es" && suffix !== "s") w = w.slice(0, -1);
      break;
    }
  return w;
}

/** Words people use for a token family, mapped to the word the token is named by. */
const TOKEN_WORDS: Record<string, string[]> = {
  corner: ["radius"],
  round: ["radius"],
  rounded: ["radius"],
  background: ["surface", "bg"],
  fill: ["surface"],
  tonal: ["container"],
  text: ["on-surface"],
  ink: ["on-surface"],
  padding: ["space"],
  margin: ["space"],
  gap: ["space"],
  spacing: ["space"],
  animation: ["duration", "ease"],
  transition: ["duration", "ease"],
  easing: ["ease"],
  elevation: ["shadow"],
  border: ["border", "stroke"],
  outline: ["border", "stroke"],
  divider: ["border-hairline"],
  size: ["size"],
  vibration: ["haptic"],
  vibrate: ["haptic"],
  buzz: ["haptic"],
  feedback: ["haptic"],
  error: ["danger"],
  dim: ["scrim"],
};

export function terms(text: string): string[] {
  return text
    .split(/[\s\-_/.,;:()'"`]+/)
    .filter((word) => word && !STOP.has(word.toLowerCase()))
    .map(stem)
    .filter(Boolean);
}

function weigh(query: string[], text: string, weight: number): number {
  const words = new Set(terms(text));
  let score = 0;
  for (const term of query) if (words.has(term)) score += weight;
  return score;
}

export interface PartHit {
  part: Part;
  score: number;
}

/** Parts ranked by how well a need matches what they are for. Nothing matched returns []. */
export function findParts(system: System, need: string, limit = 3): PartHit[] {
  const query = terms(need);
  if (query.length === 0) return [];
  return system.parts
    .map((part) => {
      let score = 0;
      score += weigh(query, `${part.id} ${part.name}`, 3);
      score += weigh(query, (part.keywords ?? []).join(" "), 3);
      for (const when of part.when) score += weigh(query, when, 2);
      score += weigh(query, part.summary, 1.5);
      // An experimental option is found by its name, as a variant is ("clearable search field").
      score += weigh(
        query,
        (part.experimental ?? []).map((item) => `${item.option} experimental`).join(" "),
        2,
      );
      // A need that reads like what a part is not for counts against it; the neighbor named there wins.
      // A word the part names itself by ("button" for a Filled button) is not evidence against it: its
      // "not" lines say "button" too, and four of them took 4 points off "primary call to action button".
      const own = new Set(terms(`${part.id} ${part.name} ${(part.keywords ?? []).join(" ")}`));
      const against = query.filter((term) => !own.has(term));
      for (const item of part.not ?? []) score -= weigh(against, item.when, 1);
      return { part, score };
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.part.id.localeCompare(b.part.id))
    .slice(0, limit);
}

/** What replaces a retired import path, named whole or by its last part (`Button.astro`). */
export function replacementFor(name: string): string | undefined {
  const wanted = name.trim();
  return RETIRED_PATHS.find((entry) => entry.path === wanted || entry.path.endsWith(`/${wanted}`))
    ?.use;
}

export interface TokenHit {
  token: SystemToken;
  score: number;
}

/** Tokens ranked by name and role. Primitive colors are left out: components never read them. */
export function findTokens(system: System, need: string, limit = 5): TokenHit[] {
  const base = terms(need);
  const query = [
    ...base,
    ...need
      .toLowerCase()
      .split(/[^a-z]+/)
      .flatMap((word) => TOKEN_WORDS[word] ?? [])
      .flatMap(terms),
  ];
  if (query.length === 0) return [];
  return system.tokens
    .filter((token) => token.tier !== "primitive" || token.type !== "color")
    .map((token) => {
      let score = weigh(query, token.name.replace(/^--/, ""), 2.5);
      score += weigh(query, token.role ?? "", 1.5);
      if (token.tier === "primitive") score *= 0.8;
      return { token, score };
    })
    .filter((hit) => hit.score >= 3)
    .sort((a, b) => b.score - a.score || a.token.name.localeCompare(b.token.name))
    .slice(0, limit);
}

const oneLine = (text: string): string => text.replace(/\s+/g, " ").trim();

/** A part's experimental options (DS-11), one line each: it may change or go in a minor release. */
const experimentalLines = (part: Part): string[] =>
  (part.experimental ?? []).map(
    (item) =>
      `  experimental: ${item.option} (status experimental since ${item.since}; may change or go in a minor release): ${oneLine(item.reason)}`,
  );

export function describeTokenLine(token: SystemToken): string {
  const value = token.dark ? `${token.light} | dark ${token.dark}` : token.light;
  const short = value.length > 60 ? `${value.slice(0, 57)}...` : value;
  return `${token.name} = ${short}${token.role ? `. ${oneLine(token.role).slice(0, 140)}` : ""}`;
}

/** A path inside the package, as an app finds it under node_modules: the file lists hold repo paths. */
const inPackage = (path: string): string => path.replace(/^packages\/design-system\//, "");

/** A component's props, one line each: `name?: type = default. What it does`. */
export function describeProps(component: Component): string[] {
  const lines = component.props.map((prop) => {
    const type = prop.values ? prop.values.map((value) => `"${value}"`).join(" | ") : prop.type;
    const head = `${prop.name}${prop.required ? "" : "?"}: ${type}${prop.default ? ` = ${prop.default}` : ""}`;
    return `    ${head}${prop.description ? `. ${prop.description}` : ""}`;
  });
  if (component.element) lines.push(`    ...every attribute of a native ${component.element}`);
  return [`  props of ${component.name}:`, ...lines];
}

/**
 * The whole of a part. With `drawn` (its components, from componentsOf), it lists their props;
 * without, it says where they are, so a `find` answer stays short.
 */
export function describePart(part: Part, drawn?: Component[]): string {
  const out: string[] = [
    `${part.id}: ${part.name}. ${part.summary}`,
    `  classes: ${part.classes.map((name) => `.${name}`).join(" ")}`,
  ];
  if (part.imports.length) out.push(`  import: ${part.imports.join(", ")}`);
  if (part.files?.length) out.push(`  files: ${part.files.map(inPackage).join(", ")}`);
  out.push(`  styled in: ${part.styles.map(inPackage).join(", ")}`);
  out.push(`  use when: ${part.when.join("; ")}`);
  for (const item of part.not ?? []) out.push(`  not when: ${item.when} -> ${item.use}`);
  if (part.markup) out.push(`  markup: ${part.markup}`);
  for (const rule of part.rules ?? []) out.push(`  rule: ${rule}`);
  out.push(...experimentalLines(part));
  if (drawn) for (const component of drawn) out.push(...describeProps(component));
  else if (part.imports.length) out.push(`  props: \`ds part ${part.id}\``);
  if (part.tokens.length) out.push(`  tokens: ${part.tokens.join(" ")}`);
  if (part.usage) {
    const note = part.usage.length > 240 ? `${part.usage.slice(0, 239).trimEnd()}…` : part.usage;
    out.push(`  owner's note: ${note} (full: tokens/system.json)`);
  }
  return out.join("\n");
}

/** The tokens `ds find` shows for a need: a weaker match is left out of the answer. */
export function shownTokens(system: System, need: string): TokenHit[] {
  return findTokens(system, need).filter((hit) => hit.score >= 5);
}

/** The fewest single-letter edits (insert, delete, change, or swap two neighbours) from `a` to `b`. */
export function editDistance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  const at = (i: number, j: number): number => d[i]?.[j] ?? 0;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      let best = Math.min(
        at(i - 1, j) + 1,
        at(i, j - 1) + 1,
        at(i - 1, j - 1) + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        best = Math.min(best, at(i - 2, j - 2) + 1);
      const row = d[i];
      if (row) row[j] = best;
    }
  return at(a.length, b.length);
}

/**
 * The need with each word the system never uses (nor any word of the same stem) swapped for the
 * closest word it does, one edit away (two for a long word), so "buton" finds the Button. Undefined
 * when no word changes.
 */
export function correctNeed(system: System, need: string): string | undefined {
  const wordsOf = (texts: string[]): Set<string> =>
    new Set(
      texts
        .join(" ")
        .toLowerCase()
        .split(/[^a-z]+/)
        .filter((word) => word.length > 2),
    );
  // A part's or token's own names win a tie over a word from its prose: "tost" is Toast, not "most".
  const names = wordsOf([
    ...system.parts.flatMap((part) => [part.id, part.name, ...(part.keywords ?? [])]),
    ...system.tokens.map((token) => token.name),
  ]);
  const prose = wordsOf(system.parts.flatMap((part) => [part.summary, ...part.when]));
  const known = new Set([...names, ...prose]);
  const stems = new Set([...known].map(stem));
  const closest = (word: string, pool: Set<string>, reach: number): string | undefined => {
    let best: string | undefined;
    let bestDistance = reach + 1;
    for (const candidate of pool) {
      if (Math.abs(candidate.length - word.length) > reach) continue;
      const distance = editDistance(word, candidate);
      if (distance < bestDistance || (distance === bestDistance && best && candidate < best)) {
        best = candidate;
        bestDistance = distance;
      }
    }
    return best;
  };
  let changed = false;
  const words = need.split(/\s+/).map((word) => {
    const bare = word.toLowerCase().replace(/[^a-z]/g, "");
    if (bare.length < 4 || known.has(bare) || stems.has(stem(bare)) || STOP.has(bare)) return word;
    const reach = bare.length >= 7 ? 2 : 1;
    const best = closest(bare, names, reach) ?? closest(bare, prose, reach);
    if (!best) return word;
    changed = true;
    return best;
  });
  return changed ? words.join(" ") : undefined;
}

/** What `ds find` found for a need, before it is put into words: the CLI's text and its JSON. */
export interface Lookup {
  need: string;
  /** The need as searched, when a misspelt word was corrected. */
  corrected?: string;
  /** The import that replaces a retired path the need named. */
  retired?: string;
  parts: Part[];
  tokens: SystemToken[];
}

export function lookup(system: System, need: string): Lookup {
  const retired = replacementFor(need);
  if (retired) return { need, retired, parts: [], tokens: [] };
  const found = (text: string) => ({
    parts: findParts(system, text).map((hit) => hit.part),
    tokens: shownTokens(system, text).map((hit) => hit.token),
  });
  const first = found(need);
  if (first.parts.length > 0 || first.tokens.length > 0) return { need, ...first };
  // Only when nothing matched: a real word the system lacks ("call") would otherwise be "corrected".
  const corrected = correctNeed(system, need);
  return corrected ? { need, corrected, ...found(corrected) } : { need, ...first };
}

/** A short answer to a need: the best parts in a few lines each, then the tokens that fit. */
export function answer(system: System, need: string): string {
  const { retired, corrected, parts, tokens } = lookup(system, need);
  if (retired) return `${need.trim()} is retired: import ${retired}.`;
  if (parts.length === 0 && tokens.length === 0)
    return `No part or token matches "${need}". Read the package's tokens/llms.txt; if nothing fits, ask the owner before inventing a class.`;
  const out: string[] = corrected ? [`Showing results for "${corrected}".`] : [];
  if (parts.length > 0) {
    out.push("PARTS (best first; the first is usually the one):");
    parts.forEach((part, index) => {
      if (index === 0) out.push(describePart(part));
      else {
        out.push(`${part.id}: ${part.summary}`);
        out.push(`  use when: ${part.when.slice(0, 2).join("; ")}`);
        out.push(...experimentalLines(part));
      }
    });
  }
  if (tokens.length > 0) {
    out.push("", "TOKENS:");
    for (const token of tokens) out.push(describeTokenLine(token));
  }
  out.push(
    "",
    parts.length > 0
      ? `Next: draw it with the import above${parts[1] ? `, or \`ds part ${parts[1].id}\` for the next one` : ""}; then \`ds validate <your files>\`.`
      : "Next: `ds token <group>` lists a token's whole group.",
  );
  return out.join("\n");
}
