import { describe, expect, it } from "vitest";
import {
  classOnComponent,
  offGrid,
  RETIRED_PATHS,
  rawColour,
  retiredPath,
  unknownProperty,
} from "./index";

const lines = (findings: { line: number }[]) => findings.map((finding) => finding.line);

describe("the rules", () => {
  // Prevents a colour that dark mode and the contrast sweep never see. D321's two alpha layers (the
  // ripple and a cover's press) mix a token over transparent, and a derived colour reads a token.
  it("raw-colour: finds a literal colour, never a token's mix or derivation", () => {
    const css = [
      ".a { color: #1a1a1a; }",
      ".b { background: rgb(0 0 0 / 40%); }",
      ".c { border-color: oklch(0.6 0.1 250); }",
      ".ripple-wave { background: color-mix(in oklch, var(--color-on-surface) var(--state-press), transparent); }",
      ".cover::after { background: color-mix(in oklch, var(--color-on-surface) 12%, transparent); }",
      ".d { --tint: oklch(from var(--color-accent) 0.7 c h); }",
      ".e { background: linear-gradient(in oklch to right, oklch(from var(--hue) l c h), red); }",
      "#fade { color: var(--color-on-surface); } /* #fff */",
    ].join("\n");
    expect(lines(rawColour(css, "page.css"))).toEqual([1, 2, 3]);
    expect(rawColour(css, "packages/design-system/styles/tokens.css")).toEqual([]);
    expect(lines(rawColour('const tint = "#ff0000";\n// #fff\n', "glow.ts"))).toEqual([1]);
  });

  // Prevents a 12px gap beside a 16px one: spacing lands on 8, 16, 24; 4px only where named.
  it("off-grid: finds spacing off the 8pt grid, bar the named 4px rules", () => {
    const css = [
      ".a { gap: var(--space-1); }",
      ".b { padding: 12px var(--space-2); }",
      ".c { margin-block: calc(var(--space-4) - var(--space-1)); }",
      ".banner-body { gap: var(--space-1); }",
      ".sheet-head:hover { margin-inline: calc(var(--space-1) * -1); }",
      ".d { padding: var(--space-2) var(--space-4); width: 12px; inset: 50%; }",
      ".e { padding: var(--touch-target); }",
    ].join("\n");
    expect(lines(offGrid(css, "page.css"))).toEqual([1, 2, 3]);
  });

  // Prevents a declaration the browser drops silently: a read of a property nothing defines.
  it("unknown-property: finds a read of a property neither a token nor declared here", () => {
    const css = [
      ".a { padding: var(--space-5); }",
      ".b { color: var(--color-on-surface); }",
      ".c { --local: 1px; margin: var(--local); }",
      ".d { opacity: var(--set-by-script, 1); }",
    ].join("\n");
    expect(lines(unknownProperty(css, "page.css"))).toEqual([1]);
    const script =
      'el.style.setProperty("--progress", "1");\nconst a = "var(--progress) var(--nope)";';
    expect(lines(unknownProperty(script, "bar.ts"))).toEqual([2]);
  });

  // Prevents a page drawing a component by its class (D237), on a raw element or through the
  // component's class prop; a hook class of the page's own on a component passes.
  it("class-on-component: finds a component's class typed by a page, not a hook class", () => {
    const page = [
      'import Button from "@singularityfm/design-system/Button";',
      '<button class="button-filled" type="button">Play</button>',
      '<Button variant="text" className="button-small">Listen</Button>',
      '<Button variant="text" className="queue-listen">Listen</Button>',
      'el.className = "btn-primary";',
      '<div class="settings-row icon-btn">',
      '<!-- class="button-text" -->',
    ].join("\n");
    expect(lines(classOnComponent(page, "src/pages/index.astro"))).toEqual([2, 3, 5]);
    const own = 'export const BUTTON_CLASSES = ["button-filled", "button-text"];';
    expect(classOnComponent(own, "packages/design-system/src/button.ts")).toEqual([]);
  });

  // Prevents an import of a path the package retired going unseen until the removal breaks a build.
  it("retired-path: warns on a deprecated import and names its replacement", () => {
    const page = [
      'import Old from "@singularityfm/design-system/Button.astro";',
      'import Button from "@singularityfm/design-system/Button";',
      'import Alias from "@singularity/design-system/Button.astro";',
    ].join("\n");
    const found = retiredPath(page, "src/pages/index.astro");
    expect(lines(found)).toEqual([1, 3]);
    for (const finding of found) {
      expect(finding.severity).toBe("warning");
      expect(finding.fix).toBe(RETIRED_PATHS[0]?.use);
    }
  });
});
