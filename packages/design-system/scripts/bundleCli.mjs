// Bundles the `ds` lookup (scripts/system/cli.ts) into one JavaScript file, bin/ds.mjs, which the
// package's `bin` names. The package ships TypeScript source for an app's build to compile, but a
// command runs under plain Node, which will not strip types inside node_modules. One bundle also
// starts in about 50 ms, where tsx takes about 200. `prepack` runs this, so `pnpm pack`, the
// pack-and-install test and every release build it; the file is never committed.
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

await build({
  entryPoints: [fileURLToPath(new URL("system/cli.ts", import.meta.url))],
  outfile: fileURLToPath(new URL("../bin/ds.mjs", import.meta.url)),
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  banner: { js: "#!/usr/bin/env node" },
  logLevel: "warning",
});
