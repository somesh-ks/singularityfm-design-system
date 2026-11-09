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

/** One control of a page's controls strip: a choice (drawn as a Select) or a toggle (a Switch). */
export type Control =
  | {
      kind: "choice";
      id: string;
      label: string;
      options: readonly { value: string; label: string }[];
    }
  | { kind: "toggle"; id: string; label: string };

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
  badge: "Label",
  sheet: "Sheet title",
} as const;

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
    slug: "menu",
    name: "Menu",
    group: "actions",
    registry: "Menu",
    file: "Menu.astro",
    controls: [
      choice("items", "Actions", [
        ["3", "Three"],
        ["5", "Five"],
      ]),
      toggle("danger", "Danger row"),
      toggle("subtitle", "Subtitle"),
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
        file: "MenuItem.astro",
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
    file: "Field.astro",
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
      if (on(state, "filled")) attrs.push(`value="${SAMPLE.value}"`);
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
    file: "Switch.astro",
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
      if (state.state === "on") attrs.push("checked");
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
    file: "Slider.astro",
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
      const attrs = ['min="0"', 'max="100"', 'value="40"', `aria-label="${SAMPLE.label}"`];
      if (state.variant !== "default") attrs.unshift(state.variant ?? "");
      if (on(state, "disabled")) attrs.push("disabled");
      return jsx("Slider", attrs);
    },
    note: "The fill up to the thumb is a custom property the page keeps; a short script on this page does it.",
  },
  {
    slug: "select",
    name: "Select",
    group: "inputs",
    registry: "Select",
    file: "Select.astro",
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
    note: "On a phone it opens as a bottom sheet.",
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
    slug: "section-tabs",
    name: "SectionTabs",
    label: "Tabs",
    group: "navigation",
    file: "SectionTabs.astro",
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
    file: "ChapterAside.astro",
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
    file: "RowExit.astro",
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
    file: "Dialog.astro",
    controls: [
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
        file: "DialogTitle.astro",
        name: "DialogTitle",
        note: "The heading, an h2 the dialog names itself by.",
      },
      {
        file: "DialogActions.astro",
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
    file: "Sheet.astro",
    controls: [
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
        file: "SheetHeader.astro",
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
    file: "Banner.astro",
    controls: [
      choice("tone", "Tone", [
        ["warning", "Warning"],
        ["danger", "Danger"],
        ["success", "Success"],
      ]),
      choice("variant", "Variant", [
        ["block", "Block"],
        ["strip", "Strip"],
      ]),
      toggle("body", "Body line"),
      toggle("action", "Action"),
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
    slug: "badge",
    name: "Badge",
    group: "feedback",
    registry: "Badge",
    file: "Badge.astro",
    controls: [
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
    file: "Ripple.astro",
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
    file: "Avatar.astro",
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
    file: "Code.astro",
    controls: [
      choice("text", "Text", [
        ["line", "One line"],
        ["lines", "Several lines"],
      ]),
    ],
    imports: ["Code"],
    code: (state) =>
      state.text === "lines"
        ? `<Code label="${SAMPLE.label}" text={${JSON.stringify(SAMPLE.codeLines)}} />`
        : `<Code label="${SAMPLE.label}" text="${SAMPLE.code}" />`,
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
      spec.controls.map((control) => [
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
  for (const control of controls) {
    const values = control.kind === "toggle" ? ["off", "on"] : control.options.map((o) => o.value);
    states = states.flatMap((state) => values.map((value) => ({ ...state, [control.id]: value })));
  }
  return states;
}

/** The key a state is found by on the page: the control values in order. */
export const stateKey = (controls: readonly Control[], state: State): string =>
  controls.map((control) => state[control.id] ?? "").join("|");

/**
 * The import lines and the usage of a state, as a page prints them. A React component is imported by
 * its name (DS-3); its old .astro path is deprecated, so the guide never prints it.
 */
export function codeFor(spec: ComponentSpec, state: State): string {
  const imports = spec.imports.map((name) =>
    SPECS.find((other) => other.name === name)?.file?.endsWith(".tsx")
      ? `import ${name} from "@singularityfm/design-system/${name}";`
      : `import ${name} from "@singularityfm/design-system/${name}.astro";`,
  );
  return `${imports.join("\n")}\n\n${spec.code?.(state) ?? ""}`;
}

/** The name a person reads: the nav, the cards and the page title. */
export const labelOf = (spec: ComponentSpec): string => spec.label ?? spec.name;

export const specBySlug = (slug: string): ComponentSpec | undefined =>
  SPECS.find((spec) => spec.slug === slug);
