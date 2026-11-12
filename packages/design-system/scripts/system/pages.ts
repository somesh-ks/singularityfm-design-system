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

/** The components a part imports, in its own order. */
export function componentsOf(part: Part, components: Component[]): Component[] {
  return part.imports.flatMap((name) =>
    components.filter((component) => component.import === name),
  );
}

/** A component's props as a table, and the element it passes attributes to. */
export function propsSection(component: Component): string[] {
  const out = [`## Props of ${component.name}`, ""];
  if (component.props.length === 0) out.push("No props of its own.");
  else {
    out.push("| Name | Type | Default | What it does |", "| --- | --- | --- | --- |");
    for (const prop of component.props) {
      const type = prop.values
        ? prop.values.map((value) => `"${value}"`).join(" \\| ")
        : cell(prop.type);
      out.push(
        `| \`${prop.name}${prop.required ? "" : "?"}\` | \`${type}\` | ${prop.default ? `\`${cell(prop.default)}\`` : "-"} | ${cell(prop.description) || "-"} |`,
      );
    }
  }
  if (component.element)
    out.push("", `Every attribute of a native \`${component.element}\` passes through.`);
  return out;
}

export function renderPartPage(part: Part, components: Component[]): string {
  const out = [`# ${part.name} (\`${part.id}\`)`, "", part.summary, ""];
  if (part.imports.length > 0)
    out.push("## Import", "", ...part.imports.map((name) => `- \`${name}\``), "");
  if (part.markup) out.push("## Markup", "", "```astro", part.markup, "```", "");
  out.push("## Use when", "", ...part.when.map((item) => `- ${item}`), "");
  if (part.not?.length)
    out.push(
      "## Not when",
      "",
      ...part.not.map((item) =>
        item.use.startsWith("nothing")
          ? `- ${item.when}: ${item.use}`
          : `- ${item.when}: use [\`${item.use}\`](${item.use}.md)`,
      ),
      "",
    );
  if (part.rules?.length) out.push("## Rules", "", ...part.rules.map((rule) => `- ${rule}`), "");
  if (part.experimental?.length)
    out.push(
      "## Experimental options",
      "",
      ...part.experimental.map(
        (item) => `- \`${item.option}\` (since ${item.since}): ${item.reason}`,
      ),
      "",
    );
  for (const component of componentsOf(part, components)) out.push(...propsSection(component), "");
  if (part.tokens.length > 0)
    out.push("## Tokens it reads", "", part.tokens.map((name) => `\`${name}\``).join(" "), "");
  out.push(
    "## Where it is drawn",
    "",
    `- Classes: ${part.classes.map((name) => `\`.${name}\``).join(" ")} (a page draws the component, never types these)`,
    `- Styled in: ${part.styles.map((path) => `\`${inPackage(path)}\``).join(", ")}`,
  );
  if (part.files?.length)
    out.push(`- Files: ${part.files.map((path) => `\`${inPackage(path)}\``).join(", ")}`);
  if (part.usage) out.push("", "## Owner's note", "", part.usage);
  return `${out.join("\n").trimEnd()}\n`;
}

/** A component no part covers yet (Avatar, Flag), with its import and props. */
function renderComponentPage(component: Component): string {
  return [
    `# ${component.name}`,
    "",
    `Import \`${component.import}\`. No part covers it yet, so \`ds find\` does not name it.`,
    "",
    ...propsSection(component),
    "",
  ].join("\n");
}

/** llms.txt, then every part page, then each component no part covers: one fetch holds the system. */
export function renderLlmsFull(system: System, llms: string): string {
  const covered = new Set(system.parts.flatMap((part) => part.imports));
  const pages = [
    ...system.parts.map((part) => renderPartPage(part, system.components)),
    ...system.components
      .filter((component) => !covered.has(component.import))
      .map(renderComponentPage),
  ];
  return [
    llms.trimEnd(),
    ...pages.map((page) => page.replace(/^# /, "## ").replace(/\n## /g, "\n### ")),
  ]
    .join("\n\n---\n\n")
    .concat("\n");
}
