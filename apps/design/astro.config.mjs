import react from "@astrojs/react";
import { defineConfig } from "astro/config";

// The style guide (D218, D220): its own app and deploy, served on its own subdomain at the root
// path, so no base. Static: the pages are built from the tokens and need no server.
export default defineConfig({
  site: "https://design.singularityfm.app",
  output: "static",
  trailingSlash: "never",
  compressHTML: true,
  // The library's components are React (DS-3); a static one renders here with no client directive.
  integrations: [react()],
});
