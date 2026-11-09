import type { CSSProperties } from "react";

/**
 * The HTML names a deprecated .astro path takes whose React name differs. React drops a boolean under
 * the HTML name (`<Field readonly />` would come out editable) and warns on the rest, so each one
 * reaches the element under React's name.
 */
const REACT_NAMES: Record<string, string> = {
  accesskey: "accessKey",
  autocapitalize: "autoCapitalize",
  autocomplete: "autoComplete",
  autofocus: "autoFocus",
  enterkeyhint: "enterKeyHint",
  formaction: "formAction",
  formenctype: "formEncType",
  formmethod: "formMethod",
  formnovalidate: "formNoValidate",
  formtarget: "formTarget",
  hreflang: "hrefLang",
  inputmode: "inputMode",
  maxlength: "maxLength",
  minlength: "minLength",
  popovertarget: "popoverTarget",
  popovertargetaction: "popoverTargetAction",
  readonly: "readOnly",
  referrerpolicy: "referrerPolicy",
  spellcheck: "spellCheck",
  tabindex: "tabIndex",
};

/**
 * The attributes a component passes on to its element, as a plain element would print them. A bare
 * data attribute (data-submit) reaches a React component as true and would print as
 * data-submit="true"; on a plain element it is empty. Scripts read both, so the element keeps the
 * empty form.
 */
export const passedAttributes = (passed: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(passed).map(([name, value]) => [
      REACT_NAMES[name] ?? name,
      value === true && name.startsWith("data-") ? "" : value,
    ]),
  );

/**
 * A style string's declarations: split at each `;` outside quotes and parentheses, so a value that holds
 * one (`url(data:image/png;base64,...)`, `content: ";"`) stays whole.
 */
function declarations(style: string): string[] {
  const out: string[] = [];
  let quote = "";
  let depth = 0;
  let start = 0;
  for (let at = 0; at < style.length; at += 1) {
    const character = style[at];
    if (character === "\\") at += 1;
    else if (quote) quote = character === quote ? "" : quote;
    else if (character === '"' || character === "'") quote = character;
    else if (character === "(") depth += 1;
    else if (character === ")") depth = Math.max(0, depth - 1);
    else if (character === ";" && depth === 0) {
      out.push(style.slice(start, at));
      start = at + 1;
    }
  }
  return [...out, style.slice(start)];
}

/**
 * A `style="order: 1"` string, the form an `.astro` component took and its deprecated shim still
 * passes on, as the object React requires: React throws on a string style, and the deprecated path
 * keeps its open attributes (COMPATIBILITY.md). A property name holds no colon, so the first one
 * ends it. RowExit, Field, Switch and Slider take either form.
 */
export function styleObject(style: string): CSSProperties {
  const entries = declarations(style)
    .map((declaration) => declaration.split(/:(.*)/s))
    .filter(([name, value]) => name?.trim() && value?.trim())
    .map(([name = "", value = ""]) => {
      const property = name.trim();
      return [
        property.startsWith("--")
          ? property
          : property
              .replace(/^-ms-/, "ms-")
              .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()),
        value.trim(),
      ];
    });
  return Object.fromEntries(entries);
}
