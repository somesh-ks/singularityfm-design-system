import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  classOnComponent,
  declaredProperties,
  offGrid,
  RETIRED_PATHS,
  rawColour,
  rawPixels,
  retiredPath,
  SIZE_DEBT,
  SIZE_STEPS,
  sizeLiteral,
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
    // A nested rule's parent keeps its own declarations.
    expect(
      lines(rawColour(".card {\n  color: #fff;\n  &:hover { opacity: 0.8; }\n}", "a.css")),
    ).toEqual([2]);
    // A brace or semicolon in a quoted value does not end the rule early.
    const quoted = '.a::before {\n  content: "};";\n  color: #fff;\n}';
    expect(lines(rawColour(quoted, "a.css"))).toEqual([3]);
    const escaped = ".a { background: url(it\\'s.svg); }\n.b { color: #fff; }";
    expect(lines(rawColour(escaped, "a.css"))).toEqual([2]);
    // A link, an id, a selector or a url() holds a reference, never a colour.
    const markup = [
      '<a href="#abc">Top</a>',
      '<svg><use href="#fade" /><rect fill="url(#bad)" /></svg>',
      'document.querySelector("#face");',
      '<circle fill="#fff" />',
      '<div style="color: #0f0">',
      "<style>.a { color: #123; }</style>",
    ].join("\n");
    expect(lines(rawColour(markup, "Page.astro"))).toEqual([4, 5, 6]);
    // A `/*` inside a string opens no comment: the app's `Accept: "image/*"` hid the lines after it.
    const accept = 'const a = { Accept: "image/*" };\nconst c = "#ff0000";\n/* x */';
    expect(lines(rawColour(accept, "icon.ts"))).toEqual([2]);
    // A backtick in a regex opens no string that swallows the comments after it, and an unquoted
    // url() holding `/*` opens no comment.
    const tick = 'const r = /["\'`]/;\n/* #fff */\n// #000\nconst c = "#123";';
    expect(lines(rawColour(tick, "a.ts"))).toEqual([4]);
    const url = ".a { background: url(a/*b.png); }\n.b { color: #fff; }\n/* x */";
    expect(lines(rawColour(url, "a.css"))).toEqual([2]);
    // Only a relative colour from a token is the token's: a literal that takes one channel from a
    // token is still a literal, and a query's prelude holds values too.
    const partial = [
      ".a { color: oklch(0.5 0.2 var(--hue)); }",
      ".b { background: rgb(255 0 0 / var(--alpha)); }",
      "@container style(--tone: #ff0000) { .c { color: var(--color-accent); } }",
      "@supports (color: oklch(from red l c h)) { .d { color: var(--color-accent); } }",
      ".e { color: rgb(var(--accent-rgb)); background: oklch(from currentColor l c h); }",
      '.f::after { content: "@media #fff"; }',
    ].join("\n");
    expect(lines(rawColour(partial, "page.css"))).toEqual([1, 2, 3, 6]);
    // biome-ignore lint/suspicious/noTemplateCurlyInString: the text is a source file's template literal, as the rule reads it.
    expect(rawColour("const s = `oklch(from ${source} l c h)`;", "build.ts")).toEqual([]);
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
    // An app page's own 4px case is the app's to name, and passes once it does.
    const page = ".hero-text { gap: var(--space-1); }";
    expect(lines(offGrid(page, "page.css"))).toEqual([1]);
    expect(offGrid(page, "page.css", [[".hero-text", "title onto its subtitle"]])).toEqual([]);
    // An exception names one selector, so a list that adds another stays checked; nesting reads
    // the parent's name, and a parent keeps its own declarations beside a nested rule.
    const nested = [
      ".banner-body, .hero-text { gap: var(--space-1); }",
      ".sheet-head { &:hover { margin: var(--space-1); } }",
      ".f { gap: 12px; &:hover { opacity: 0.8; } }",
    ].join("\n");
    expect(lines(offGrid(nested, "page.css"))).toEqual([1, 3]);
    // A comma inside an attribute value or :is() does not split the selector.
    const quoted = '[data-tags="news,local"] { gap: var(--space-1); }';
    expect(offGrid(quoted, "page.css", [['[data-tags="news,local"]', "a tag row"]])).toEqual([]);
    // A leading zero is a valid length, never a crash: 08px is 8px.
    expect(offGrid(".g { padding: 08px; margin: 012px; }", "page.css").length).toBe(1);
    // A value that is no fixed length is held to the space steps it names: 4px inside max() or
    // beside a dimension is still 4px, and a step no token defines (with a fallback, which the
    // unknown-property rule lets pass) is no step.
    const loose = [
      ".h { padding: max(var(--space-1), 1rem); }",
      ".i { margin: calc(var(--space-1) + var(--size-touch)); }",
      ".j { gap: var(--space-3, 0.75rem); }",
      ".banner-body { padding: max(var(--space-1), 1rem); }",
      ".k { padding: max(var(--space-2), 1rem); }",
    ].join("\n");
    expect(lines(offGrid(loose, "page.css"))).toEqual([1, 2, 3]);
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
    // A read through getPropertyValue declares nothing; a style object's key does.
    const read = 'getComputedStyle(el).getPropertyValue("--gone");\nconst a = "var(--gone)";';
    expect(lines(unknownProperty(read, "bar.ts"))).toEqual([2]);
    const keyed =
      'const style = { "--fill": 1, ["--rest"]: 2 };\nconst a = "var(--fill) var(--rest)";';
    expect(unknownProperty(keyed, "bar.tsx")).toEqual([]);
    // The style guide's sheet read --swatch, which a page's style attribute sets, and validating the
    // two together called it unknown: a property any of the files declares is declared.
    const sheet = ".ramp li { background: var(--swatch); }";
    const page = "<li style={`--swatch: var(--color-accent)`}>";
    expect(lines(unknownProperty(sheet, "guide.css"))).toEqual([1]);
    expect(unknownProperty(sheet, "guide.css", declaredProperties(page, "color.astro"))).toEqual(
      [],
    );
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
      '<div class="settings-row digest-intro">',
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

  // Prevents a width measured in one state's words (a chip 141.5px wide) pasted into a stylesheet:
  // it goes stale with the next label, text size or mood (owner, 2026-11-10).
  it("raw-px: finds a pixel length, never zero, the hairline, a token, a string or a comment", () => {
    const css = [
      ".a { width: 141.5px; }",
      ".b { padding: 0 calc(var(--space-4) - 3px); }",
      ".c { margin: 0px; border: 1px solid; }",
      ".d { width: 12rem; content: '12px'; background: url(a-12px.svg); }",
      "/* a 44px target */ .e { min-height: var(--size-touch); }",
      "@media (min-width: 640px) { .f { color: red; } }",
      ".g { --gap: 20px; }",
      ".h { translate: 0 calc((1 - var(--on)) * -6px); }",
      ".avatar[data-act] .avatar-rig { transform-origin: 50px 90px; }",
      ".i { width: 12PX; min-width: 1e2px; max-width: 1em; }",
    ].join("\n");
    expect(lines(rawPixels(css, "page.css"))).toEqual([1, 2, 6, 7, 8, 10, 10]);
    expect(rawPixels(css, "packages/design-system/styles/tokens.css")).toEqual([]);
    // A caller's own exception names the rule and says why.
    expect(lines(rawPixels(css, "page.css", [[".g", "a test"]]))).toEqual([1, 2, 6, 8, 10, 10]);
  });

  it("raw-px: the library's own stylesheets hold none", () => {
    const dir = join(import.meta.dirname, "..", "styles");
    const found = readdirSync(dir)
      .filter((name) => name.endsWith(".css"))
      .flatMap((name) =>
        rawPixels(
          readFileSync(join(dir, name), "utf8"),
          `packages/design-system/styles/${name}`,
        ).map(({ line, message }) => `${name}:${line} ${message}`),
      );
    expect(found).toEqual([]);
  });

  // Prevents a control drawn at a height no step names (a 40px button beside a 44px chip): a height is
  // a token, or a literal rem or em only where its declaration is named and why (SIZE_LITERAL_EXCEPTIONS).
  it("size-literal: finds a rem or em height or size written outside a token, never a token or a px", () => {
    const css = [
      ".a { min-height: 2.5rem; }",
      ".b { height: var(--size-touch); min-height: calc(var(--size-touch) + 2px); }",
      ".c { --badge-size: 1.5em; width: 1.5em; }",
      ".d { max-block-size: min(70dvh, 24rem); }",
      ".e { block-size: 0.9375em; font-size: 1.25rem; }",
      ".f { min-height: 0; height: 100%; padding: 0.5rem; }",
      "/* .g { height: 3rem; } */ .h { inline-size: 9rem; }",
    ].join("\n");
    expect(lines(sizeLiteral(css, "page.css"))).toEqual([1, 3, 4, 5]);
    expect(sizeLiteral(css, "packages/design-system/styles/tokens.css")).toEqual([]);
    // An exception excuses its one declaration: the selector and property as the finding names them.
    expect(lines(sizeLiteral(css, "page.css", [[".a { min-height }", "a test"]]))).toEqual([
      3, 4, 5,
    ]);
  });

  // Prevents a control height that moves off the steps without anyone choosing it: each size token
  // is a step of its mood, or a named debt (SIZE_DEBT), and a debt that is settled leaves the list.
  it("size-steps: each control height is a step of its mood or a named debt, and no debt is stale", () => {
    const tokens = readFileSync(join(import.meta.dirname, "..", "styles", "tokens.css"), "utf8");
    // SIZE_DEBT names are bare; a custom property is read with its `--`.
    const debt = new Set(SIZE_DEBT.map(([name]) => name));
    // A token that names a control size: a height, a size, a touch target, an option row. A text size,
    // a cover's picture, an icon's glyph and the speed readout's digits are not control heights.
    const SIZE_TOKEN =
      /^--(?!text-|font-|cover-|size-icon|chip-icon|player-speed-readout)(?:[\w-]*-)?(?:height|height-small|size|size-(?:lg|md|sm)|touch|touch-comfortable|option)$/;
    const failures: string[] = [];
    const offStep = new Set<string>();
    // Each top-level block: :root, and its mood (Expressive, Halloween, Default). Dark colours do not
    // change a size, so the @media blocks (indented) are not read.
    for (const [, selector, body] of tokens.matchAll(/^(:root[^\n{]*)\{([\s\S]*?)^\}/gm)) {
      const steps: readonly number[] = /expressive/.test(selector ?? "")
        ? SIZE_STEPS.expressive
        : SIZE_STEPS.default;
      for (const [, name, value] of (body ?? "").matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)) {
        const literal = /^(\d*\.?\d+)(rem|em|px)$/.exec(value?.trim() ?? "");
        if (!name || !SIZE_TOKEN.test(name) || !literal) continue;
        // A step is a rem: a px or em value is off the steps even where its number is one.
        if (literal[2] === "rem" && steps.includes(Number(literal[1]))) continue;
        offStep.add(name);
        if (!debt.has(name.slice(2)))
          failures.push(
            `${name}: ${value?.trim()} in ${selector?.trim()} is not a step (${steps.map((step) => `${step * 16}px`).join(", ")})`,
          );
      }
    }
    expect(failures).toEqual([]);
    // A debt entry that no mood holds off the steps any more is settled: take it off SIZE_DEBT.
    expect([...debt].filter((name) => !offStep.has(`--${name}`))).toEqual([]);
  });
});
