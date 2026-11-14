import foundations from "@singularity/design-system/tokens/foundations.md?raw";
import type { APIRoute } from "astro";

// The rules for every screen (DS-12), served as written at /design/foundations.md, where llms.txt links.
export const GET: APIRoute = () =>
  new Response(foundations, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
