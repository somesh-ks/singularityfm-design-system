---
"@singularityfm/design-system": major
---

BREAKING: the Button is a React component (DS-3). An Astro app adds `react`, `react-dom` (^19.3) and `@astrojs/react` to its integrations, and places a Button with `className` instead of `class` (`@astrojs/react` drops `class`): before `<Button variant="text" class="queue-listen">`, after `<Button variant="text" className="queue-listen">`. Import it as `@singularityfm/design-system/Button`; `Button.astro` still resolves, to the same component, and is deprecated. Markup and look are unchanged; a static Button renders on the server and ships no script.
