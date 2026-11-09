/**
 * The Segmented navigation: a tonal track of tabs with one pill that slides under the chosen one,
 * to switch what shows below it (D132, D243). The one place its classes are written.
 * SegmentedNav.tsx renders its markup (DS-8); the style guide lists SEGMENTED_NAV. The rules are in
 * styles/primitives.css.
 *
 * Its behaviour, below, moved as it was from the reader's scripts/segmentedNav.ts: a tablist whose tabs
 * a press or Left, Right, Home and End choose. The chosen tab is aria-selected and the only one in the
 * Tab order. `onSelect` hears the chosen tab's data-value after the tabs show it. Kept small: the topic
 * pages load it first. A page that draws a SegmentedNav calls mountSegmentedNav() once for each list.
 */
import type { Guidance } from "./guidance.ts";

export type SegmentedNavSize = "default" | "compact";

export const SEGMENTED_NAV: Guidance & {
  sizes: Record<SegmentedNavSize, Guidance & { label: string }>;
} = {
  summary: "A tonal track with one sliding pill: switch between views of the same content.",
  useWhen: [
    "Switch the view of one page or panel without leaving it: a topic's Sources and Preferences.",
  ],
  dontUseWhen: [
    { when: "Choosing the value of a setting.", instead: "Segmented choice" },
    { when: "The parts are sections of one long page, reached by scrolling: links, not tabs." },
  ],
  sizes: {
    default: {
      label: "Default",
      summary: "The track's full height, 48px, each tab a word.",
      useWhen: ["The views are named in words, across a panel or a settings row."],
      dontUseWhen: [
        {
          when: "It sits in a row of chips, with a glyph for each view.",
          instead: "Segmented navigation.compact",
        },
      ],
    },
    compact: {
      label: "Compact",
      summary: "A chip's height on 44px columns, a glyph a tab, to sit in a row of chips.",
      useWhen: ["A chart's view switch beside its filter chips: Chart or Table."],
      dontUseWhen: [
        { when: "The views need words to be told apart.", instead: "Segmented navigation.default" },
      ],
    },
  },
};

/** Every class the Segmented navigation draws, for the registry and its test. */
export const SEGMENTED_NAV_CLASSES: string[] = [
  "segmented-nav",
  "segmented-nav-tab",
  "segmented-nav-compact",
];

/** Classes the Segmented navigation replaced; none may be written again, in any app that draws the system. */
export const SEGMENTED_NAV_RETIRED: string[] = [];

const TAB = '[role="tab"]';

/** Marks `value`'s tab as the chosen one, without telling anyone: a view read from the address. */
export function selectTab(list: HTMLElement, value: string): void {
  for (const tab of list.querySelectorAll<HTMLElement>(TAB)) {
    const on = tab.dataset.value === value;
    tab.ariaSelected = String(on);
    tab.tabIndex = on ? 0 : -1;
  }
}

export function mountSegmentedNav(list: HTMLElement, onSelect: (value: string) => void): void {
  list.addEventListener("click", (event) => {
    const tab = (event.target as Element).closest<HTMLElement>(TAB);
    if (!tab || tab.ariaSelected === "true") return;
    const value = tab.dataset.value ?? "";
    selectTab(list, value);
    onSelect(value);
    // A list with data-param keeps its choice in the address (the first tab is the default), so a
    // reload or Back finds it; the address's other parameters stay.
    const param = list.dataset.param;
    if (param) {
      const url = new URL(location.href);
      if (tab === list.querySelector(TAB)) url.searchParams.delete(param);
      else url.searchParams.set(param, value);
      history.replaceState(history.state, "", url);
    }
  });
  list.addEventListener("keydown", (event) => {
    const tabs = [...list.querySelectorAll<HTMLElement>(TAB)];
    const at = tabs.indexOf(event.target as HTMLElement);
    const n = tabs.length;
    const to = { ArrowLeft: at - 1, ArrowRight: at + 1, Home: 0, End: n - 1 }[event.key];
    if (at < 0 || to === undefined) return;
    event.preventDefault();
    // A click, so the tab sounds as a press does (the reader's uiSound.ts) and the choice runs once.
    const tab = tabs[(to + n) % n];
    tab?.focus();
    tab?.click();
  });
}
