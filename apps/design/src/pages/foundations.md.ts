import foundations from "@singularity/design-system/tokens/foundations.md?raw";
import system from "@singularity/design-system/tokens/system.json";
import type { APIRoute } from "astro";

const FRONT_MATTER = [
  "---",
  `version: ${JSON.stringify(system.version)}`,
  "id: foundations",
  'name: "Foundations"',
  "kind: foundation",
  "imports: []",
  "---",
  "",
  "",
].join("\n");

// The rules for every screen (DS-12), served as written at /design/foundations.md, where llms.txt links.
export const GET: APIRoute = () =>
  new Response(foundations.startsWith("---\n") ? foundations : `${FRONT_MATTER}${foundations}`, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
