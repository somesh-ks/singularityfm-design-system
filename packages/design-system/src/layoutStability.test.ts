import { readFileSync } from "node:fs";
import { join } from "node:path";
import { type Browser, chromium, type Page } from "playwright-core";
import { type ElementType, createElement as h, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import Badge from "./Badge.tsx";
import Button from "./Button.tsx";
import Chip from "./Chip.tsx";
import Code from "./Code.tsx";
import Fab from "./Fab.tsx";
import Icon from "./Icon.tsx";
import IconButton from "./IconButton.tsx";
import PlayChip from "./PlayChip.tsx";
import SearchField from "./SearchField.tsx";
import SegmentedChoice from "./SegmentedChoice.tsx";
import SegmentedNav from "./SegmentedNav.tsx";
import Select from "./Select.tsx";
import Switch from "./Switch.tsx";

/**
 * A control's box never depends on its state (DS-9). Each case draws a component the way a page does,
 * in a real browser, in every mood and both themes; flips each state a page can put it in (a glyph
 * swaps, a check shows, a spinner runs, the words change); and fails on any change of the component's
 * width or height, of the place of the words inside it that the case names, or of the place of the
 * element drawn after it. Nothing is compared to a pinned number: each state is compared to the same
 * component at rest.
 *
 * Needs a Chromium: Playwright's, or Chrome (the CI runner has it). CHROMIUM_PATH names one. Without
 * a browser the test skips on a developer's machine and fails in CI.
 */

const STYLES = join(import.meta.dirname, "..", "styles");
// The sheets the style guide loads, in its order, then the component sheets it imports per page.
const SHEETS = [
  "tokens",
  "foundations",
  "buttons",
  "primitives",
  "banner",
  "menu",
  "search-field",
  "sheet",
  "drawer",
  "utilities",
  "fab",
  "icon",
  "glow",
  "switch",
  "select",
  "field",
  "slider",
  "toast",
  "badge",
  "avatar",
  "code",
];
const css = SHEETS.map((name) => readFileSync(join(STYLES, `${name}.css`), "utf8")).join("\n");

const MOODS = [undefined, "expressive", "halloween"] as const;
const THEMES = ["light", "dark"] as const;

const glyph = (name: "heart" | "heartOutline" | "check" | "copy") =>
  renderToStaticMarkup(h(Icon, { name, size: "lg" }));

/** A component with children, which a props type that requires them makes awkward to call with h(). */
const draw = (component: unknown, props: object, ...children: ReactNode[]) =>
  h(component as ElementType, props, ...children);

interface Case {
  name: string;
  el: ReactElement;
  /** Each state: a name and the script a page's own code would run (`el` is the component). */
  states: [state: string, script: string][];
  /** Selectors inside the component whose own place must hold too (its words). */
  watch?: string[];
  /**
   * The element that holds the words a script writes, and the states whose words are longer than the
   * reserve: every other state's words must show whole (a reserve left empty keeps a box still by
   * hiding the words), and these must be cut.
   */
  words?: { selector: string; cut?: string[] };
  /** Measure again with the pointer over the component after each state (a hover that swaps words). */
  hover?: boolean;
  /** The reader's setting the case runs under. */
  reducedMotion?: boolean;
}

const label = (words: string) =>
  `el.querySelector('[data-chip-label]').textContent=${JSON.stringify(words)}`;
const dataState = (state: string) => `el.dataset.state=${JSON.stringify(state)}`;

const PLAY_STATES = ["idle", "current", "played", "preparing", "error", "unavailable"];
// The words the player wrote on the hero's chip, which a deprecated `reserve` still holds (DS-13).
const HERO_WORDS = ["3 min", "88 min left", "13 min left", "Loading", "Processing", "Try again"];

const cases: Case[] = [
  {
    name: "Chip: ticked",
    el: draw(Chip, { name: "topic", value: "design" }, "Design engineering"),
    states: [["ticked", "el.querySelector('input').checked=true"]],
  },
  {
    name: "IconButton: the glyph swaps",
    el: draw(
      IconButton,
      { label: "Favorite", variant: "tonal" },
      h(Icon, { name: "heartOutline", size: "lg" }),
    ),
    states: [["filled heart", `el.innerHTML=${JSON.stringify(glyph("heart"))}`]],
  },
  {
    name: "PlayChip: every state",
    el: h(PlayChip, { label: "3 min" }),
    states: [
      ...PLAY_STATES.map((state) => [state, dataState(state)] as [string, string]),
      // Buffering while it plays: the mark turns to the spinner.
      ["buffering", "el.dataset.state='preparing';el.dataset.playing='true'"],
    ],
    watch: ["[data-chip-label]"],
  },
  {
    name: "PlayChip: the glyph alone, every state",
    el: h(PlayChip, { "aria-label": "Play" }),
    states: [
      ...PLAY_STATES.map((state) => [state, dataState(state)] as [string, string]),
      ["playing", "el.dataset.state='current';el.dataset.playing='true'"],
      ["buffering", "el.dataset.state='preparing';el.dataset.playing='true'"],
    ],
    hover: true,
  },
  {
    name: "PlayChip: the hero's glyph alone, every state",
    el: h(PlayChip, { "aria-label": "Play", primary: true }),
    states: [
      ...PLAY_STATES.map((state) => [state, dataState(state)] as [string, string]),
      ["playing", "el.dataset.state='current';el.dataset.playing='true'"],
      ["buffering", "el.dataset.state='preparing';el.dataset.playing='true'"],
    ],
    hover: true,
  },
  {
    name: "PlayChip: the hero's words, with its reserve",
    el: h(PlayChip, { label: "3 min", reserve: "Processing" }),
    states: HERO_WORDS.map((words) => [words, label(words)]),
    words: { selector: "[data-chip-label]" },
  },
  {
    name: "PlayChip: words longer than the reserve are cut, not grown into",
    el: h(PlayChip, { label: "3 min", reserve: "Play again" }),
    states: [["a long reason", label("You are offline and this cannot play yet")]],
    words: { selector: "[data-chip-label]", cut: ["a long reason"] },
  },
  {
    name: "PlayChip: played, a pointer turns its check to replay and its words stay",
    el: h(PlayChip, { label: "0:24" }),
    states: [["played", dataState("played")]],
    hover: true,
  },
  {
    name: "Button: its words swap, with a reserve",
    el: h(Button, { variant: "tonal", reserve: "Saving…", style: { width: "auto" } }, "Save"),
    states: [
      ["Saving…", "el.querySelector('[data-button-label]').textContent='Saving…'"],
      [
        "a long reason",
        "el.querySelector('[data-button-label]').textContent='Saving your changes failed'",
      ],
    ],
    watch: [".button-label"],
    words: { selector: "[data-button-label]", cut: ["a long reason"] },
  },
  {
    name: "Button: a spinner runs beside its words",
    el: h(
      Button,
      { variant: "filled", style: { width: "16rem" } },
      h("span", { className: "spinner" }),
      h("span", null, "Starting…"),
    ),
    // The words stand where they would with no spinner at all: it takes no room at rest or busy.
    states: [
      ["busy", "el.setAttribute('aria-busy','true')"],
      ["no spinner", "el.querySelector('.spinner').remove()"],
    ],
    watch: ["span:not(.spinner)"],
  },
  {
    name: "Select: picking a longer option, with a reserve",
    el: h(
      Select,
      { variant: "tonal", label: "Order", reserve: "Longest first", defaultValue: "new" },
      h("option", { value: "new" }, "Newest"),
      h("option", { value: "long" }, "Longest first"),
    ),
    states: [["Longest first", "el.querySelector('select').value='long'"]],
  },
  {
    name: "Fab: its words change, with a reserve",
    el: draw(Fab, { label: "Play", icon: "play", reserve: "Resume · 88 min left" }, "Play · 3 min"),
    states: [
      "Resume · 12 min left",
      "Processing",
      "Loading",
      "Try again",
      "A very long reason it cannot play",
    ].map(
      (words) =>
        [
          words,
          `el.querySelector('.create-fab-label > span').textContent=${JSON.stringify(words)}`,
        ] as [string, string],
    ),
    words: { selector: ".create-fab-label > span", cut: ["A very long reason it cannot play"] },
  },
  {
    name: "Fab: folded while reading, with reduced motion it stays extended",
    el: draw(Fab, { label: "Play", icon: "play", reserve: "Resume · 88 min left" }, "Play"),
    states: [["folded", "el.dataset.folded=''"]],
    // The words' own place holds only if their margin and opacity come back with the reserve.
    watch: [".create-fab-label"],
    words: { selector: ".create-fab-label > span" },
    reducedMotion: true,
  },
  {
    name: "SegmentedNav: another tab",
    el: h(SegmentedNav, {
      tabs: [
        { value: "a", label: "Top picks" },
        { value: "b", label: "Design engineering" },
        { value: "c", label: "AI" },
      ],
    }),
    states: [
      [
        "second tab",
        "const t=el.querySelectorAll('[role=tab]');t[0].setAttribute('aria-selected','false');t[1].setAttribute('aria-selected','true')",
      ],
    ],
  },
  {
    name: "SegmentedChoice: another segment",
    el: h(SegmentedChoice, {
      name: "length",
      defaultValue: "a",
      options: [
        { value: "a", label: "Short" },
        { value: "b", label: "Long and detailed" },
      ],
    }),
    states: [["second segment", "el.querySelectorAll('input')[1].checked=true"]],
  },
  { name: "Switch: on", el: h(Switch, {}), states: [["on", "el.checked=true"]] },
  {
    name: "SearchField: typed into",
    el: h(SearchField, { label: "Search" }),
    states: [["text", "el.querySelector('input').value='design systems'"]],
  },
  {
    name: "Code: copied",
    el: h(Code, { text: "pnpm add @singularityfm/design-system", label: "Install" }),
    states: [["copied", "el.setAttribute('data-copied','')"]],
  },
];

/**
 * What is allowed to change its box with its state, and why. A component is added here only for a
 * change the person asked for; each is drawn below, so the list cannot go stale.
 */
const CHANGES_BOX = [
  {
    name: "Fab: folds to its glyph while the page is read",
    el: draw(Fab, { label: "Add", icon: "plus" }, "Add"),
    state: "el.dataset.folded=''",
  },
  {
    name: "Fab with a reserve: folds to its glyph too, the reserve never pins it open",
    el: draw(Fab, { label: "Play", icon: "play", reserve: "Resume · 88 min left" }, "Play"),
    state: "el.dataset.folded=''",
  },
  {
    name: "Badge: grows with its number",
    el: h(Badge, null, "9"),
    state: "el.textContent='10'",
  },
] as const;

/**
 * What hugs its words (owner, 2026-11-13: "in general buttons should hug text"; DS-13): the room around
 * the words is the same whatever they say, so a short word never sits in room held for a longer one,
 * as a story's "0:22" sat in a pill as wide as "Play again". Each is measured with two words.
 */
const HUGS = [
  {
    name: "PlayChip",
    el: h(PlayChip, { label: "0:22" }),
    words: "[data-chip-label]",
    swap: label("Playing"),
  },
  {
    name: "Button",
    el: h(Button, { variant: "tonal", style: { width: "auto" } }, "Save"),
    words: "",
    swap: "el.textContent='Save changes'",
  },
  {
    name: "Fab",
    el: draw(Fab, { label: "Add", icon: "plus" }, "Add"),
    words: ".create-fab-label",
    swap: "el.querySelector('.create-fab-label').textContent='Catch up'",
  },
] as const;

/** The control's width less the width its words take, which hugging keeps the same. */
function room(page: Page, words: string) {
  return page.evaluate((words) => {
    const el = document.querySelector("#w > *") as HTMLElement;
    const range = document.createRange();
    range.selectNodeContents(words ? (el.querySelector(words) as Element) : el);
    return el.getBoundingClientRect().width - range.getBoundingClientRect().width;
  }, words);
}

async function launchBrowser(): Promise<Browser | undefined> {
  let reason = "";
  for (const launch of [
    () => chromium.launch({ executablePath: process.env.CHROMIUM_PATH }),
    () => chromium.launch({ channel: "chrome" }),
  ]) {
    try {
      return await launch();
    } catch (error) {
      reason = String(error).split("\n")[0] ?? "";
    }
  }
  if (process.env.CI) throw new Error(`layoutStability needs a Chromium: ${reason}`);
  return undefined;
}

const browser = await launchBrowser();
afterAll(async () => {
  await browser?.close();
});

async function stage(page: Page, mood: string | undefined, theme: string, html: string) {
  await page.evaluate(
    ([mood, theme, html]) => {
      const root = document.documentElement;
      if (mood) root.setAttribute("data-mood", mood);
      else root.removeAttribute("data-mood");
      root.setAttribute("data-theme", theme as string);
      document.body.innerHTML = `<div style="display:flex;gap:8px;padding:16px;align-items:center"><div id="w" style="display:contents">${html}</div><span id="after">after</span></div>`;
    },
    [mood, theme, html] as const,
  );
}

/** The component's box, its watched words' places and the next element's place, as numbers. */
function measure(page: Page, watch: string[]) {
  return page.evaluate((watch) => {
    const el = document.querySelector("#w > *") as HTMLElement;
    const round = (n: number) => Math.round(n * 100) / 100;
    const box = (e: Element) => {
      const r = e.getBoundingClientRect();
      return { x: round(r.left), y: round(r.top), w: round(r.width), h: round(r.height) };
    };
    return {
      box: box(el),
      watched: watch.map((selector) => box(el.querySelector(selector) as Element)),
      after: box(document.querySelector("#after") as Element),
    };
  }, watch);
}

describe.skipIf(!browser)("a control's box never depends on its state (DS-9)", () => {
  for (const mood of MOODS) {
    for (const theme of THEMES) {
      const where = `${mood ?? "default"}, ${theme}`;
      describe(where, () => {
        let page: Page;
        beforeAll(async () => {
          page = await (browser as Browser).newPage({ viewport: { width: 390, height: 844 } });
          await page.setContent(
            `<!doctype html><html><head><style>${css}</style><style>*{transition:none!important;animation:none!important}</style></head><body></body></html>`,
          );
        });
        afterAll(async () => {
          await page?.close();
        });

        it.each(cases)("$name", async ({ el, states, watch = [], words, hover, reducedMotion }) => {
          await page.emulateMedia({ reducedMotion: reducedMotion ? "reduce" : "no-preference" });
          await stage(page, mood, theme, renderToStaticMarkup(el));
          const rest = await measure(page, watch);
          for (const [state, script] of states) {
            await page.evaluate(
              `(() => { const el = document.querySelector('#w > *'); ${script} })()`,
            );
            expect(await measure(page, watch), `${state}`).toEqual(rest);
            if (hover) {
              await page.hover("#w > *");
              expect(await measure(page, watch), `${state}, hovered`).toEqual(rest);
              await page.mouse.move(0, 0);
            }
            if (reducedMotion) {
              const shown = await page.evaluate(
                () =>
                  getComputedStyle(document.querySelector("#w > * .create-fab-label") as Element)
                    .opacity,
              );
              expect(shown, `${state}: words shown`).toBe("1");
            }
            if (words) {
              const cut = await page.evaluate((selector) => {
                const words = document.querySelector(
                  `#w > * ${selector}, #w > ${selector}`,
                ) as HTMLElement;
                return words.scrollWidth > words.clientWidth + 1;
              }, words.selector);
              expect(cut, `${state}: words ${cut ? "cut" : "whole"}`).toBe(
                words.cut?.includes(state) ?? false,
              );
            }
          }
        });

        it.each(HUGS)("$name hugs its words", async ({ el, words, swap }) => {
          await stage(page, mood, theme, renderToStaticMarkup(el));
          const before = await room(page, words);
          await page.evaluate(`(() => { const el = document.querySelector('#w > *'); ${swap} })()`);
          expect(await room(page, words)).toBeCloseTo(before, 1);
        });

        it.each(CHANGES_BOX)("lists what may change its box: $name", async ({ el, state }) => {
          await stage(page, mood, theme, renderToStaticMarkup(el));
          const rest = await measure(page, []);
          await page.evaluate(
            `(() => { const el = document.querySelector('#w > *'); ${state} })()`,
          );
          // If it no longer changes, the exception is stale: delete it.
          expect((await measure(page, [])).box).not.toEqual(rest.box);
        });
      });
    }
  }
});
