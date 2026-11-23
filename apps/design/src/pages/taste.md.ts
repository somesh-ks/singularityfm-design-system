import system from "@singularity/design-system/tokens/system.json";
import type { APIRoute } from "astro";
import { TASTE_GROUPS } from "../lib/taste";

export const GET: APIRoute = () => {
  const lines = [
    "---",
    `version: ${JSON.stringify(system.version)}`,
    "id: taste",
    'name: "Taste"',
    "kind: foundation",
    "imports: []",
    "---",
    "",
    "# Taste",
    "",
    "Owner taste rules grouped by concern.",
    "",
  ];
  for (const group of TASTE_GROUPS) {
    lines.push(`## ${group.label}`, "");
    if (group.note) lines.push(group.note, "");
    for (const item of group.values)
      lines.push(`- **${item.title}**: ${item.rule}${item.refs ? ` (${item.refs})` : ""}`);
    lines.push("");
  }
  return new Response(`${lines.join("\n").trimEnd()}\n`, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
