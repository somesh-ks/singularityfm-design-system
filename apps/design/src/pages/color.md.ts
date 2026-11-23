import system from "@singularity/design-system/tokens/system.json";
import type { APIRoute } from "astro";
import { COLOR_GROUPS, COLOR_PAIRS, colorToken, componentColors } from "../lib/guide";

export const GET: APIRoute = () => {
  const lines = [
    "---",
    `version: ${JSON.stringify(system.version)}`,
    "id: color",
    'name: "Color"',
    "kind: foundation",
    "imports: []",
    "---",
    "",
    "# Color",
    "",
    "Semantic color roles, measured contrast pairs, and component color bindings.",
    "",
  ];
  for (const group of COLOR_GROUPS) {
    lines.push(`## ${group.title}`, "", group.note, "");
    for (const name of group.names) {
      const token = colorToken(name);
      lines.push(`- \`--color-${name}\`${token?.description ? `: ${token.description}` : ""}`);
    }
    lines.push("");
  }
  lines.push(
    "## Contrast pairs",
    "",
    "| Foreground | Background | Min ratio | Usage |",
    "| --- | --- | --- | --- |",
  );
  for (const pair of COLOR_PAIRS)
    lines.push(
      `| \`--color-${pair.fg}\` | \`--color-${pair.bg}\` | ${pair.min}:1 | ${pair.note} |`,
    );
  const comp = componentColors();
  if (comp.length > 0) {
    lines.push("", "## Component color bindings", "");
    for (const entry of comp)
      lines.push(`- \`${entry.token.name}\` (${entry.group}) -> \`--color-${entry.role}\``);
  }
  return new Response(`${lines.join("\n").trimEnd()}\n`, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
