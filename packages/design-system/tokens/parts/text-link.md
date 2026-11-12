# Text link (`text-link`)

A link inside a line of small text; the words stay inline, the target is 44px.

## Import

- `@singularityfm/design-system/Link`

## Markup

```astro
<Link href="/settings">Settings</Link>
```

## Use when

- A link inside a hint, a sentence or a breadcrumb

## Not when

- It stands alone as an action: use [`button-text`](button-text.md)
- The control does something on this page: use [`button-text`](button-text.md)
- It is the one action of a surface, even one that goes to an address: use [`button-filled`](button-filled.md)

## Rules

- A link is a real <a href>; an action on this page is a Button.

## Props of Link

| Name | Type | Default | What it does |
| --- | --- | --- | --- |
| `href` | `string` | - | Where it goes. A link always has an address; an action on this page is a Button. |
| `variant?` | `"text" \| "source"` | `"text"` | Text (the default), a link in a line of words, or source, a story's publisher (link.ts). |
| `className?` | `string` | - | For placing the link where it stands, or a hook a page's rule or script finds it by. Never its look. An Astro page passes className too: @astrojs/react drops a `class` prop. |
| `slot?` | `string` | - | Astro places the link in its parent's slot with it; it is not an attribute of the link. |
| `children` | `ReactNode` | - | The words. |

Every attribute of a native `<a>` element passes through.

## Tokens it reads

`--size-touch`

## Where it is drawn

- Classes: `.text-link` (a page draws the component, never types these)
- Styled in: `styles/primitives.css`
- Files: `src/Link.tsx`, `src/link.ts`

## Owner's note

A link inside a line of small text (a settings hint): the words stay inline, the touch target is 44px tall through a hit layer centred on the line (D189 sweep, layout.spec.ts). Usage: class="text-link".
