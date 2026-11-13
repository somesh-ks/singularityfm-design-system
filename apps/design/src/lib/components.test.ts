import { readdirSync } from "node:fs";
import { COMPONENTS } from "@singularity/design-system/registry";
import system from "@singularity/design-system/tokens/system.json";
import { describe, expect, it } from "vitest";
import { inCode } from "./codeWords";
import { SPECS } from "./components";

describe("the guide's component pages", () => {
  // A component added to the library with no page and no nav entry would simply be missing from the
  // guide: nothing else fails.
  it("has a page for every registry component and every component file", () => {
    const src = new URL("../../../../packages/design-system/src/", import.meta.url);
    const all = readdirSync(src);
    // An .astro file beside its .tsx is that component's deprecated path (DS-3), not a page of its own.
    const files = all.filter(
      (file) =>
        file.endsWith(".tsx") ||
        (file.endsWith(".astro") && !all.includes(file.replace(/\.astro$/, ".tsx"))),
    );
    const shown = new Set(
      SPECS.flatMap((spec) => [spec.file, ...(spec.subparts ?? []).map((part) => part.file)]),
    );
    expect(files.filter((file) => !shown.has(file))).toEqual([]);
    // A renamed file a spec still names would drop that page's props table without failing the build.
    expect([...shown].filter((file) => file !== undefined && !files.includes(file))).toEqual([]);
    // The props tables read system.json, which lists only what the exports map names: a file it
    // misses would show an empty table.
    expect(
      [...shown].filter(
        (file) =>
          file !== undefined &&
          !system.components.some((component) => component.file.endsWith(`/${file}`)),
      ),
    ).toEqual([]);
    expect(
      COMPONENTS.map((component) => component.name).filter(
        (name) => !SPECS.some((spec) => spec.registry === name),
      ),
    ).toEqual([]);
    expect(new Set(SPECS.map((spec) => spec.slug)).size).toBe(SPECS.length);
  });

  // Prevents a Code snippet that a reader copies and gets other words or broken JSX: typed words are
  // literal text, so a quote, a brace or a character reference ("&amp;") must stay what was typed.
  it("writes typed words into the code as literal text", () => {
    expect(inCode('Say "hi" {x} <b> &amp;', ">", "")).toBe(
      'Say "hi" {"{"}x{"}"} {"<"}b{">"} &amp;amp;',
    );
    expect(inCode('Say "hi" &amp;', '"', "=")).toBe("Say &quot;hi&quot; &amp;amp;");
    expect(inCode('It\'s "done" \\', '"', " ")).toBe('It\'s \\"done\\" \\\\');
  });
});
