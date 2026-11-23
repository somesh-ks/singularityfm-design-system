import { ICON_PATHS } from "@singularity/design-system/icons";
import system from "@singularity/design-system/tokens/system.json";
import type { APIRoute } from "astro";
import { component, primitive, semantic } from "../lib/guide";

export const GET: APIRoute = () => {
  const pick = (tokens: ReturnType<typeof primitive.get>) => tokens ?? [];
  const sections: [string, ReturnType<typeof pick>][] = [
    ["Space", pick(primitive.get("space"))],
    ["Radius", pick(primitive.get("radius"))],
    ["Stroke", pick(primitive.get("stroke"))],
    ["Shadow", pick(semantic.get("shadow"))],
    ["Layers", pick(primitive.get("z"))],
    [
      "Layout",
      [
        ...pick(semantic.get("layout")),
        ...pick(semantic.get("breakpoint")),
        ...pick(semantic.get("size")),
      ],
    ],
  ];
  const lines = [
    "---",
    `version: ${JSON.stringify(system.version)}`,
    "id: tokens",
    'name: "Tokens"',
    "kind: foundation",
    "imports: []",
    "---",
    "",
    "# Tokens",
    "",
  ];
  for (const [title, tokens] of sections) {
    lines.push(`## ${title}`, "");
    for (const token of tokens)
      lines.push(
        `- \`${token.name}\`: ${token.value}${token.description ? ` (${token.description})` : ""}`,
      );
    lines.push("");
  }
  lines.push("## Component tokens", "");
  for (const [group, tokens] of component.entries()) {
    lines.push(`### ${group}`, "");
    for (const token of tokens) lines.push(`- \`${token.name}\`: ${token.value}`);
    lines.push("");
  }
  lines.push(
    "## Icons",
    "",
    Object.keys(ICON_PATHS)
      .sort()
      .map((name) => `\`${name}\``)
      .join(", "),
  );
  return new Response(`${lines.join("\n").trimEnd()}\n`, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
