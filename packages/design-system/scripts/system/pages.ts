/**
 * The markdown an agent fetches one at a time (plan phase 2, layer 2): a page per part, at
 * tokens/parts/<id>.md in the package and /design/parts/<id>.md on the style guide, and all of it in
 * one tokens/llms-full.txt for an agent that wants a single fetch. Built from system.json's own
 * records, so a page says what `ds part` says.
 */
import type { Component, Part, System } from "./types.js";

const inPackage = (path: string): string => path.replace(/^packages\/design-system\//, "");

/** A table cell: a pipe would end the cell, a newline the row. */
const cell = (text: string): string => text.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();

/** Inline code that survives a backtick inside it (a template literal type): fenced by two. */
const code = (text: string): string => (text.includes("`") ? `\`\` ${text} \`\`` : `\`${text}\``);

/** How llms.txt links foundations.md; llms-full.txt, which holds its text, swaps it for a pointer. */
export const FOUNDATIONS_LINK = "[foundations.md](foundations.md)";

/** The components a part imports, in its own order. */
export function componentsOf(part: Part, components: Component[]): Component[] {
  return part.imports.flatMap((name) =>
    components.filter((component) => component.import === name),
  );
}

/** A component's props as a table, and the element it passes attributes to. */
export function propsSection(component: Component, depth = 0): string[] {
  const out = [`${"#".repeat(2 + depth)} Props of ${component.name}`, ""];
  if (component.props.length === 0) out.push("No props of its own.");
  else {
    out.push("| Name | Type | Default | What it does |", "| --- | --- | --- | --- |");
    for (const prop of component.props) {
      const type = prop.values
        ? prop.values.map((value) => `"${value}"`).join(" \\| ")
        : cell(prop.type);
      out.push(
        `| ${code(`${prop.name}${prop.required ? "" : "?"}`)} | ${code(type)} | ${prop.default ? code(cell(prop.default)) : "-"} | ${cell(prop.description) || "-"} |`,
      );
    }
  }
  if (component.element)
    out.push("", `Every attribute of a native \`${component.element}\` passes through.`);
  return out;
}

/**
 * Where a page is read: on its own (tokens/parts, links to its siblings) or inside llms-full.txt,
 * one folder up and one heading level down.
 */
interface Placement {
  depth: number;
  links: string;
}
const ALONE: Placement = { depth: 0, links: "" };
const IN_FULL: Placement = { depth: 1, links: "parts/" };

/**
 * Who writes a part's classes. A component's are its own; a part with none (a card group, a settings
 * row) is drawn by typing them, as its markup shows; a few are still drawn by the reader app's own
 * component, which the markup names and this package does not ship.
 */
function whoDraws(part: Part): string {
  const markup = part.markup ?? "";
  const typed = part.classes.every((name) => new RegExp(`class="[^"]*\\b${name}\\b`).test(markup));
  if (typed || (part.imports.length === 0 && !/<[A-Z]/.test(markup)))
    return "typed on your own element";
  if (part.imports.length === 0)
    return "drawn by the app's own component the markup names; this package does not ship it yet";
  return "a page draws the component, never types these";
}

export function renderPartPage(part: Part, components: Component[], at: Placement = ALONE): string {
  const h = (level: number, text: string): string => `${"#".repeat(level + at.depth)} ${text}`;
  const out = [h(1, `${part.name} (\`${part.id}\`)`), "", part.summary, ""];
  if (part.imports.length > 0)
    out.push(h(2, "Import"), "", ...part.imports.map((name) => `- \`${name}\``), "");
  if (part.markup) out.push(h(2, "Markup"), "", "```astro", part.markup, "```", "");
  out.push(h(2, "Use when"), "", ...part.when.map((item) => `- ${item}`), "");
  if (part.not?.length)
    out.push(
      h(2, "Not when"),
      "",
      ...part.not.map((item) =>
        item.use.startsWith("nothing")
          ? `- ${item.when}: ${item.use}`
          : `- ${item.when}: use [\`${item.use}\`](${at.links}${item.use}.md)`,
      ),
      "",
    );
  if (part.rules?.length) out.push(h(2, "Rules"), "", ...part.rules.map((rule) => `- ${rule}`), "");
  if (part.experimental?.length)
    out.push(
      h(2, "Experimental options"),
      "",
      ...part.experimental.map(
        (item) => `- \`${item.option}\` (since ${item.since}): ${item.reason}`,
      ),
      "",
    );
  for (const component of componentsOf(part, components))
    out.push(...propsSection(component, at.depth), "");
  if (part.tokens.length > 0)
    out.push(h(2, "Tokens it reads"), "", part.tokens.map((name) => `\`${name}\``).join(" "), "");
  out.push(
    h(2, "Where it is drawn"),
    "",
    `- Classes: ${part.classes.map((name) => `\`.${name}\``).join(" ")} (${whoDraws(part)})`,
    `- Styled in: ${part.styles.length > 0 ? part.styles.map((path) => `\`${inPackage(path)}\``).join(", ") : "no stylesheet in this package yet"}`,
  );
  if (part.files?.length)
    out.push(`- Files: ${part.files.map((path) => `\`${inPackage(path)}\``).join(", ")}`);
  if (part.usage) out.push("", h(2, "Owner's note"), "", part.usage);
  return `${out.join("\n").trimEnd()}\n`;
}

/** A component no part covers yet (Avatar, Flag), with its import and props. */
function renderComponentPage(component: Component, at: Placement): string {
  return [
    `${"#".repeat(1 + at.depth)} ${component.name}`,
    "",
    `Import \`${component.import}\`. No part covers it yet, so \`ds find\` does not name it.`,
    "",
    ...propsSection(component, at.depth),
    "",
  ].join("\n");
}

/**
 * llms.txt, then foundations.md, then every part page, then each component no part covers: one
 * fetch holds the system. Foundations' headings go one level down, as the part pages' do.
 */
export function renderLlmsFull(system: System, llms: string, foundations: string): string {
  const covered = new Set(system.parts.flatMap((part) => part.imports));
  const pages = [
    ...system.parts.map((part) => renderPartPage(part, system.components, IN_FULL)),
    ...system.components
      .filter((component) => !covered.has(component.import))
      .map((component) => renderComponentPage(component, IN_FULL)),
  ];
  // Headings only (a `#` at a line's start followed by a space), so a `#120` reference stays as it is.
  const rules = foundations.replace(/^(#+) /gm, "#$1 ").trimEnd();
  // The index's pointer to foundations.md points down the page here, where its text already is.
  const index = llms.replace(FOUNDATIONS_LINK, "Foundations (below)").trimEnd();
  return [index, rules, ...pages.map((page) => page.trimEnd())].join("\n\n---\n\n").concat("\n");
}
