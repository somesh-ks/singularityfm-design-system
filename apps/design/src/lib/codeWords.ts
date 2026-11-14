/**
 * Words a reader types into a component page's text control, written as the Code snippet needs them
 * where they land: in JSX an ampersand is an entity (JSX reads "&amp;" as "&"), between tags a brace
 * or bracket is a literal ({"{"}), in an attribute a quote is an entity, and in a JavaScript string the
 * quote and backslash are escaped. `open` is the character before the words (a quote or ">"),
 * `preceding` the one before that ("=" for an attribute).
 */
export function inCode(value: string, open: string, preceding: string): string {
  if (open === ">")
    return value.replace(/[{}<>]/g, (char) => `{"${char}"}`).replaceAll("&", "&amp;");
  if (preceding === "=")
    return value.replaceAll("&", "&amp;").replaceAll(open, open === '"' ? "&quot;" : "&#39;");
  return value.replace(/\\/g, "\\\\").replaceAll(open, `\\${open}`);
}
