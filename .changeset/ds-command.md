---
"@singularityfm/design-system": minor
---

The lookup is a command now: `pnpm exec ds find "<need>"` (also `part`, `token`, `list`, `validate`) replaces `tsx node_modules/@singularityfm/design-system/scripts/system/cli.ts`, with `--json` on every command, `ds batch` for several lookups in one call, `ds version`, and a corrected search when a word is misspelt. A usage error (unknown command, missing argument) exits 2; no match exits 1.
