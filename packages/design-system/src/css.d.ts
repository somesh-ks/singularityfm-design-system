/**
 * A component imports its own stylesheet (Icon.tsx imports icon.css), as its .astro file did, and the
 * app's bundler serves it. The repository's typecheck loads no bundler's client types, so this lets it
 * check those imports.
 */
declare module "*.css";
