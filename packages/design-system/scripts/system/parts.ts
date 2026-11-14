/**
 * The shared parts of the reader, as an author states them: what each is for and what it is not for.
 * Everything checkable (the class exists, who styles it, which tokens it reads) is derived from the
 * package's code by build.ts, so this file holds only judgment. `files` names library files only
 * (DS-2): an app's component that draws a part is in that app's usage report.
 *
 * The families that are real components (packages/design-system/src) come from componentParts.ts,
 * built from the registry; a family that moves there deletes its entries here. system.test.ts
 * checks ids only within the whole list.
 */
import { COMPONENT_A11Y, PART_A11Y } from "../../src/a11y.js";
import { componentParts } from "./componentParts.js";
import type { PartSource } from "./types.js";

export const PARTS: PartSource[] = [
  ...componentParts(),
  {
    id: "btn-action-tonal",
    name: "Tonal action",
    kind: "action",
    summary: "The one creating action in the side column (Catch up), on the action tone.",
    classes: ["btn-action-tonal"],
    when: ["the Catch up action in the side column"],
    not: [{ when: "any other button", use: "button-tonal" }],
    keywords: ["catch up", "side column", "create action"],
    markup: '<button type="button" class="btn-action-tonal">Catch up</button>',
    rules: [
      "Paint modifier only (radius, fill, hover and pressed states): apply it to the Catch up creating action in the side column; the host element keeps its own size and layout.",
    ],
  },
  {
    id: "tabs",
    name: "Section tabs",
    kind: "navigation",
    summary: "A sticky strip of links to the sections of one page.",
    classes: ["tabs-bar", "tab", "tabs-in-card"],
    files: ["packages/design-system/src/SectionTabs.tsx"],
    when: ["jump to the sections of a briefing or an episode", "tabs inside a card"],
    not: [{ when: "switching between two views", use: "segmented-nav" }],
    keywords: ["anchor links", "section nav"],
    markup:
      '<SectionTabs sections={[{ slug: "stories", title: "Stories" }, { slug: "sources", title: "Sources" }]} />',
    rules: [
      "Drawn only for two sections or more.",
      "Each section's slug names its target: the section the tab jumps to has id `c-<slug>`.",
    ],
    a11y: COMPONENT_A11Y.SectionTabs,
  },
  {
    id: "row-action",
    name: "Row action",
    kind: "container",
    summary: "A row that is one link or button: the whole row responds as a rounded tile.",
    classes: ["row-action", "settings-text", "settings-label", "settings-hint"],
    when: [
      "a settings row that opens a sub-page",
      "a menu or list row that navigates",
      "a row with a label, a hint and a chevron",
    ],
    not: [
      { when: "a row that holds a switch or a select", use: "settings-row" },
      { when: "a destructive or non-navigating action", use: "button-text" },
    ],
    keywords: ["settings link", "navigation row", "chevron", "list item", "tappable row"],
    markup:
      '<a class="row-action" href="/settings/schedule"><span class="settings-text"><span class="settings-label">Daily</span><span class="settings-hint">Every other day</span></span><Icon name="chevronRight" /></a>',
    rules: ["Label in regular weight, never bold.", "Sits in a `.rows.card-group`."],
    a11y: PART_A11Y["row-action"],
  },
  {
    id: "card-group",
    name: "Card group",
    kind: "container",
    summary: "A group of rows in one rounded container on the container tone.",
    classes: ["card-group", "rows"],
    when: [
      "group several settings rows",
      "a card of chips",
      "one note that is an offer, with the accent tone",
    ],
    not: [{ when: "a single stat or number", use: "stat-tiles" }],
    keywords: ["card", "settings group", "section container", "grouped list"],
    markup:
      '<ul class="rows card-group">\n  <li class="settings-row"><span class="settings-label">Account</span><span class="settings-hint">Signed in</span></li>\n</ul>',
    rules: [
      "A card of one row follows its height for its corner.",
      "Dividers run edge to edge inside.",
    ],
  },
  {
    id: "settings-row",
    name: "Settings row",
    kind: "container",
    summary: "A row with a label and an in-place control: a switch, a select or a value.",
    classes: ["settings-row", "settings-label", "settings-hint"],
    when: ["a setting with a switch", "a setting with a select", "a labeled value with a hint"],
    not: [{ when: "a row that opens another page", use: "row-action" }],
    keywords: ["preference", "toggle row", "switch row", "setting"],
    markup:
      '<div class="settings-row">\n  <div class="settings-text">\n    <label class="settings-label" for="autoplay">Autoplay</label>\n    <span class="settings-hint">Continue to the next episode</span>\n  </div>\n  <Switch id="autoplay" name="autoplay" />\n</div>',
  },
  {
    id: "empty-state",
    name: "Empty state",
    kind: "feedback",
    summary:
      "A spot illustration, a title, one line and at most two actions, for a page with nothing in it.",
    classes: ["empty", "empty-actions"],
    when: ["a page or section with nothing to list yet", "no results, offline, not found"],
    not: [
      { when: "a list that has items", use: "card-group" },
      { when: "a notice above content that exists", use: "banner" },
    ],
    keywords: ["nothing yet", "no results", "blank slate", "zero state"],
    rules: [
      "EmptyState is planned (DS-14) and not yet exported or styled by this package.",
      "Do not invent an EmptyState component or hand-write unstyled .empty or .empty-actions markup; shell.css uses .empty only as a layout hook and provides no visual styling. Use Banner for inline notices or ask the owner (see GAPS.md).",
    ],
  },
  {
    id: "multiselect",
    name: "Multi-select",
    kind: "field",
    summary: "A field-like trigger that opens a list of checkable choices.",
    classes: ["multiselect-trigger"],
    when: ["choose several from a long list", "pick sources or topics in a field"],
    not: [{ when: "a few choices that fit on screen", use: "filter-chip" }],
    keywords: ["dropdown with checkboxes", "picker"],
    rules: [
      "Not yet exported or styled by this package (see GAPS.md). Use Chip and ChipGroup (filter-chip) for 2 to 6 short options, or ask the owner before building a custom multi-select.",
    ],
  },
  {
    id: "stat-tiles",
    name: "Stat tiles",
    kind: "container",
    summary: "A tile per figure: the value large over its word in muted ink.",
    classes: ["stat-tiles"],
    when: ["figures on a dashboard", "costs and spend totals"],
    not: [{ when: "a list of rows", use: "card-group" }],
    keywords: ["kpi", "numbers", "metrics"],
    markup:
      '<ul class="stat-tiles">\n  <li class="stat-tile">\n    <span class="stat-tile-value">42</span>\n    <span class="stat-tile-label">Stories</span>\n  </li>\n</ul>',
  },
  {
    id: "section-head",
    name: "Section head",
    kind: "layout",
    summary: "A section header with more room above than below, so it belongs to what follows.",
    classes: ["section-head"],
    when: ["title a group of rows or cards on a page"],
    keywords: ["heading", "group title"],
    markup: '<h2 class="section-head">Settings</h2>',
  },
  {
    id: "meta",
    name: "Meta line",
    kind: "layout",
    summary: "One quiet line of facts, separated by centered dots.",
    classes: ["meta"],
    when: ["date, duration and source under a title"],
    keywords: ["subtitle", "facts line"],
    markup: '<p class="meta"><span>Weekly</span><span>14 stories</span></p>',
  },
  {
    id: "cover",
    name: "Cover",
    kind: "container",
    summary: "A generated cover image, drawn once per theme.",
    classes: ["cover"],
    when: ["show an episode or briefing cover"],
    keywords: ["artwork", "thumbnail", "album art"],
    rules: [
      "Not yet exported or styled by this package (see GAPS.md). Cover artwork generation lives in the consumer app; ask the owner before adding cover styling.",
    ],
  },
];
