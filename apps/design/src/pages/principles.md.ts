import system from "@singularity/design-system/tokens/system.json";
import type { APIRoute } from "astro";

const PRINCIPLES = [
  {
    title: "A real app",
    line: "A podcast app first: tonal, flat, no outlines except on text fields.",
    ref: "D31, D72",
  },
  {
    title: "Nothing moves unasked",
    line: "Controls hold one box through every state.",
    ref: "D94, D95",
  },
  { title: "Quiet and live", line: "It speaks only when the reader can act.", ref: "D94, D115" },
  {
    title: "Looks like what it does",
    line: "A glyph says the press; a disabled control stays, dimmed.",
    ref: "D92, D98",
  },
  {
    title: "Less is more",
    line: "Fewer controls, fewer words, one filled action per screen.",
    ref: "D77, D84, D96",
  },
  {
    title: "Space makes the hierarchy",
    line: "Wide steps, the 8pt grid, regular weight, nothing bold.",
    ref: "D31, D73, D125, D131",
  },
  {
    title: "Every control is complete",
    line: "A 44px target, a sound, a press state, a focus ring.",
    ref: "D72, D101",
  },
  {
    title: "Accessible to the standard",
    line: "WCAG 2.2 AA; color is never the only signal.",
    ref: "D54",
  },
  {
    title: "Tokens are the only values",
    line: "Primitive, semantic, component; no literals.",
    ref: "D131",
  },
  {
    title: "Fixes with a reason stay",
    line: "A dated rule is load-bearing: extend it or ask.",
    ref: "",
  },
];

const BANS = [
  "Outlined boxes and cards in cards",
  "Gradient washes, grey shadows, cream, terracotta",
  "Italic accents, monospace eyebrows, all caps",
  "A chevron on the bar, a grabber, a drag handle",
  "A meta line above a headline",
  "Em dashes",
];

export const GET: APIRoute = () => {
  const lines = [
    "---",
    `version: ${JSON.stringify(system.version)}`,
    "id: principles",
    'name: "Principles"',
    "kind: foundation",
    "imports: []",
    "---",
    "",
    "# Principles",
    "",
    "## What it follows",
    "",
    ...PRINCIPLES.map(
      (item) => `- **${item.title}**: ${item.line}${item.ref ? ` (${item.ref})` : ""}`,
    ),
    "",
    "## Visual bans",
    "",
    ...BANS.map((ban) => `- ${ban}`),
  ];
  return new Response(`${lines.join("\n").trimEnd()}\n`, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
