/**
 * The component pages of the guide: which components there are, how they are grouped, and the
 * controls each page offers. A component is grouped by what it does for a person (the way Material 3,
 * Carbon, Primer, Atlassian and Polaris group theirs), not by atomic design. A subpart (MenuItem,
 * DialogTitle) is shown on its parent's page, not in the nav. Guidance comes from the registry; the
 * three components it does not list (SectionTabs, ChapterAside, BrandMark) say their own here.
 */
import { AVATAR_SHAPE_IDS, AVATAR_SHAPES } from "@singularity/design-system/avatar";
import type { IconName } from "@singularity/design-system/icons";

export const GROUPS = [
  { id: "actions", label: "Actions", note: "Start something or go somewhere." },
  { id: "inputs", label: "Inputs", note: "Set a value." },
  { id: "navigation", label: "Navigation", note: "Move around a page or a list." },
  { id: "overlays", label: "Overlays", note: "Open over the page." },
  { id: "feedback", label: "Feedback", note: "Say what happened or how things stand." },
  { id: "display", label: "Display", note: "Show a thing." },
] as const;

export type GroupId = (typeof GROUPS)[number]["id"];

/**
 * One control under a page's preview: a choice (drawn as a Select), a toggle (a Switch) or words (a
 * Field). Words are not states: each names a sample the preview draws, and the page swaps it in the
 * stage and the code as it is typed (componentPage.ts), so every state carries the words over.
 */
export type Control =
  | {
      kind: "choice";
      id: string;
      label: string;
      options: readonly { value: string; label: string }[];
    }
  | { kind: "toggle"; id: string; label: string }
  | { kind: "text"; label: string; sample: string };

/** A control that picks a state, the ones the stage draws every combination of. */
export type StateControl = Exclude<Control, { kind: "text" }>;
const stateControls = (controls: readonly Control[]): StateControl[] =>
  controls.filter((control): control is StateControl => control.kind !== "text");

export type State = Readonly<Record<string, string>>;

export interface Subpart {
  /** The file in the library's src/. */
  file: string;
  name: string;
  note: string;
}

export interface ComponentSpec {
  slug: string;
  /** The code name: what the Code snippet and the props table call it. */
  name: string;
  /** What the nav, the cards and the page title call it, when that is not the code name. */
  label?: string;
  group: GroupId;
  /** The name the registry lists it under, when it is listed. */
  registry?: string;
  /** The file in the library's src/ whose Props the page lists. */
  file?: string;
  /** Said here when the registry does not list the component. */
  guidance?: {
    summary: string;
    useWhen: readonly string[];
    dontUseWhen: readonly { when: string; instead?: string }[];
  };
  /** In reading order: the words, then the look, then structure, then states, Disabled last. */
  controls: readonly Control[];
  /** The components the usage imports, in order. */
  imports: readonly string[];
  /** The usage for a state of the controls; absent where the page has nothing to show for it. */
  code?: (state: State) => string;
  /** Said under the preview: what the stage does differently from the app. */
  note?: string;
  /** Why a page has no preview, when it has none. */
  noPreview?: string;
  subparts?: readonly Subpart[];
}

const choice = (
  id: string,
  label: string,
  options: readonly (string | readonly [string, string])[],
): Control => ({
  kind: "choice",
  id,
  label,
  options: options.map((option) =>
    typeof option === "string"
      ? { value: option, label: option[0]?.toUpperCase() + option.slice(1) }
      : { value: option[0], label: option[1] },
  ),
});
const toggle = (id: string, label: string): Control => ({ kind: "toggle", id, label });
const text = (label: string, sample: string): Control => ({ kind: "text", label, sample });
const on = (state: State, id: string): boolean => state[id] === "on";

/** Icons the Icon page offers: a spread of the set, not all of it. */
export const ICON_CHOICES: readonly IconName[] = [
  "house",
  "search",
  "settings",
  "heartOutline",
  "share",
  "download",
  "trash",
  "play",
  "pin",
  "info",
  "alert",
  "wifiOff",
];

export const FLAG_CHOICES: readonly [string, string][] = [
  ["SE", "Sweden"],
  ["GB", "United Kingdom"],
  ["US", "United States"],
  ["DE", "Germany"],
  ["JP", "Japan"],
  ["BR", "Brazil"],
];

const FLAG_NAMES = Object.fromEntries(FLAG_CHOICES);

/**
 * The words every sample says: neutral placeholders, never the app's own copy. The previews, the
 * index pictures and the code snippets all read these, so they cannot disagree.
 */
