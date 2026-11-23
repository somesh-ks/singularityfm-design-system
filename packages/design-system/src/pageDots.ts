/**
 * Page dots: which page of a paged grid is showing (the Dial swipes in pages of nine). The one place
 * its classes are written. PageDots.tsx renders from it; the style guide lists PAGE_DOTS. The rules
 * are in styles/page-dots.css.
 */
import type { Guidance } from "./guidance.ts";

export const PAGE_DOTS: Guidance = {
  summary:
    "A row of small dots under a grid that swipes in pages, the current page's dot solid; on a screen with a pointer, Back and Next arrows at the section head instead (PageArrows).",
  useWhen: [
    "A grid that pages sideways: Home's speed dial, nine to a page, three pages at most.",
    "A row that scrolls sideways on desktop: the speed dial, topics, a shelf of cards (PageArrows).",
  ],
  dontUseWhen: [
    { when: "Moving between sections of one page.", instead: "Segmented navigation" },
    { when: "There is one page: draw no dots." },
  ],
};

/** Every class the dots draw, for the registry and its test. */
export const PAGE_DOTS_CLASSES: string[] = ["page-dots-track", "page-dots-arrows"];

/** Classes the dots replaced; none may be written again, in any app that draws the system. */
export const PAGE_DOTS_RETIRED: string[] = [];

/** The class that draws the row, for a script or an island. */
export const pageDotsClass = (): string => "page-dots-track";

/** The class that draws Back and Next, for a script or an island. */
export const pageArrowsClass = (): string => "page-dots-arrows";

let installed = false;

const reduced = (): boolean => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Turns each arrow off at its row's end, so a press that would do nothing cannot be made. */
function syncArrows(row: HTMLElement): void {
  const end = row.scrollWidth - row.clientWidth;
  // Scrolled from the start edge, whichever way the page reads.
  const at = Math.abs(row.scrollLeft);
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    `[aria-controls="${CSS.escape(row.id)}"]`,
  )) {
    if (button.hasAttribute("data-page-prev")) button.disabled = at <= 1;
    if (button.hasAttribute("data-page-next")) button.disabled = at >= end - 1;
  }
}

const rowOf = (button: Element): HTMLElement | null => {
  const id = button.getAttribute("aria-controls");
  return id ? document.getElementById(id) : null;
};

/**
 * Wires every PageArrows on the page: a press moves its row by the row's own width, less a sliver so
 * the last card seen stays in view; the row's snap points settle it on a card's edge.
 */
export function installPageArrows(): void {
  const sync = () => {
    for (const button of document.querySelectorAll("[data-page-next]")) {
      const row = rowOf(button);
      if (row) syncArrows(row);
    }
  };
  sync();
  if (installed) return;
  installed = true;
  addEventListener("resize", sync);
  addEventListener("pageshow", sync);
  document.addEventListener(
    "scroll",
    (event) => {
      if (event.target instanceof HTMLElement && event.target.id) syncArrows(event.target);
    },
    { capture: true, passive: true },
  );
  document.addEventListener("click", (event) => {
    const button =
      event.target instanceof Element
        ? event.target.closest("[data-page-prev], [data-page-next]")
        : null;
    const row = button ? rowOf(button) : null;
    if (!button || !row) return;
    const rtl = getComputedStyle(row).direction === "rtl" ? -1 : 1;
    const step = row.clientWidth * 0.9 * (button.hasAttribute("data-page-prev") ? -1 : 1) * rtl;
    row.scrollBy({ left: step, behavior: reduced() ? "auto" : "smooth" });
  });
}
