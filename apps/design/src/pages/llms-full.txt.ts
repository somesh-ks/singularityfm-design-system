import llmsFull from "@singularity/design-system/tokens/llms-full.txt?raw";
import type { APIRoute } from "astro";

// Every part page in one file, for an agent that wants a single fetch, served at /design/llms-full.txt.
export const GET: APIRoute = () =>
  new Response(llmsFull, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