export const SAMPLE = {
  label: "Label",
  danger: "Delete",
  value: "Sample value",
  code: "sample-value",
  codeLines: "sample-value\nsample-value-two\nsample-value-three",
  dialog: { title: "Dialog title", confirm: "Confirm", cancel: "Cancel", secondary: "Secondary" },
  menu: {
    trigger: "Menu",
    title: "Menu title",
    subtitle: "Supporting text",
    items: ["Action one", "Action two", "Action three", "Action four", "Action five"],
  },
  select: ["Option one", "Option two", "Option three"],
  tabs: ["Tab one", "Tab two", "Tab three", "Tab four", "Tab five"],
  chapters: ["Section one", "Section two", "Section three"],
  rows: ["Item one", "Item two", "Item three", "Item four", "Item five"],
  banner: { title: "Title", body: "Supporting text", action: "Action" },
  toast: { message: "Message", action: "Action" },
  badge: "Label",
  sheet: "Sheet title",
  glyph: "share",
  source: "example.com",
  sentence: ["Supporting text with a", "inside it."],
  duration: "1:24",
  segments: ["One", "Two", "Three", "Four"],
  search: "Search",
} as const;

/** The glyphs of a compact Segmented navigation's tabs, one a view. */
export const SEGMENT_GLYPHS: readonly IconName[] = ["chartBar", "table", "house", "search"];

/** A sample's words as a slug, for an anchor. */
export const sampleSlug = (text: string): string => text.toLowerCase().replace(/\W+/g, "-");

/** The tones' icons on the Banner page. */
export const BANNER_ICON = { warning: "alert", danger: "blocked", success: "checkCircle" } as const;

const jsx = (name: string, attrs: readonly string[], children?: string): string => {
  const open = [name, ...attrs].join(" ");
  return children === undefined ? `<${open} />` : `<${open}>${children}</${name}>`;
};

