import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * A pill that changes shape on hover or press is clamped to half its height, never left at the bare
 * --radius-round (9999px). 9999px eases to 24px through radii the corner cannot show, so the corner
 * sat still, then snapped and overshot at the end of the spring (owner, 2026-11-08, the Overview's
 * play and green tiles). Reads the library's sheets and the guide's.
 */
const SHEETS = [
  new URL("../../../../packages/design-system/styles/", import.meta.url),
  new URL("../styles/", import.meta.url),
];
const STATE = /:(hover|active|focus-visible|focus)\b/g;
const BARE_ROUND = /^var\(--(radius|shape)-round\)$/;

describe("a pill that changes shape", () => {
  it("starts and ends at radii its corner can show", () => {
    const radii = new Map<string, { value: string; state: boolean; sheet: string }[]>();
    for (const dir of SHEETS)
      for (const sheet of readdirSync(dir).filter((name) => name.endsWith(".css"))) {
        const css = readFileSync(new URL(sheet, dir), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
        for (const [, selectors = "", body = ""] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
          const value = /(?:^|;)\s*border-radius:\s*([^;]+)/.exec(body)?.[1]?.trim();
          if (!value) continue;
          for (const selector of selectors.split(",")) {
            const state = STATE.test(selector);
            const key = selector.replace(STATE, "").replace(/\s+/g, " ").trim();
            radii.set(key, [...(radii.get(key) ?? []), { value, state, sheet }]);
          }
        }
      }
    const jumps = [...radii].flatMap(([key, set]) =>
      set.some(
        (a) =>
          BARE_ROUND.test(a.value) && set.some((b) => b.state !== a.state && b.value !== a.value),
      )
        ? [`${set[0]?.sheet} ${key}`]
        : [],
    );
    expect(jumps).toEqual([]);
  });
});
