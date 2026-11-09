/**
 * The parts of the system that are real components (packages/design-system/src). Their facts come
 * from the registry, so the lookup file and the style guide cannot disagree; this file adds only the
 * words a lookup matches against and the one-line rules the registry does not hold. A family that
 * becomes a component adds its entry here and deletes its hand-written ones from parts.ts.
 */
import { BADGE } from "../../src/badge.js";
import { BANNER } from "../../src/banner.js";
import { BUTTON } from "../../src/button.js";
import { CHIP } from "../../src/chip.js";
import { DIALOG } from "../../src/dialog.js";
import { DRAWER } from "../../src/drawer.js";
import { FAB } from "../../src/fab.js";
import { FIELD } from "../../src/field.js";
import type { ComponentRef, Guidance } from "../../src/guidance.js";
import { ICON } from "../../src/icon.js";
import { ICON_BUTTON } from "../../src/iconButton.js";
import { LINK } from "../../src/link.js";
import { MENU } from "../../src/menu.js";
import { PLAY_CHIP } from "../../src/playChip.js";
import { RIPPLE } from "../../src/ripple.js";
import { SEARCH_FIELD } from "../../src/searchField.js";
import { SEGMENTED_CHOICE } from "../../src/segmentedChoice.js";
import { SEGMENTED_NAV } from "../../src/segmentedNav.js";
import { SELECT } from "../../src/select.js";
import { SHEET } from "../../src/sheet.js";
import { SLIDER } from "../../src/slider.js";
import { SWITCH } from "../../src/switch.js";
import { TOAST } from "../../src/toast.js";
import type { PartSource } from "./types.js";

/** The part a `dontUseWhen` points at. A family not yet a component keeps its hand-written id. */
const PART_OF: Record<string, string> = {
  Icon: "icon",
  "Icon button": "icon-btn",
  Chip: "filter-chip",
  "Play chip": "play-chip",
  "Segmented choice": "segmented-choice",
  "Segmented navigation": "segmented-nav",
  "Search field": "search-field",
  FAB: "fab",
  Link: "text-link",
  Switch: "switch",
  Slider: "slider",
  Field: "field",
  Select: "select",
  Menu: "menu",
  Badge: "badge",
  Banner: "banner",
  Toast: "toast",
  Dialog: "dialog",
  Sheet: "sheet",
  Drawer: "drawer",
  "Icon button.standard": "icon-btn",
  "Icon button.tonal": "icon-btn-tonal",
  "Link.text": "text-link",
  "Link.source": "source-link",
};

const partOf = (ref: ComponentRef | undefined, fallback: string): string => {
  if (!ref) return fallback;
  const [component, part] = ref.split(".");
  if (component === "Button" && part) return `button-${part}`;
  return PART_OF[ref] ?? PART_OF[component ?? ""] ?? fallback;
};

/** A variant's exclusions, then its family's, as the lookup's "not when" lines. */
const exclusions = (
  lines: Guidance["dontUseWhen"],
  fallback: string,
): { when: string; use: string }[] =>
  lines
    .filter((item) => item.instead)
    .map((item) => ({ when: item.when.replace(/\.$/, ""), use: partOf(item.instead, fallback) }));

const words: Record<string, { keywords: string[]; markup: string; rules?: string[] }> = {
  filled: {
    keywords: ["save", "submit", "cta", "main button", "filled", "primary"],
    markup: '<Button variant="filled" type="submit">Save</Button>',
    rules: ["At most one per surface.", "Never a bold label."],
  },
  tonal: {
    keywords: ["secondary", "companion", "second action", "beside the primary", "tonal"],
    markup: '<Button variant="tonal">Share</Button>',
    rules: ["Matches the filled button's height.", "No outline."],
  },
  text: {
    keywords: ["cancel", "text action", "tertiary", "dismiss", "quiet button"],
    markup: '<Button variant="text">Cancel</Button>',
    rules: [
      "In a dialog, Cancel and the filled button sit in a DialogActions row (EpisodeActions.astro); a form sheet keeps its one filled button in `.sheet-actions`.",
    ],
  },
  danger: {
    keywords: ["delete", "destructive", "remove", "red"],
    markup: '<Button variant="text" tone="danger">Delete</Button>',
  },
  small: {
    keywords: ["small button", "compact button", "smaller", "dense row", "button size"],
    markup: '<Button variant="text" size="small">Listen now</Button>',
  },
};