export const SPECS: readonly ComponentSpec[] = [
  {
    slug: "button",
    name: "Button",
    group: "actions",
    registry: "Button",
    file: "Button.tsx",
    controls: [
      text("Label", SAMPLE.label),
      choice("variant", "Variant", [
        ["filled", "Filled"],
        ["tonal", "Tonal"],
        ["text", "Text"],
        ["danger", "Text, danger"],
      ]),
      choice("size", "Size", [
        ["default", "Default"],
        ["small", "Small"],
      ]),
      choice("element", "Element", [
        ["button", "Button"],
        ["link", "Link"],
      ]),
      toggle("disabled", "Disabled"),
    ],
    imports: ["Button"],
    code: (state) => {
      const attrs = [`variant="${state.variant === "danger" ? "text" : state.variant}"`];
      if (state.variant === "danger") attrs.push('tone="danger"');
      if (state.size === "small") attrs.push('size="small"');
      if (state.element === "link") attrs.push('href="/path"');
      else if (on(state, "disabled")) attrs.push("disabled");
      return jsx("Button", attrs, state.variant === "danger" ? SAMPLE.danger : SAMPLE.label);
    },
    note: "A link is a Button with an href; a link cannot be disabled, so the switch applies to the button.",
  },
  {
    slug: "icon-button",
    name: "IconButton",
    label: "Icon button",
    group: "actions",
    registry: "Icon button",
    file: "IconButton.tsx",
    controls: [
      choice("variant", "Variant", [
        ["standard", "Standard"],
        ["tonal", "Tonal"],
      ]),
      choice("element", "Element", [
        ["button", "Button"],
        ["link", "Link"],
      ]),
      toggle("disabled", "Disabled"),
    ],
    imports: ["IconButton", "Icon"],
    code: (state) => {
      const attrs = [`label="${SAMPLE.label}"`];
      if (state.variant === "tonal") attrs.push('variant="tonal"');
      if (state.element === "link") attrs.push('href="/path"');
      else if (on(state, "disabled")) attrs.push("disabled");
      return jsx("IconButton", attrs, `<Icon name="${SAMPLE.glyph}" />`);
    },
    note: "label is the button's name for a screen reader; the glyph has no words. A link cannot be disabled, so the switch applies to the button.",
  },
  {
    slug: "fab",
    name: "Fab",
    label: "FAB",
    group: "actions",
    registry: "FAB",
    file: "Fab.tsx",
    controls: [text("Label", SAMPLE.label), toggle("folded", "Folded")],
    imports: ["Fab"],
    code: (state) =>
      jsx(
        "Fab",
        [
          'icon="plus"',
          `label="${SAMPLE.label}"`,
          'href="/path"',
          ...(on(state, "folded") ? ["data-folded"] : []),
        ],
        SAMPLE.label,
      ),
    note: "In the app it floats at the bottom end below 64rem and is not shown from 64rem; here it sits in the stage. The app's script sets data-folded while a page scrolls down.",
  },
  {
    slug: "play-chip",
    name: "PlayChip",
    label: "Play chip",
    group: "actions",
    registry: "Play chip",
    file: "PlayChip.tsx",
    controls: [
      text("Label", SAMPLE.duration),
      choice("state", "State", [
        ["idle", "Idle"],
        ["current", "Current"],
        ["played", "Played"],
        ["preparing", "Preparing"],
        ["error", "Error"],
        ["unavailable", "Unavailable"],
      ]),
      toggle("playing", "Playing"),
    ],
    imports: ["PlayChip"],
    code: (state) => {
      const attrs = [`label="${SAMPLE.duration}"`];
      if (state.state !== "idle") attrs.push(`state="${state.state}"`);
      if (on(state, "playing")) attrs.push('data-playing="true"');
      attrs.push(`aria-label="${SAMPLE.label}"`);
      return jsx("PlayChip", attrs);
    },
    note: "A native button, so it needs no client directive. The player writes data-state, data-playing and the words as it plays; Playing shows its bars while the state is Current. On the stage it sits as on a card (card-group), one step up from the container tone.",
    subparts: [
      {
        file: "PlayingBars.tsx",
        name: "PlayingBars",
        note: "The three moving bars that show something playing, for any other play control that shows it; className places and sizes them.",
      },
    ],
  },
  {
    slug: "menu",
    name: "Menu",
    group: "actions",
    registry: "Menu",
    file: "Menu.tsx",
    controls: [
      text("Title", SAMPLE.menu.title),
      toggle("subtitle", "Subtitle"),
      choice("items", "Actions", [
        ["3", "Three"],
        ["5", "Five"],
      ]),
      toggle("danger", "Danger row"),
    ],
    imports: ["Button", "Menu", "MenuItem", "Icon"],
    code: (state) => {
      const icons = ["share", "queueAdd", "download", "check", "openInNew"];
      const rows = SAMPLE.menu.items
        .map((label, n) => [icons[n], label])
        .slice(0, Number(state.items));
      const lines = rows.map(
        ([icon, label]) => `  <MenuItem><Icon name="${icon}" /> ${label}</MenuItem>`,
      );
      if (on(state, "danger"))
        lines.push(`  <MenuItem tone="danger"><Icon name="trash" /> ${SAMPLE.danger}</MenuItem>`);
      const sub = on(state, "subtitle") ? ` subtitle="${SAMPLE.menu.subtitle}"` : "";
      return [
        `<Button variant="tonal" popoverTarget="sample-menu">${SAMPLE.menu.trigger}</Button>`,
        `<Menu id="sample-menu" title="${SAMPLE.menu.title}"${sub}>`,
        ...lines,
        "</Menu>",
      ].join("\n");
    },
    note: "The Button opens the real popover: a small menu under the button from 40rem, a bottom sheet on a phone. The app's script adds the arrow keys.",
    subparts: [
      {
        file: "MenuItem.tsx",
        name: "MenuItem",
        note: 'One row: its glyph first, then the words. tone="danger" for the one row that destroys.',
      },
    ],
  },
  {
    slug: "field",
    name: "Field",
    group: "inputs",
    registry: "Field",
    file: "Field.tsx",
    controls: [
      choice("lines", "Lines", [
        ["single", "One line"],
        ["multi", "Several"],
      ]),
      toggle("filled", "With a value"),
      toggle("disabled", "Disabled"),
    ],
    imports: ["Field"],
    code: (state) => {
      const attrs: string[] = [];
      if (state.lines === "multi") attrs.push("multiline");
      if (on(state, "filled")) attrs.push(`defaultValue="${SAMPLE.value}"`);
      else attrs.push(`placeholder="${SAMPLE.label}"`);
      attrs.push(`aria-label="${SAMPLE.label}"`);
      if (on(state, "disabled")) attrs.push("disabled");
      return jsx("Field", attrs);
    },
  },
  {
    slug: "switch",
    name: "Switch",
    group: "inputs",
    registry: "Switch",
    file: "Switch.tsx",
    controls: [
      choice("state", "State", [
        ["off", "Off"],
        ["on", "On"],
        ["mixed", "Mixed"],
      ]),
      toggle("disabled", "Disabled"),
    ],
    imports: ["Switch"],
    code: (state) => {
      const attrs: string[] = [];
      if (state.state === "on") attrs.push("defaultChecked");
      attrs.push(`aria-label="${SAMPLE.label}"`);
      if (on(state, "disabled")) attrs.push("disabled");
      const tag = jsx("Switch", attrs);
      return state.state === "mixed"
        ? `${tag}\n<!-- Mixed is the input's indeterminate property: a script sets it while only some of a group are on. -->`
        : tag;
    },
  },
  {
    slug: "slider",
    name: "Slider",
    group: "inputs",
    registry: "Slider",
    file: "Slider.tsx",
    controls: [
      choice("variant", "Variant", [
        ["default", "Default"],
        ["hue", "Hue"],
        ["wavy", "Wavy"],
      ]),
      toggle("disabled", "Disabled"),
    ],
    imports: ["Slider"],
    code: (state) => {
      const attrs = ['min="0"', 'max="100"', 'defaultValue="40"', `aria-label="${SAMPLE.label}"`];
      if (state.variant !== "default") attrs.unshift(state.variant ?? "");
      if (on(state, "disabled")) attrs.push("disabled");
      return jsx("Slider", attrs);
    },
    note: "The fill up to the thumb is a custom property the page keeps; a short script on this page does it.",
  },
  {
    slug: "chip",
    name: "Chip",
    group: "inputs",
    registry: "Chip",
    file: "Chip.tsx",
    controls: [
      toggle("scroll", "One row that scrolls"),
      toggle("ticked", "Ticked"),
      toggle("disabled", "Disabled"),
    ],
    imports: ["ChipGroup", "Chip"],
    code: (state) =>
      [
        `<ChipGroup aria-label="${SAMPLE.label}"${on(state, "scroll") ? " scroll" : ""}${on(state, "disabled") ? " disabled" : ""}>`,
        ...SAMPLE.select.map(
          (option, n) =>
            `  ${jsx("Chip", [`name="sample"`, `value="${n + 1}"`, ...(n === 0 && on(state, "ticked") ? ["defaultChecked"] : [])], option)}`,
        ),
        "</ChipGroup>",
      ].join("\n"),
    note: "Each one is a native checkbox, so it needs no client directive. The stage is the container tone, so the chips sit on it as on a card (card-group), one step up.",
    subparts: [
      {
        file: "ChipGroup.tsx",
        name: "ChipGroup",
        note: "The fieldset that holds a row of chips, 8px apart; scroll keeps them on one row that scrolls sideways.",
      },
    ],
  },
  {
    slug: "segmented-choice",
    name: "SegmentedChoice",
    label: "Segmented choice",
    group: "inputs",
    registry: "Segmented choice",
    file: "SegmentedChoice.tsx",
    controls: [
      choice("count", "Segments", [
        ["2", "Two"],
        ["3", "Three"],
        ["4", "Four"],
      ]),
      toggle("disabled", "Disabled"),
    ],
    imports: ["SegmentedChoice"],
    code: (state) =>
      `<SegmentedChoice\n  name="sample"\n  aria-label="${SAMPLE.label}"\n  defaultValue="1"${on(state, "disabled") ? "\n  disabled" : ""}\n  options={[\n${SAMPLE.segments
        .slice(0, Number(state.count))
        .map((label, n) => `    { value: "${n + 1}", label: "${label}" },`)
        .join("\n")}\n  ]}\n/>`,
    note: "Native radios, so it needs no client directive.",
  },
  {
    slug: "search-field",
    name: "SearchField",
    label: "Search field",
    group: "inputs",
    registry: "Search field",
    file: "SearchField.tsx",
    controls: [toggle("filled", "With words")],
    imports: ["SearchField"],
    code: (state) =>
      jsx("SearchField", [
        `label="${SAMPLE.search}"`,
        'name="q"',
        `placeholder="${SAMPLE.search}"`,
        ...(on(state, "filled") ? [`defaultValue="${SAMPLE.value}"`] : []),
      ]),
    note: "A native search input, so it needs no client directive. Its pill is the container tone, the stage's own, as the tonal Select's is: on a page it sits on the page's surface.",
  },
  {
    slug: "select",
    name: "Select",
    group: "inputs",
    registry: "Select",
    file: "Select.tsx",
    controls: [
      choice("variant", "Variant", [
        ["outlined", "Outlined"],
        ["tonal", "Tonal"],
      ]),
      toggle("disabled", "Disabled"),
    ],
    imports: ["Select"],
    code: (state) => {
      const attrs = [`variant="${state.variant}"`, `label="${SAMPLE.label}"`];
      if (on(state, "disabled")) attrs.push("disabled");
      return [
        `<Select ${attrs.join(" ")}>`,
        ...SAMPLE.select.map((option, n) => `  <option value="${n + 1}">${option}</option>`),
        "</Select>",
      ].join("\n");
    },
    note: "On a phone it opens as a bottom sheet, which a page installs once with installSelectSheet() (selectSheet.ts).",
  },
  {
    slug: "wheel",
    name: "Wheel",
    group: "inputs",
    registry: "Wheel",
    controls: [],
    imports: [],
    noPreview:
      "The Wheel is the list inside a Select's bottom sheet (selectSheet.ts draws the sheet around it); it is not a component of its own. On a phone, a Select whose options carry data-wheel opens it.",
  },
  {
    slug: "link",
    name: "Link",
    group: "navigation",
    registry: "Link",
    file: "Link.tsx",
    controls: [
      text("Words", SAMPLE.label),
      text("Source", SAMPLE.source),
      choice("variant", "Variant", [
        ["text", "Text"],
        ["source", "Source"],
      ]),
    ],
    imports: ["Link"],
    code: (state) =>
      state.variant === "source"
        ? jsx(
            "Link",
            [
              'variant="source"',
              'href="https://example.com"',
              'target="_blank"',
              'rel="noopener noreferrer"',
            ],
            SAMPLE.source,
          )
        : `<p>${SAMPLE.sentence[0]} ${jsx("Link", ['href="/path"'], SAMPLE.label)} ${SAMPLE.sentence[1]}</p>`,
  },
  {
    slug: "segmented-nav",
    name: "SegmentedNav",
    label: "Segmented navigation",
    group: "navigation",
    registry: "Segmented navigation",
    file: "SegmentedNav.tsx",
    controls: [
      choice("size", "Size", [
        ["default", "Default"],
        ["compact", "Compact"],
      ]),
      choice("count", "Views", [
        ["2", "Two"],
        ["3", "Three"],
        ["4", "Four"],
      ]),
    ],
    imports: ["SegmentedNav"],
    code: (state) => {
      const compact = state.size === "compact";
      const tabs = SAMPLE.segments
        .slice(0, Number(state.count))
        .map((label, n) =>
          compact
            ? `    { value: "${n + 1}", label: "${label}", icon: "${SEGMENT_GLYPHS[n]}" },`
            : `    { value: "${n + 1}", label: "${label}" },`,
        );
      return `<SegmentedNav\n  aria-label="${SAMPLE.label}"${compact ? "\n  compact" : ""}\n  tabs={[\n${tabs.join("\n")}\n  ]}\n/>`;
    },
    note: "A native tablist with no client directive: the page calls mountSegmentedNav() from segmentedNav once for each list, and draws the panels; each tab's controls names its panel. On the stage's container tone its track takes the overlay tone through --segmented-nav-bg, as on a card.",
  },
  {
    slug: "section-tabs",
    name: "SectionTabs",
    label: "Tabs",
    group: "navigation",
    file: "SectionTabs.tsx",
    guidance: {
      summary: "A bar of links to the sections of one page, with a mark on the one in view.",
      useWhen: [
        "A briefing or an episode has two sections or more and a person jumps between them below 80rem.",
      ],
      dontUseWhen: [
        { when: "There is one section: it would only repeat the heading under it." },
        { when: "The page is wide enough for the contents list.", instead: "Chapter list" },
      ],
    },
    controls: [
      choice("count", "Sections", [
        ["2", "Two"],
        ["3", "Three"],
        ["5", "Five"],
      ]),
    ],
    imports: ["SectionTabs"],
    code: (state) =>
      `<SectionTabs\n  sections={[\n${SAMPLE.tabs
        .slice(0, Number(state.count))
        .map((title) => `    { slug: "${sampleSlug(title)}", title: "${title}" },`)
        .join("\n")}\n  ]}\n/>`,
    note: "The links are real anchors; here a press moves the mark and goes nowhere. The app's briefingPage.ts moves it as the page scrolls.",
  },
  {
    slug: "chapter-aside",
    name: "ChapterAside",
    label: "Chapter list",
    group: "navigation",
    file: "ChapterAside.tsx",
    guidance: {
      summary:
        "The contents list beside the reading column: a link to each section, the one in view marked.",
      useWhen: [
        "A briefing has sections and the window is 80rem or wider, where it replaces SectionTabs.",
      ],
      dontUseWhen: [
        { when: "The window is narrower than 80rem.", instead: "Tabs" },
        { when: "The page has one section." },
      ],
    },
    controls: [],
    imports: ["ChapterAside"],
    code: () =>
      `<ChapterAside\n  sections={[\n${SAMPLE.chapters.map((title) => `    { slug: "${sampleSlug(title)}", title: "${title}" },`).join("\n")}\n  ]}\n/>`,
    noPreview:
      "It is hidden below 80rem and, from there, sticks to the middle of the window beside the reading column, so it cannot sit inside a stage.",
  },
  {
    slug: "row-exit",
    name: "RowExit",
    label: "Row exit",
    group: "navigation",
    registry: "Row exit",
    file: "RowExit.tsx",
    controls: [
      choice("rows", "Rows", [
        ["3", "Three"],
        ["5", "Five"],
      ]),
    ],
    imports: ["RowExit"],
    code: (state) =>
      `<ul>\n${Array.from({ length: Number(state.rows) }, (_, i) => `  <RowExit>${SAMPLE.rows[i]}</RowExit>`).join("\n")}\n</ul>\n<!-- A script sets data-removing on a row to take it out. -->`,
    note: "Remove a row to see it fade and the gap close; Reset brings them back.",
  },
  {
    slug: "dialog",
    name: "Dialog",
    group: "overlays",
    registry: "Dialog",
    file: "Dialog.tsx",
    controls: [
      text("Title", SAMPLE.dialog.title),
      choice("answers", "Answers", [
        ["two", "Two, in a row"],
        ["three", "Three, stacked"],
      ]),
      toggle("danger", "Danger confirm"),
    ],
    imports: ["Dialog", "DialogTitle", "DialogActions", "Button"],
    code: (state) => {
      const stacked = state.answers === "three";
      const confirm = on(state, "danger")
        ? `<Button variant="text" tone="danger" type="submit">${SAMPLE.danger}</Button>`
        : `<Button variant="filled" type="submit">${SAMPLE.dialog.confirm}</Button>`;
      return [
        '<Dialog id="sample-dialog" form={{ method: "dialog" }} aria-labelledby="sample-dialog-title">',
        `  <DialogTitle id="sample-dialog-title">${SAMPLE.dialog.title}</DialogTitle>`,
        `  <DialogActions${stacked ? " stacked" : ""}>`,
        ...(stacked
          ? [
              `    ${confirm}`,
              `    <Button variant="tonal" type="submit">${SAMPLE.dialog.secondary}</Button>`,
            ]
          : []),
        `    <Button variant="text" type="submit">${SAMPLE.dialog.cancel}</Button>`,
        ...(stacked ? [] : [`    ${confirm}`]),
        "  </DialogActions>",
        "</Dialog>",
      ].join("\n");
    },
    note: "Open it with the Button: the real dialog, modal, over the whole window.",
    subparts: [
      {
        file: "DialogTitle.tsx",
        name: "DialogTitle",
        note: "The heading, an h2 the dialog names itself by.",
      },
      {
        file: "DialogActions.tsx",
        name: "DialogActions",
        note: "The row of answers. stacked puts three in a column, the committing one first.",
      },
    ],
  },
  {
    slug: "sheet",
    name: "Sheet",
    group: "overlays",
    registry: "Sheet",
    file: "Sheet.tsx",
    controls: [
      text("Title", SAMPLE.sheet),
      choice("kind", "Kind", [
        ["panel", "Panel"],
        ["create", "Create"],
      ]),
    ],
    imports: ["Sheet", "Field", "Button"],
    code: (state) =>
      [
        `<Sheet id="sample-sheet" title="${SAMPLE.sheet}" titleId="sample-sheet-title" close="data-panel-close"${state.kind === "create" ? ' kind="create"' : ""}>`,
        `  <Field placeholder="${SAMPLE.label}" aria-label="${SAMPLE.label}" />`,
        `  <Button variant="filled">${SAMPLE.dialog.confirm}</Button>`,
        "</Sheet>",
      ].join("\n"),
    note: "Open it with the Button: the real dialog, a panel at the side from 40rem and the whole screen on a phone.",
    subparts: [
      {
        file: "SheetHeader.tsx",
        name: "SheetHeader",
        note: "Drawn by Sheet and by Menu: the title at the start and Close at the end.",
      },
    ],
  },
  {
    slug: "drawer",
    name: "Drawer",
    group: "overlays",
    registry: "Drawer",
    controls: [],
    imports: [],
    noPreview:
      "The Drawer is drawn by the app's React islands (sheets/SheetFrame.tsx) from the classes the registry lists; the library ships no Drawer component yet (see the DS-3 plan).",
  },
  {
    slug: "banner",
    name: "Banner",
    group: "feedback",
    registry: "Banner",
    file: "Banner.tsx",
    controls: [
      text("Title", SAMPLE.banner.title),
      choice("tone", "Tone", [
        ["warning", "Warning"],
        ["danger", "Danger"],
        ["success", "Success"],
      ]),
      toggle("body", "Body line"),
      text("Body", SAMPLE.banner.body),
      toggle("action", "Action"),
      text("Action words", SAMPLE.banner.action),
      choice("variant", "Variant", [
        ["block", "Block"],
        ["strip", "Strip"],
      ]),
    ],
    imports: ["Banner"],
    code: (state) => {
      const tone = (state.tone ?? "warning") as keyof typeof BANNER_ICON;
      const attrs = [`tone="${tone}"`];
      if (state.variant === "strip") attrs.push('variant="strip"');
      attrs.push(`icon="${BANNER_ICON[tone]}"`, `title="${SAMPLE.banner.title}"`);
      if (on(state, "body")) attrs.push(`body="${SAMPLE.banner.body}"`);
      if (on(state, "action"))
        attrs.push(`action={{ label: "${SAMPLE.banner.action}", href: "/path" }}`);
      return jsx("Banner", attrs);
    },
    note: "A strip squeezes the app down while it shows; here it sits in the stage.",
  },
  {
    slug: "toast",
    name: "Toast",
    group: "feedback",
    registry: "Toast",
    file: "Toast.tsx",
    controls: [
      text("Message", SAMPLE.toast.message),
      choice("kind", "Kind", [
        ["plain", "Plain"],
        ["success", "Success"],
        ["error", "Error"],
      ]),
      toggle("action", "Action"),
    ],
    imports: ["Toast"],
    code: (state) => {
      const fields = [`message: "${SAMPLE.toast.message}"`];
      if (state.kind === "success" || state.kind === "error") fields.push(`kind: "${state.kind}"`);
      if (on(state, "action")) fields.push(`actionLabel: "${SAMPLE.toast.action}"`, "onAction");
      return [
        'import { showToast } from "@singularityfm/design-system/toastStore";',
        "",
        "// Once per page:",
        "<Toast client:idle />",
        "",
        "// Wherever a message is due:",
        `showToast({ ${fields.join(", ")} });`,
      ].join("\n");
    },
    note: "The page mounts <Toast client:idle /> once; here it sits above the bottom of the window.",
  },
  {
    slug: "badge",
    name: "Badge",
    group: "feedback",
    registry: "Badge",
    file: "Badge.tsx",
    controls: [
      text("Label", SAMPLE.badge),
      choice("content", "Content", [
        ["word", "A word"],
        ["number", "A number"],
      ]),
    ],
    imports: ["Badge"],
    code: (state) => jsx("Badge", [], state.content === "number" ? "12" : SAMPLE.badge),
  },
  {
    slug: "ripple",
    name: "Ripple",
    group: "feedback",
    registry: "Ripple",
    file: "Ripple.tsx",
    controls: [],
    imports: ["Button", "Ripple"],
    code: () => `<Button variant="tonal" data-ripple>\n  ${SAMPLE.label}\n  <Ripple />\n</Button>`,
    note: "Press and hold: the wave grows from the point of the press and fades on the lift. installRipple() from the library's ripple script listens for it; the bottom bar of the app is where it lives.",
  },
  {
    slug: "glow",
    name: "Glow",
    group: "feedback",
    registry: "Glow",
    controls: [],
    imports: [],
    noPreview:
      "The Glow is a function, not a component: glow.ts plays a halo on a Favorite control as it turns on, and the app calls it. Its classes are listed above.",
  },
  {
    slug: "icon",
    name: "Icon",
    group: "display",
    registry: "Icon",
    file: "Icon.tsx",
    controls: [
      choice(
        "name",
        "Glyph",
        ICON_CHOICES.map((name) => [name, name] as const),
      ),
      choice("size", "Size", [
        ["md", "Medium"],
        ["lg", "Large"],
      ]),
    ],
    imports: ["Icon"],
    code: (state) =>
      jsx("Icon", [`name="${state.name}"`, ...(state.size === "lg" ? ['size="lg"'] : [])]),
  },
  {
    slug: "avatar",
    name: "Avatar",
    group: "display",
    registry: "Avatar",
    file: "Avatar.tsx",
    controls: [
      choice(
        "shape",
        "Shape",
        AVATAR_SHAPE_IDS.map((id) => [id, AVATAR_SHAPES[id]?.name ?? id] as const),
      ),
      choice("size", "Size", [
        ["md", "Medium"],
        ["lg", "Large"],
        ["xl", "Extra large"],
      ]),
    ],
    imports: ["Avatar"],
    code: (state) => jsx("Avatar", [`shape="${state.shape}"`, `size="${state.size}"`]),
  },
  {
    slug: "flag",
    name: "Flag",
    group: "display",
    registry: "Flag",
    file: "Flag.tsx",
    controls: [
      choice("region", "Region", FLAG_CHOICES),
      choice("mode", "Draws", [
        ["region", "The flag"],
        ["text", "A flag in text"],
      ]),
    ],
    imports: ["Flag"],
    code: (state) =>
      state.mode === "text"
        ? jsx("Flag", [
            `text={"${regionEscapes(state.region ?? "SE")} ${FLAG_NAMES[state.region ?? "SE"]}"}`,
          ])
        : jsx("Flag", [`region="${state.region}"`]),
  },
  {
    slug: "brand-mark",
    name: "BrandMark",
    label: "Brand mark",
    group: "display",
    file: "BrandMark.tsx",
    guidance: {
      summary: "The ringed dot: the app's mark, in the wordmark and beside the app's name.",
      useWhen: ["The app's name is written out, as in the navigation's wordmark."],
      dontUseWhen: [{ when: "A glyph says what a control does.", instead: "Icon" }],
    },
    controls: [],
    imports: ["BrandMark"],
    code: () => "<BrandMark />",
  },
  {
    slug: "code",
    name: "Code",
    group: "display",
    registry: "Code",
    file: "Code.tsx",
    controls: [
      choice("text", "Text", [
        ["line", "One line"],
        ["lines", "Several lines"],
      ]),
    ],
    imports: ["Code"],
    code: (state) =>
      state.text === "lines"
        ? `<Code client:load label="${SAMPLE.label}" text={${JSON.stringify(SAMPLE.codeLines)}} />`
        : `<Code client:load label="${SAMPLE.label}" text="${SAMPLE.code}" />`,
    note: "Press the button on the snippet: it copies the text and says so.",
  },
];

