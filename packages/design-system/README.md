# @singularityfm/design-system

The components, stylesheets, tokens, fonts and flags that the Singularity reader is drawn with. It ships
source (`.tsx`, `.ts`, and the `.astro` components not yet moved to React), not compiled output: your
build compiles it. The components are React (DS-3), with Base UI where they have behaviour; a static one
renders on the server in an Astro page with no client directive and ships no script.

## Install

```sh
pnpm add @singularityfm/design-system
```

Peer dependencies: `react` and `react-dom` (^19.3.0), `astro` (^7.4.4), and `@base-ui/react` (^1.9.0)
once you draw a component with behaviour. An Astro app adds `@astrojs/react` to its integrations. Node 24
or later.

An Astro page passes `className`, not `class`, to a React component: `@astrojs/react` drops `class`.

## Imports

```astro
---
import Button from "@singularityfm/design-system/Button";
import { buttonClass } from "@singularityfm/design-system/button";
import "@singularityfm/design-system/styles/tokens.css";
import "@singularityfm/design-system/styles/buttons.css";
import tokens from "@singularityfm/design-system/tokens/tokens.json";
---
```

| Path | Resolves to |
| --- | --- |
| `<Name>` | a React component in `src/<Name>.tsx` (each has its own entry in the exports map) |
| `<Name>.astro` | an Astro component in `src/`; for a migrated one, its React component (deprecated, use `<Name>`) |
| `<module>` | a helper in `src/<module>.ts` |
| `styles/*` | a stylesheet; `tokens.css` defines the custom properties the others read |
| `tokens/*` | the token, glyph, cover and system JSON, and `llms.txt` |
| `fonts/*`, `flags/*` | font files (`styles/fonts.css` loads them) and one SVG per country |
| `scripts/themeInit.js` | the head script that sets the theme before first paint |
| `scripts/*` | the token generator and colour helpers (TypeScript) |

CSS files have side effects; everything else can be tree-shaken.

## Versions

Semantic versioning, released with Changesets: weekly, or on demand, and never when no change is pending.
[COMPATIBILITY.md](./COMPATIBILITY.md) says what counts as breaking and how a deprecation runs. Pin an exact
version in an app and take bumps as pull requests. Canary builds (`0.0.0-canary-<sha>`, dist-tag `canary`)
exist only for a library pull request labelled `canary`.

## Licence

MIT (LICENSE). The fonts (SIL OFL 1.1), the flags (Flagpack, MIT) and the icon paths (Phosphor, MIT) keep
their own licences, listed at the end of LICENSE.
