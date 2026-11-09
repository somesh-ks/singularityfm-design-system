/**
 * The Search field: a filled pill with the search glyph and its input, to filter a list by text
 * (D243: Field, Search field and Select are three components that share the field tokens). The one
 * place its class is written. SearchField.tsx renders from it; the style guide lists SEARCH_FIELD.
 * The rules are in styles/search-field.css.
 */
import type { Guidance } from "./guidance";

export const SEARCH_FIELD: Guidance = {
  summary: "The rounded search pill, on the container tone, with its glyph.",
  useWhen: ["Search or filter a list by text: the Library, Sources, Downloads."],
  dontUseWhen: [
    { when: "A text field in a form.", instead: "Field" },
    { when: "A person picks one of a known list.", instead: "Select" },
  ],
};

/** Every class the Search field draws, for the registry and its test. */
export const SEARCH_FIELD_CLASSES: string[] = ["search-field"];

/** Classes the Search field replaced; none may be written again, in any app that draws the system. */
export const SEARCH_FIELD_RETIRED: string[] = [];
