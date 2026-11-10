import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildSystem, LLMS_PATH, SYSTEM_PATH, systemFiles } from "./build.js";
import { findParts, shownTokens } from "./query.js";
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
    for (const [path, text] of systemFiles()) expect(readFileSync(path, "utf8")).toBe(text);
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
  it("takes a usage comment from the rule of the class alone", () => {
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
      const first = findParts(system, row.need, 3)[0]?.part.id ?? null;
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
