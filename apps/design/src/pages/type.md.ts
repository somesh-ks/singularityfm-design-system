import system from "@singularity/design-system/tokens/system.json";
import type { APIRoute } from "astro";
import { primitive, semantic } from "../lib/guide";

export const GET: APIRoute = () => {
  const roles = semantic.get("text") ?? [];
  const fonts = primitive.get("font") ?? [];
  const sizes = fonts.filter((token) => token.path.startsWith("font.size."));
  const leading = fonts.filter((token) => token.path.startsWith("font.leading."));
  const lines = [
    "---",
    `version: ${JSON.stringify(system.version)}`,
    "id: type",
    'name: "Typography"',
    "kind: foundation",
    "imports: []",
    "---",
    "",
    "# Typography",
    "",
    "Google Sans Flex (latin only, metric-matched fallback). Two weights: regular (400) and medium (500).",
    "",
    "## Roles",
    "",
    "| Token | Spec | Notes |",
    "| --- | --- | --- |",
    ...roles.map((role) => `| \`${role.name}\` | ${role.value} | ${role.description ?? "-"} |`),
    "",
    "## Font sizes",
    "",
    ...sizes.map((token) => `- \`${token.name}\`: ${token.value}`),
    "",
    "## Line heights",
    "",
    ...leading.map((token) => `- \`${token.name}\`: ${token.value}`),
  ];
  return new Response(`${lines.join("\n").trimEnd()}\n`, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
