---
"@singularityfm/design-system": minor
---

Each part has a markdown page, `tokens/parts/<id>.md` (import, markup, when and when not, props, tokens), and `tokens/llms-full.txt` holds every page in one file. `tokens/llms.txt` takes the llmstxt.org shape: each part id links to its page, and each part keeps one "use when" case there (its page has the rest). The style guide serves them at `/design/parts/<id>.md` and `/design/llms-full.txt`.

`ds part --json` on a miss now keeps `components` a list of component records (empty) and lists the names under `componentNames`, as every other path does.
