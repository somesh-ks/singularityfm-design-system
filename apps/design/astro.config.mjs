import react from "@astrojs/react";
import { defineConfig } from "astro/config";

// The style guide (D218, D220): its own app and deploy, reached at news.someshks.work/design by a
// rewrite in the reader's vercel.json, so every address and asset carries the /design base. Static:
// the pages are built from the tokens and need no server.
export default defineConfig({
  site: "https://news.someshks.work",
  base: "/design",
  output: "static",
  trailingSlash: "never",
  compressHTML: true,
  // The library's components are React (DS-3); a static one renders here with no client directive.
  integrations: [react()],
});
