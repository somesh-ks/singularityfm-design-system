# Source link (`source-link`)

The one link out of a story: the publisher's name, underlined on hover.

## Import

- `@singularityfm/design-system/Link`

## Markup

```astro
<Link variant="source" href={url} target="_blank" rel="noopener noreferrer">{publisher}</Link>
```

## Use when

- Name the publisher a story or a highlight came from

## Not when

- It sits inside a sentence: use [`text-link`](text-link.md)
- The control does something on this page: use [`button-text`](button-text.md)
- It is the one action of a surface, even one that goes to an address: use [`button-filled`](button-filled.md)

## Rules

- One source link everywhere, the player's included: no page draws its own copy.

## Props of Link

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `children` | `ReactNode` | - | The words. |
| `variant?` | `"text" \| "source"` | `"text"` | Text (the default), a link in a line of words, or source, a story's publisher (link.ts). |
| `href` | `string` | - | Where it goes. A link always has an address; an action on this page is a Button. |
| `className?` | `string` | - | For placing the link where it stands, or a hook a page's rule or script finds it by. Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop. |
| `slot?` | `string` | - | Astro places the link in its parent's slot with it; it is not an attribute of the link. |

Every attribute of a native `<a>` element passes through.

## Tokens it reads

`--button-radius` `--color-accent` `--color-accent-pressed` `--size-icon-sm` `--size-touch`

## Where it is drawn

- Classes: `.source-link` (a page draws the component, never types these)
- Styled in: `styles/foundations.css`, `styles/primitives.css`
- Files: `src/Link.tsx`, `src/link.ts`

## Owner's note

The one link out of a story or an episode highlight: the publisher's name (or its host) and an opens-elsewhere glyph. A link, not a button: no container, no fill. On hover an underline draws in under the name from its start (a background on the span, so it animates where text-decoration does not); a press deepens the words to the pressed accent. The padding is taken back at the start, so the words sit where they would without it and the target reaches past them; at the end it stays, so the target never runs past the column.
