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
    const keyed = 'const style = { "--fill": 1 };\nconst a = "var(--fill)";';
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
      ".avatar[data-act] .avatar-rig { transform-origin: 50px 90px; }",
    ].join("\n");
    expect(lines(rawPixels(css, "page.css"))).toEqual([1, 2, 6, 7]);
    expect(rawPixels(css, "packages/design-system/styles/tokens.css")).toEqual([]);
    // A caller's own exception names the rule and says why.
    expect(lines(rawPixels(css, "page.css", [[".g", "a test"]]))).toEqual([1, 2, 6]);
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
});
