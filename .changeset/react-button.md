---
"@singularityfm/design-system": minor
---

The Button is a React component (DS-3): import it as `@singularityfm/design-system/Button`. `Button.astro` still resolves, to the same component, and is deprecated. An Astro app now needs `react`, `react-dom` (^19.3) and `@astrojs/react` in its integrations, and passes `className` instead of `class` to place a Button (`@astrojs/react` drops `class`). Markup and look are unchanged; a static Button renders on the server and ships no script.
