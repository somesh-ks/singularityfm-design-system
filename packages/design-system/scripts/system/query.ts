/** Answers "which part" and "which token" from a built system, so an agent need not grep stylesheets. */
import { RETIRED_PATHS } from "../../rules/data.js";
import type { Part, System, SystemToken } from "./types.js";

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

export function describePart(part: Part): string {
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
  if (part.tokens.length) out.push(`  tokens: ${part.tokens.join(" ")}`);
  if (part.usage) {
    const note = part.usage.length > 240 ? `${part.usage.slice(0, 239).trimEnd()}…` : part.usage;
    out.push(`  owner's note: ${note} (full: packages/design-system/tokens/system.json)`);
  }
  return out.join("\n");
}

/** The tokens `ds find` shows for a need: a weaker match is left out of the answer. */
export function shownTokens(system: System, need: string): TokenHit[] {
  return findTokens(system, need).filter((hit) => hit.score >= 5);
}

/** A short answer to a need: the best parts in a few lines each, then the tokens that fit. */
export function answer(system: System, need: string): string {
  const replacement = replacementFor(need);
  if (replacement) return `${need.trim()} is retired: import ${replacement}.`;
  const parts = findParts(system, need);
  const tokens = shownTokens(system, need);
  const out: string[] = [];
  if (parts.length === 0 && tokens.length === 0)
    return `No part or token matches "${need}". Read packages/design-system/tokens/llms.txt; if nothing fits, ask the owner before inventing a class.`;
  if (parts.length > 0) {
    out.push("PARTS (best first; the first is usually the one):");
    parts.forEach(({ part }, index) => {
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
    for (const { token } of tokens) out.push(describeTokenLine(token));
  }
  return out.join("\n");
}
