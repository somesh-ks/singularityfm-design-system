import llms from "@singularity/design-system/tokens/llms.txt?raw";
import type { APIRoute } from "astro";

const GUIDE_PAGES = [
  "",
  "## Guide shadow pages",
  "Web markdown equivalents for guide sections (each component also serves components/<slug>.md):",
  "- [foundations.md](foundations.md): Screen rules, grid, text roles and layout constraints.",
  "- [color.md](color.md): Semantic color roles, contrast pairs and component color tokens.",
  "- [type.md](type.md): Typeface, semantic text roles, font sizes and leading.",
  "- [motion.md](motion.md): Durations, easing curves and interaction motion tokens.",
  "- [tokens.md](tokens.md): Space, radius, stroke, shadows, layers, layout and icon names.",
  "- [principles.md](principles.md): Core principles and visual bans.",
  "- [taste.md](taste.md): Owner taste rules grouped by concern.",
  "- [components.md](components.md): Index of all component pages and their markdown links.",
  "",
].join("\n");

// The short index of the design system for an agent (D236), served as written at /llms.txt.
export const GET: APIRoute = () =>
  new Response(`${llms.trimEnd()}\n${GUIDE_PAGES}`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