/** A region's flag emoji as the escapes that write it, so the snippet itself draws no emoji (D367). */
export function regionEscapes(region: string): string {
  return [...region.toUpperCase()]
    .map((c) => `\\u{${(0x1f1e6 + c.charCodeAt(0) - 65).toString(16).toUpperCase()}}`)
    .join("");
}

/** A region code as the flag emoji it is written with in a topic. */
export function regionEmoji(region: string): string {
  return [...region.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

/** The state a page opens in: each choice at its first option, each toggle off. */
export function initialState(spec: ComponentSpec, extra: State = {}): State {
  return {
    ...Object.fromEntries(
      stateControls(spec.controls).map((control) => [
        control.id,
        control.kind === "toggle" ? "off" : (control.options[0]?.value ?? ""),
      ]),
    ),
    ...extra,
  };
}

/** Every state of the controls, the first control varying slowest. */
export function allStates(controls: readonly Control[]): State[] {
  let states: State[] = [{}];
  for (const control of stateControls(controls)) {
    const values = control.kind === "toggle" ? ["off", "on"] : control.options.map((o) => o.value);
    states = states.flatMap((state) => values.map((value) => ({ ...state, [control.id]: value })));
  }
  return states;
}

/** The key a state is found by on the page: the control values in order. */
export const stateKey = (controls: readonly Control[], state: State): string =>
  stateControls(controls)
    .map((control) => state[control.id] ?? "")
    .join("|");

/**
 * The import lines and the usage of a state, as a page prints them. A React component is imported by
 * its name (DS-3); its old .astro path is deprecated, so the guide never prints it.
 */
export function codeFor(spec: ComponentSpec, state: State): string {
  // A subpart (DialogTitle) is found by its parent's list.
  const file = (name: string): string | undefined =>
    SPECS.flatMap((other) => [other, ...(other.subparts ?? [])]).find((part) => part.name === name)
      ?.file;
  const imports = spec.imports.map((name) =>
    file(name)?.endsWith(".tsx")
      ? `import ${name} from "@singularityfm/design-system/${name}";`
      : `import ${name} from "@singularityfm/design-system/${name}.astro";`,
  );
  return `${imports.join("\n")}\n\n${spec.code?.(state) ?? ""}`;
}

/** The name a person reads: the nav, the cards and the page title. */
export const labelOf = (spec: ComponentSpec): string => spec.label ?? spec.name;

export const specBySlug = (slug: string): ComponentSpec | undefined =>
  SPECS.find((spec) => spec.slug === slug);
