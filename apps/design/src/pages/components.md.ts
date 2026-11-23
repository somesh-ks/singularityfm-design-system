import system from "@singularity/design-system/tokens/system.json";
import type { APIRoute } from "astro";
import { COMPONENT_GROUPS } from "../lib/sections";

export const GET: APIRoute = () => {
  const lines = [
    "---",
    `version: ${JSON.stringify(system.version)}`,
    "id: components",
    'name: "Components"',
    "kind: index",
    "imports: []",
    "---",
    "",
    "# Components",
    "",
    "Every component the library ships, grouped by what it does for a person.",
    "",
  ];
  for (const group of COMPONENT_GROUPS) {
    lines.push(`## ${group.label}`, "", group.note, "");
    for (const page of group.pages) {
      const slug = page.path.split("/").pop() ?? "";
      lines.push(`- [${page.label}](components/${slug}.md): ${page.note}`);
    }
    lines.push("");
  }
  return new Response(`${lines.join("\n").trimEnd()}\n`, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
