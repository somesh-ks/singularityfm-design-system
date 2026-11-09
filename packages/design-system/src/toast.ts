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
    "A failure that clears itself, or a partial save.",
    "A run that finished while its sheet was closed.",
  ],
  dontUseWhen: [
    { when: "A notice that must stay.", instead: "Banner" },
    { when: "An action simply worked: a success or Saved confirmation says nothing (D115)." },
    { when: "A person must decide before going on.", instead: "Dialog" },
  ],
};

/** Every class the Toast draws, for the registry and its test. */
export const TOAST_CLASSES: string[] = [
  "toast-popover",
  "toast-icon",
  "toast-text",
  "toast-action",
  "toast-dismiss",
];

/** Classes the Toast replaced; none may be written again, in any app that draws the system. */
export const TOAST_RETIRED: string[] = [];
