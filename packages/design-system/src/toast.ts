/**
 * The Toast: one quiet message at a time on the inverse surface, with at most one action. The one
 * place its classes are written. Toast.tsx renders from it, toastStore.ts holds the message it shows
 * and toastEvent.ts asks for one from code that must not load the store; the style guide lists TOAST.
 * The rules are in styles/toast.css.
 */
import type { Guidance } from "./guidance.ts";

export const TOAST: Guidance = {
  summary: "One quiet message at a time on the inverse surface, with an optional action.",
  useWhen: [
    "A brief message with Undo after a delete.",
    "A failure, which stays with its close button until it is closed or retried, or a partial save.",
    "A run that finished while its sheet was closed.",
  ],
  dontUseWhen: [
    { when: "A notice that must stay.", instead: "Banner" },
    { when: "An action simply worked: a success or Saved confirmation says nothing (D115)." },
    { when: "A person must decide before going on.", instead: "Dialog" },
  ],
};

/**
 * The classes the Toast draws, for the registry and its test. Its root, `toast`, is drawn too (and
 * system.json lists it, so it stays: COMPATIBILITY.md) but is left out here: the registry's classes
 * are what the class-on-component rule reads in any string, and the bare word would flag "toast" in
 * prose, keys and event names.
 * shortcut: a page that types class="toast" by hand is not caught; rename the root in the next major.
 */
export const TOAST_CLASSES: string[] = [
  "toast-icon",
  "toast-text",
  "toast-action",
  "toast-dismiss",
];

/** Classes the Toast replaced; none may be written again, in any app that draws the system. */
export const TOAST_RETIRED: string[] = [];