/** The lookup file ends each situation itself, so the registry's full stops come off. */
const sentences = (lines: readonly string[]): string[] =>
  lines.map((line) => line.replace(/\.$/, ""));

const FILES = ["packages/design-system/src/Button.tsx", "packages/design-system/src/button.ts"];

/** A single-class control (Switch, Slider): the registry's guidance plus the words a lookup matches. */
const control = (
  id: string,
  name: string,
  guidance: Guidance,
  extra: {
    keywords: string[];
    markup: string;
    rules?: string[];
    classes?: string[];
    files?: string[];
    /** Exclusions that point at a part not yet a component (a hand-written one in parts.ts). */
    not?: { when: string; use: string }[];
    kind?: PartSource["kind"];
  },
): PartSource => ({
  id,
  name,
  kind: extra.kind ?? "selection",
  summary: guidance.summary,
  classes: [`${id}-input`],
  files: extra.files ?? [
    `packages/design-system/src/${name}.astro`,
    `packages/design-system/src/${id}.ts`,
  ],
  when: sentences(guidance.useWhen),
  // An exclusion with no `instead` has no part to point at: the lookup leaves it out rather than guess.
  not: [
    ...guidance.dontUseWhen
      .filter((item) => item.instead)
      .map((item) => ({
        when: item.when.replace(/\.$/, ""),
        use: partOf(item.instead, "button-text"),
      })),
    ...(extra.not ?? []),
  ],
  keywords: extra.keywords,
  markup: extra.markup,
  rules: extra.rules,
  ...(extra.classes ? { classes: extra.classes } : {}),
});

