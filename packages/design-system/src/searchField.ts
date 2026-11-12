/**
 * The Search field: a filled pill with the search glyph and its input, to filter a list by text
 * (D243: Field, Search field and Select are three components that share the field tokens). The one
 * place its classes are written. SearchField.tsx renders from it; the style guide lists SEARCH_FIELD.
 * The rules are in styles/search-field.css; a clearable field's button is wired by installSearchClear().
 */
import type { Guidance } from "./guidance.ts";

export const SEARCH_FIELD: Guidance = {
  summary: "The rounded search pill, on the container tone, with its glyph.",
  useWhen: ["Search or filter a list by text: the Library, Sources, Downloads."],
  dontUseWhen: [
    { when: "A text field in a form.", instead: "Field" },
    { when: "A person picks one of a known list.", instead: "Select" },
  ],
  experimental: [
    {
      option: "clearable",
      hook: "search-wrap",
      reason:
        "A Clear text button in the field (owner, 2026-10-08, ledger reading-library.md): the native one differs in every browser and is hidden, and without room for the button the typed text runs under it. On the Library, the Sources filter, Blocked outlets, Downloads and the emoji search.",
      since: "2026-11-12",
    },
  ],
};

/** Every class the Search field draws, for the registry and its test. */
export const SEARCH_FIELD_CLASSES: string[] = ["search-field", "search-wrap", "search-clear"];

/** Classes the Search field replaced; none may be written again, in any app that draws the system. */
export const SEARCH_FIELD_RETIRED: string[] = [];

const WRAP = ".search-wrap";
const CLEAR = ".search-clear";

let installed = false;

/**
 * Shows a clearable field's Clear button while the field holds text. Typing calls it through
 * installSearchClear(); a page script that sets the value itself (a reset, a query from the address)
 * calls it after.
 */
export function syncSearchClear(input: HTMLInputElement): void {
  const clear = input.closest(WRAP)?.querySelector<HTMLButtonElement>(CLEAR);
  if (clear) clear.hidden = input.value === "";
}

/**
 * Wires every clearable SearchField (SearchField.tsx renders no script, DS-8): its Clear button shows
 * while the field has text, and a press empties the field, fires the input's `input` event, so the
 * page's own filter runs as it does for typing, and keeps the focus in the field for the next query.
 * Call it on each page load: the listeners go on the document once, and each call syncs the fields in
 * the page now (a value the browser restored).
 */
export function installSearchClear(): void {
  for (const input of document.querySelectorAll<HTMLInputElement>(`${WRAP} input`))
    syncSearchClear(input);
  if (installed) return;
  installed = true;
  document.addEventListener("input", (event) => {
    const input = event.target;
    if (input instanceof HTMLInputElement && input.closest(WRAP)) syncSearchClear(input);
  });
  document.addEventListener("click", (event) => {
    const clear = event.target instanceof Element ? event.target.closest(CLEAR) : null;
    const input = clear?.closest(WRAP)?.querySelector<HTMLInputElement>("input");
    if (!input) return;
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  });
}
