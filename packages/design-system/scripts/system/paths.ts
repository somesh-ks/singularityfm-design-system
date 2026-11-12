/**
 * Where the package's lookup files are, from wherever this module runs: its own source file in the
 * repository, or the bundled `bin/ds.mjs` in an app's node_modules. A path fixed relative to this
 * file would break in the bundle, which sits at a different depth.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const NAME = "@singularityfm/design-system";

/** The nearest folder above this module whose package.json is this package. */
function packageRoot(): string {
  let folder = dirname(fileURLToPath(import.meta.url));
  for (;;) {
    const manifest = join(folder, "package.json");
    if (existsSync(manifest) && JSON.parse(readFileSync(manifest, "utf8")).name === NAME)
      return folder;
    const parent = dirname(folder);
    if (parent === folder) throw new Error(`No ${NAME} package.json above ${import.meta.url}`);
    folder = parent;
  }
}

export const PACKAGE = packageRoot();
export const SYSTEM_PATH = join(PACKAGE, "tokens/system.json");
export const LLMS_PATH = join(PACKAGE, "tokens/llms.txt");
