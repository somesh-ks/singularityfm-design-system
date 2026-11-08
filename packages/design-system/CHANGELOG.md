# @singularityfm/design-system

## 0.1.1

### Patch Changes

- 8ff8f43: Dialog: stacked answers hug their labels and line up at the end, as a row of answers already did.

## 0.1.0

### Minor Changes

- 0608083: First release: the components, stylesheets, tokens, fonts and flags the Singularity reader is drawn with.
- d61abb2: The Button is a React component (DS-3). Nothing was published before it, so it ships in the first release, 0.1.0; against the copy the app drew from its own workspace it is breaking: An Astro app adds `react`, `react-dom` (^19.3) and `@astrojs/react` to its integrations, and places a Button with `className` instead of `class` (`@astrojs/react` drops `class`): before `<Button variant="text" class="queue-listen">`, after `<Button variant="text" className="queue-listen">`. Import it as `@singularityfm/design-system/Button`; `Button.astro` still resolves, to the same component, and is deprecated. Markup and look are unchanged; a static Button renders on the server and ships no script.