export const componentParts = (): PartSource[] => [
  ...Object.entries(BUTTON.variants).map(([variant, guidance]): PartSource => {
    const id = `button-${variant}`;
    const extra = words[variant];
    return {
      id,
      name: `${guidance.label} button`,
      kind: "action",
      summary: guidance.summary,
      classes: [id],
      files: FILES,
      when: sentences(guidance.useWhen),
      not: [
        ...guidance.dontUseWhen.map((item) => ({
          when: item.when.replace(/\.$/, ""),
          use: partOf(item.instead, id),
        })),
        ...(variant === "filled"
          ? [{ when: "an action that only creates, in the side column", use: "btn-action-tonal" }]
          : []),
      ],
      keywords: extra?.keywords,
      markup: extra?.markup,
      rules: extra?.rules,
    };
  }),
  ...Object.entries(BUTTON.tones).map(([tone, guidance]): PartSource => {
    const id = `button-${tone}`;
    const extra = words[tone];
    return {
      id,
      name: `${guidance.label} button`,
      kind: "action",
      summary: guidance.summary,
      classes: [id],
      files: FILES,
      when: sentences(guidance.useWhen),
      not: guidance.dontUseWhen.map((item) => ({
        when: item.when.replace(/\.$/, ""),
        use: partOf(item.instead, `button-${guidance.variant}`),
      })),
      keywords: extra?.keywords,
      markup: extra?.markup,
    };
  }),
  ...Object.entries(BUTTON.sizes).map(([size, guidance]): PartSource => {
    const id = `button-${size}`;
    const extra = words[size];
    return {
      id,
      name: `${guidance.label} button`,
      kind: "action",
      summary: guidance.summary,
      classes: [id],
      files: FILES,
      when: sentences(guidance.useWhen),
      not: guidance.dontUseWhen.map((item) => ({
        when: item.when.replace(/\.$/, ""),
        use: partOf(item.instead, id),
      })),
      keywords: extra?.keywords,
      markup: extra?.markup,
    };
  }),
  ...Object.entries(ICON_BUTTON.variants).map(([variant, guidance]): PartSource => {
    const standard = variant === "standard";
    const id = standard ? "icon-btn" : "icon-btn-tonal";
    return {
      id,
      name: standard ? "Icon button" : "Tonal icon button",
      kind: "action",
      summary: standard ? ICON_BUTTON.summary : guidance.summary,
      // The standard part stands for the family, so it carries the press and the row end too.
      classes: standard ? ["icon-btn", "press", "icon-btn-end"] : ["icon-btn-tonal"],
      files: [
        "packages/design-system/src/IconButton.tsx",
        "packages/design-system/src/iconButton.ts",
      ],
      when: sentences(standard ? [...ICON_BUTTON.useWhen, ...guidance.useWhen] : guidance.useWhen),
      not: exclusions(
        standard ? [...guidance.dontUseWhen, ...ICON_BUTTON.dontUseWhen] : guidance.dontUseWhen,
        "icon-btn",
      ),
      keywords: standard
        ? [
            "icon button",
            "icon-only",
            "close",
            "x",
            "dots",
            "more",
            "glyph button",
            "toolbar",
            "back",
            "arrow",
          ]
        : ["circle button", "share", "favorite"],
      markup: standard
        ? '<IconButton label="Close"><Icon name="close" size="lg" /></IconButton>'
        : '<IconButton variant="tonal" label="Share"><Icon name="shareFat" /></IconButton>',
      rules: standard
        ? [
            "label is required: it is the button's accessible name (aria-label), as the glyph has no words.",
            "It draws `.press`: the press is a state layer; the glyph never scales.",
            "rowEnd for one that ends a row; a script or an island (a Base UI Close) takes the classes from iconButtonClass().",
          ]
        : undefined,
    };
  }),
  {
    id: "fab",
    name: "Floating action button",
    kind: "action",
    summary: FAB.summary,
    // add-fab and play-fab are the app's: a page's hook, and the Play face it still draws itself.
    classes: ["create-fab", "create-fab-label", "add-fab", "play-fab"],
    files: ["packages/design-system/src/Fab.tsx", "packages/design-system/src/fab.ts"],
    when: sentences(FAB.useWhen),
    not: exclusions(FAB.dontUseWhen, "button-filled"),
    keywords: ["floating button", "fab", "floating action", "create button", "primary action"],
    markup: '<Fab icon="plus" label="Add source to Design">Add</Fab>',
    rules: [
      "One per page, below 64rem; from 64rem it is not shown.",
      "label is its whole accessible name; the word beside the glyph is hidden from a screen reader.",
      "A script folds it by data-folded on FAB_SELECTOR (design-system/fab.ts).",
    ],
  },
  ...Object.entries(LINK.variants).map(([variant, guidance]): PartSource => {
    const text = variant === "text";
    const id = text ? "text-link" : "source-link";
    return {
      id,
      name: `${guidance.label} link`,
      kind: "action",
      summary: guidance.summary,
      classes: [id],
      files: ["packages/design-system/src/Link.tsx", "packages/design-system/src/link.ts"],
      when: sentences(guidance.useWhen),
      not: exclusions([...guidance.dontUseWhen, ...LINK.dontUseWhen], "button-text"),
      keywords: text
        ? ["inline link", "hint link", "text link", "breadcrumb", "link in a sentence"]
        : ["external link", "publisher", "original article", "source"],
      markup: text
        ? '<Link href="/settings">Settings</Link>'
        : '<Link variant="source" href={url} target="_blank" rel="noopener noreferrer">{publisher}</Link>',
      rules: text
        ? ["A link is a real <a href>; an action on this page is a Button."]
        : ["The player has its own copy, `.player-source-link` (player.css); do not add a third."],
    };
  }),
  control("play-chip", "Play chip", PLAY_CHIP, {
    kind: "action",
    classes: ["chip", "chip-glyph", "chip-label"],
    files: ["packages/design-system/src/PlayChip.tsx", "packages/design-system/src/playChip.ts"],
    keywords: ["duration", "play pill", "status pill", "now playing"],
    markup: '<PlayChip label="5 min" aria-label="Play the briefing" data-play-item={0} />',
    rules: [
      "A native button with no client directive (DS-8): the player writes data-state, data-playing and [data-chip-label].",
    ],
  }),
  control("filter-chip", "Chip", CHIP, {
    classes: ["filter-chip", "filter-chips", "filter-chips-scroll"],
    files: [
      "packages/design-system/src/Chip.tsx",
      "packages/design-system/src/ChipGroup.tsx",
      "packages/design-system/src/chip.ts",
    ],
    not: [{ when: "a long list of options", use: "multiselect" }],
    keywords: ["multi select", "tick", "checkbox pill", "tags", "toggle chip", "filter chip"],
    markup:
      '<ChipGroup aria-label="Show"><Chip name="show" value="daily" defaultChecked>Daily</Chip></ChipGroup>',
    rules: [
      "A native checkbox with no client directive (DS-8); scroll on the group for one sideways row.",
    ],
  }),
  control("segmented-choice", "Segmented choice", SEGMENTED_CHOICE, {
    classes: ["segmented-choice", "segmented-choice-item"],
    files: [
      "packages/design-system/src/SegmentedChoice.tsx",
      "packages/design-system/src/segmentedChoice.ts",
    ],
    keywords: ["radio", "length", "one of", "option group", "pick one"],
    markup:
      '<SegmentedChoice name="length" aria-labelledby="len" defaultValue="3" options={[{ value: "3", label: "3 min" }]} />',
    rules: ["Native radios with no client directive (DS-8)."],
  }),
  control("segmented-nav", "Segmented navigation", SEGMENTED_NAV, {
    kind: "navigation",
    classes: ["segmented-nav", "segmented-nav-tab", "segmented-nav-compact"],
    files: [
      "packages/design-system/src/SegmentedNav.tsx",
      "packages/design-system/src/segmentedNav.ts",
    ],
    not: [{ when: "jumping to sections of a long page", use: "tabs" }],
    keywords: ["tablist", "view switcher", "toggle views", "stories transcript"],
    markup: '<SegmentedNav aria-label="View" tabs={[{ value: "stories", label: "Stories" }]} />',
    rules: [
      "A native tablist with no client directive (DS-8): the page calls mountSegmentedNav(list, onSelect) from design-system/segmentedNav once for each, and draws the panels (each tab's controls).",
    ],
  }),
  control("search-field", "Search field", SEARCH_FIELD, {
    kind: "field",
    classes: ["search-field"],
    files: [
      "packages/design-system/src/SearchField.tsx",
      "packages/design-system/src/searchField.ts",
    ],
    keywords: ["search bar", "filter input", "text filter"],
    markup:
      '<SearchField label="Search your library" name="q" placeholder="Search your library" />',
    rules: ["A native input with no client directive (DS-8)."],
  }),
  control("icon", "Icon", ICON, {
    kind: "display",
    classes: ["icon-glyph", "icon-glyph-lg"],
    files: ["packages/design-system/src/Icon.tsx", "packages/design-system/src/icon.ts"],
    not: [{ when: "the glyph must act when pressed", use: "icon-btn" }],
    markup: '<Icon name="plus" size="lg" />',
    keywords: ["icon", "glyph", "phosphor", "symbol", "chevron", "plus", "check"],
    rules: [
      "Draw it with <Icon>; a script builds one with iconHtml() and an island with <Icon> from player/ui, both through iconClass().",
      "A control that holds a glyph places it with its own rule; it never sets the glyph's size twice.",
    ],
  }),
  control("badge", "Badge", BADGE, {
    kind: "display",
    classes: ["badge-label"],
    files: ["packages/design-system/src/Badge.tsx", "packages/design-system/src/badge.ts"],
    not: [{ when: "the pill can be pressed or ticked", use: "filter-chip" }],
    markup: "<Badge>Admin</Badge>",
    keywords: ["badge", "tag", "pill", "count", "label"],
    rules: ["It holds one word or one number; the page places it with a class, never styles it."],
  }),
  control("switch", "Switch", SWITCH, {
    keywords: [
      "switch",
      "toggle",
      "on off",
      "boolean",
      "enable",
      "mixed",
      "indeterminate",
      "master",
    ],
    markup:
      '<div class="settings-row"><label class="settings-label" for="autoplay">Autoplay</label><Switch id="autoplay" name="autoplay" /></div>',
    files: ["packages/design-system/src/Switch.tsx", "packages/design-system/src/switch.ts"],
    rules: [
      'It is the native checkbox (role="switch") and takes no client directive (DS-8): an Astro page starts it with defaultChecked, a React island passes checked with onChange.',
    ],
  }),
  control("slider", "Slider", SLIDER, {
    keywords: ["slider", "range", "volume", "speed", "scrub"],
    markup:
      '<Slider aria-label="Volume" min={0} max={1} step={0.05} defaultValue={0.7} style="--range-fill: 70%" />',
    files: ["packages/design-system/src/Slider.tsx", "packages/design-system/src/slider.ts"],
    rules: [
      "It is the native range and takes no client directive (DS-8): an Astro page starts it with defaultValue, a React island passes value with onChange.",
      "WebKit paints the filled track from --range-fill, which starts at 0%: set it to (value - min) / (max - min) as a percentage and update it on input.",
    ],
  }),
  control("field", "Field", FIELD, {
    keywords: ["field", "input", "text field", "textarea", "select", "dropdown", "form"],
    markup:
      '<div class="manage-field"><label for="title">Title</label><Field id="title" name="title" type="text" /></div>',
    files: ["packages/design-system/src/Field.tsx", "packages/design-system/src/field.ts"],
    rules: [
      "It needs no client directive: it is a native input, and types and submits before any script (DS-8).",
      "Draw it with <Field> (multiline for a textarea); a select or a script takes the class from fieldClass().",
      "A disabled field dims like a disabled switch; a disabled fieldset dims it the same way, on the same element.",
    ],
  }),
  control("select", "Select", SELECT, {
    not: [
      { when: "the value is one of two to four short options", use: "segmented-choice" },
      { when: "several values may be ticked together", use: "multiselect" },
    ],
    classes: ["select-outlined", "select-tonal"],
    files: [
      "packages/design-system/src/Select.tsx",
      "packages/design-system/src/select.ts",
      "packages/design-system/src/selectSheet.ts",
      "packages/design-system/src/wheel.ts",
    ],
    keywords: [
      "select",
      "dropdown",
      "sort",
      "sort by",
      "order by",
      "picker",
      "choose one",
      "filter",
      "wheel",
    ],
    markup:
      '<Select variant="tonal" label="Sort" data-library-sort><option value="newest">Newest first</option></Select>',
    rules: [
      "A native select with no client directive (DS-8); a page that draws one calls installSelectSheet() once for the phone's sheet.",
      'Outlined (the default) is a value in a form; tonal is a sort or a filter and takes data-active on its wrapper (find it with closest("[data-select]")) once its value is not the default.',
      'A select inside a settings row takes class="value-select" from settings.css, which draws it as the row\'s value.',
      "data-wheel on a short ordered run (the hours of a day) opens its phone sheet as a Wheel (design-system/wheel.ts), not as rows.",
    ],
  }),
  control("menu", "Menu", MENU, {
    classes: [
      "menu-list",
      "menu-sheet",
      "menu-item",
      "menu-item-danger",
      "menu-tiles",
      "menu-tile",
      "menu-item-value",
    ],
    keywords: [
      "popover",
      "dots menu",
      "context menu",
      "long press",
      "action sheet",
      "more menu",
      "overflow menu",
    ],
    markup:
      '<Menu id="row-menu-3" title="Daily"><MenuItem><Icon name="pencilSimple" />Edit</MenuItem><MenuItem tone="danger"><Icon name="trash" />Delete</MenuItem></Menu>',
    files: [
      "packages/design-system/src/Menu.tsx",
      "packages/design-system/src/MenuItem.tsx",
      "packages/design-system/src/menu.ts",
    ],
    rules: [
      "A native popover with no client directive: its button opens it with popoverTarget (DS-8).",
      "Under 40rem a menu is a sheet, never a small popover.",
      "A script finds one with MENU_SELECTORS (design-system/menu.ts); a string builder or an island takes menuListClass() and menuItemClass().",
    ],
  }),
  control("banner", "Banner", BANNER, {
    kind: "feedback",
    classes: ["banner-notice", "banner-text", "banner-title", "banner-body"],
    files: ["packages/design-system/src/Banner.tsx", "packages/design-system/src/banner.ts"],
    keywords: ["alert", "notice", "warning", "error message", "persistent"],
    not: [
      { when: "a message that clears itself", use: "toast" },
      { when: "a page with nothing to list", use: "empty-state" },
    ],
    markup: '<Banner tone="danger" icon="alert" title="Download failed" />',
    rules: [
      "Only the icon takes the tone.",
      "An island draws one with bannerClass() and bannerText.",
    ],
  }),
  control("toast", "Toast", TOAST, {
    kind: "feedback",
    classes: ["toast-popover", "toast-action", "toast-dismiss"],
    files: [
      "packages/design-system/src/Toast.tsx",
      "packages/design-system/src/toast.ts",
      "packages/design-system/src/toastStore.ts",
      "packages/design-system/src/toastEvent.ts",
    ],
    keywords: ["snackbar", "undo", "flash message", "notification"],
    markup: 'showToast({ message: "Deleted", actionLabel: "Undo", onAction })',
    rules: [
      "Mount <Toast client:idle /> once per page; call showToast() from toastStore, or sendToast() from toastEvent in code that must not load the store.",
      "The page says where it sits with --toast-nav, --toast-dock, --toast-lift and --toast-inline-start/-end on the root, never with a rule on .toast-popover.",
    ],
  }),
  control("dialog", "Dialog", DIALOG, {
    kind: "container",
    classes: ["dialog-panel", "dialog-body", "dialog-actions", "dialog-actions-stacked"],
    not: [{ when: "a form that slides in, with fields", use: "sheet" }],
    files: [
      "packages/design-system/src/Dialog.tsx",
      "packages/design-system/src/DialogActions.tsx",
      "packages/design-system/src/DialogTitle.tsx",
      "packages/design-system/src/dialog.ts",
    ],
    keywords: ["confirm", "modal", "yes or no", "are you sure", "delete confirm"],
    markup:
      '<Dialog aria-labelledby="t"><DialogTitle id="t">Delete?</DialogTitle><DialogActions><Button variant="text">Cancel</Button></DialogActions></Dialog>',
    rules: [
      "A script finds one with DIALOG_SELECTOR; one it builds uses dialogClass(), dialogBodyClass() and dialogActionsClass().",
      "It renders closed, with no client directive: a script opens it with dialog.showModal() (an island through ref) and closes it with dialog.close() from the Cancel button's click.",
    ],
  }),
  control("sheet", "Sheet", SHEET, {
    kind: "container",
    classes: ["sheet-side", "sheet-head", "sheet-body", "sheet-title"],
    files: [
      "packages/design-system/src/Sheet.tsx",
      "packages/design-system/src/sheet.ts",
      "packages/design-system/src/SheetHeader.tsx",
      "packages/design-system/src/sheetHead.ts",
    ],
    keywords: [
      "bottom sheet",
      "title and close control",
      "panel",
      "side panel",
      "form sheet",
      "full screen sheet",
      "slide over",
      "modal form",
    ],
    markup:
      '<Sheet title="Regenerate" titleId="regen-title" close="data-dialog-close"><form>...</form></Sheet>',
    rules: [
      'A native dialog with no client directive: a script finds one with SHEET_SELECTOR (design-system/sheet.ts) and opens it with showModal(); kind="create" is the New episode sheet, every other is a "panel".',
      "A header a script builds is sheetHeadHtml() (design-system/sheetHead.ts); never write the row or its Close by hand.",
      "`sheet-field*`, `sheet-form` and `sheet-actions` are form layout in sheets.css, not the shell.",
    ],
  }),
  control("drawer", "Drawer", DRAWER, {
    kind: "container",
    classes: ["drawer-scrim", "drawer-viewport", "drawer-popup", "drawer-panel"],
    files: ["packages/design-system/src/drawer.ts"],
    keywords: ["island sheet", "swipe to dismiss", "Base UI drawer", "react sheet"],
    markup:
      '<SheetFrame open={open} onOpenChange={setOpen} title="Create" closeLabel="Close">...</SheetFrame>',
    rules: [
      "Mount SheetFrame; it draws the scrim, viewport, popup and panel from drawer.ts, and the Sheet's head.",
      "Motion uses --duration-sheet-in, --duration-sheet-out and --ease-drawer.",
    ],
  }),
  control("ripple", "Ripple", RIPPLE, {
    kind: "feedback",
    classes: ["ripple-area", "ripple-wave"],
    files: ["packages/design-system/src/Ripple.tsx", "packages/design-system/src/ripple.ts"],
    keywords: ["ripple", "touch feedback", "press wave", "touch area", "tab press", "bottom bar"],
    markup: '<a href="/library" data-ripple><Ripple />Library</a>',
    rules: [
      "The control is `position: relative` with its own stacking context (isolation: isolate); the layer sits beneath its icon and label.",
      "To reach past the control's box set --ripple-reach-start, --ripple-reach-end or --ripple-reach-bottom on the control; --ripple-display: none turns the layer off where the control has a pointer state.",
      "installRipple() (design-system/ripple.ts) is called once by the app script; the control sets nothing else.",
    ],
  }),
];
