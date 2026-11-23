import system from "@singularity/design-system/tokens/system.json";
import type { APIRoute } from "astro";
import { primitive } from "../lib/guide";

export const GET: APIRoute = () => {
  const pick = (group: string) => primitive.get(group) ?? [];
  const durations = pick("duration");
  const eases = pick("ease");
  const interaction = [
    ...pick("spring"),
    ...pick("scale"),
    ...pick("distance"),
    ...pick("state"),
    ...pick("opacity"),
    ...pick("blur"),
  ];
  const lines = [
    "---",
    `version: ${JSON.stringify(system.version)}`,
    "id: motion",
    'name: "Motion"',
    "kind: foundation",
    "imports: []",
    "---",
    "",
    "# Motion",
    "",
    "Nothing in the app moves that the reader did not move.",
    "",
    "## Durations",
    "",
    ...durations.map((token) => `- \`${token.name}\`: ${token.value}`),
    "",
    "## Easing curves",
    "",
    ...eases.map((token) => `- \`${token.name}\`: ${token.value}`),
    "",
    "## Interaction tokens",
    "",
    ...interaction.map((token) => `- \`${token.name}\`: ${token.value}`),
  ];
  return new Response(`${lines.join("\n").trimEnd()}\n`, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
