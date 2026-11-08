import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { flagParts } from "./flag";
import { COMPONENTS } from "./registry";

/**
 * Each component's own stylesheet and guidance. That no app writes its classes by hand, and the
 * other checks of how the apps draw the system, are in scripts/systemUse.test.ts at the repository
 * root, where the apps are visible (D382 step 4c).
 */
const STYLES = join(import.meta.dirname, "..", "styles");
const sheet = (name: string) => readFileSync(join(STYLES, name), "utf8");

describe("design-system components", () => {
  it.each(COMPONENTS)(
    "$name: every class it draws has rules, and every rule belongs to it",
    (c) => {
      const css = sheet(c.sheet);
      const rules = css.replace(/\/\*[\s\S]*?\*\//g, "");
      const defined = [...rules.matchAll(/\.([a-z][\w-]*)/g)].map((m) => m[1] ?? "");
      for (const name of c.classes) expect(defined, `${name} has no rule`).toContain(name);
      const orphans = [...new Set(defined.filter((n) => n.startsWith(c.prefix)))].filter(
        (n) => !c.classes.includes(n),
      );
      expect(orphans, `${c.sheet} styles a class no ${c.name} draws`).toEqual([]);
    },
  );

  it.each(COMPONENTS)(
    "$name: it and each of its parts say when to use them and when not to",
    (c) => {
      const parts = [["", c] as const, ...Object.entries(c.parts)];
      for (const [name, part] of parts) {
        const label = `${c.name} ${name}`.trim();
        expect(part.summary, `${label}: summary`).not.toBe("");
        expect(part.useWhen.length, `${label}: useWhen`).toBeGreaterThan(0);
        expect(part.dontUseWhen.length, `${label}: dontUseWhen`).toBeGreaterThan(0);
        for (const { when, instead } of part.dontUseWhen) {
          expect(when, `${label}: a dontUseWhen with no situation`).not.toBe("");
          // A pointer into a component the system already has must name a variant or tone it has.
          const [target, partName] = (instead ?? "").split(".");
          const known = COMPONENTS.find((k) => k.name === target);
          if (known && partName) {
            expect(Object.keys(known.parts), `${label}: "${when}" points at ${instead}`).toContain(
              partName,
            );
          }
        }
      }
    },
  );
});

// A dialog's answers hug their labels, in a row and stacked (owner, 2026-10-30, and again 2026-11-08
// after the stacked guard's Save filled the width). The filled and tonal buttons are width: 100% by
// default and a flex column stretches its children, so either one alone brings the bug back.
describe("the Dialog's answers", () => {
  const rules = readdirSync(STYLES)
    .filter((name) => name.endsWith(".css"))
    .flatMap((name) =>
      [
        ...sheet(name)
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .matchAll(/([^{}]+)\{([^{}]*)\}/g),
      ].map((m) => ({ where: name, selector: (m[1] ?? "").trim(), body: m[2] ?? "" })),
    )
    .filter((rule) => rule.selector.includes("dialog-actions"));

  it("never stretches an answer to the dialog's width", () => {
    const stretching = rules.filter((rule) =>
      /align-items:\s*(stretch|normal)|flex(-grow)?:\s*[1-9]|width:\s*100%/.test(rule.body),
    );
    expect(stretching.map((rule) => `${rule.where}: ${rule.selector}`)).toEqual([]);
    const stacked = rules.find((rule) => /\.dialog-actions-stacked\s*$/.test(rule.selector));
    expect(stacked?.body, "a flex column stretches unless it aligns its answers").toMatch(
      /align-items:\s*(flex-end|end)/,
    );
  });

  it("undoes the full width of the filled and tonal buttons", () => {
    const hug = rules.find(
      (rule) =>
        /\.dialog-actions\s*>\s*:is\([^)]*button-filled[^)]*button-tonal/.test(rule.selector) &&
        /width:\s*auto/.test(rule.body),
    );
    expect(
      hug,
      "buttons.css: .dialog-actions > :is(.button-filled, .button-tonal) { width: auto }",
    ).toBeDefined();
  });
});

// Windows draws no flag emoji, only two letters (owner, 2026-10-25 and 2026-11-04: "the emoji doesn't
// get read in all platforms"): every flag the app draws is the Flag's art (D367).
describe("the Flag", () => {
  it("draws a flag emoji in text as the Flag, and leaves other text as it is", () => {
    expect(flagParts("You're in India 🇮🇳")).toEqual(["You're in India", { region: "IN" }]);
    expect(flagParts("🇸🇪")).toEqual([{ region: "SE" }]);
    expect(flagParts("🎨 Design")).toEqual(["🎨 Design"]);
  });
});

// The library's one component framework is React (DS-3). Each family PR moves its .astro files to .tsx
// and trims this list; nothing joins it.
const ASTRO_LEFT = [
  "Avatar.astro",
  "Badge.astro",
  "Banner.astro",
  "BrandMark.astro",
  "ChapterAside.astro",
  "Code.astro",
  "Dialog.astro",
  "DialogActions.astro",
  "DialogTitle.astro",
  "Field.astro",
  "Flag.astro",
  "Icon.astro",
  "Menu.astro",
  "MenuItem.astro",
  "Ripple.astro",
  "RowExit.astro",
  "SectionTabs.astro",
  "Select.astro",
  "Sheet.astro",
  "SheetHeader.astro",
  "Slider.astro",
  "Switch.astro",
];

describe("the component framework", () => {
  const files = readdirSync(import.meta.dirname, { recursive: true }).map(String);

  it("adds no Astro component, and drops a migrated one from the list", () => {
    expect(files.filter((file) => file.endsWith(".astro")).sort()).toEqual(ASTRO_LEFT);
  });

  // Without its own entry, `<pkg>/Button` falls to the "./*" pattern, src/Button.ts, which a
  // case-blind disk (Windows, macOS) serves as button.ts: the import finds no component and says so late.
  it("exports each React component by its name", () => {
    const pkg = JSON.parse(readFileSync(join(import.meta.dirname, "..", "package.json"), "utf8"));
    for (const file of files.filter((name) => name.endsWith(".tsx"))) {
      expect(pkg.exports[`./${file.replace(/\.tsx$/, "")}`], file).toBe(`./src/${file}`);
    }
  });
});
