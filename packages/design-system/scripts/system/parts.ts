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
    rules: ["Drawn only for two sections or more."],
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
  },
  {
    id: "toast",
    name: "Toast",
    kind: "feedback",
    summary: "One quiet message at a time on the inverse surface, with an optional action.",
    classes: ["toast", "toast-action", "toast-dismiss"],
    when: [
      "a brief message with an Undo after a delete",
      "a failure that clears itself",
      "a partial save",
    ],
    not: [
      { when: "a notice that must stay", use: "banner" },
      {
        when: "a success or Saved confirmation",
        use: "nothing; D115 allows only failures, Undo and partial saves",
      },
    ],
    keywords: ["snackbar", "undo", "flash message", "notification"],
    markup: 'showToast({ message: "Deleted", actionLabel: "Undo", onAction })',
    rules: ["From a script outside the sheets chunk, use `sendToast`."],
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
    markup:
      '<EmptyState art="library" title="Nothing saved yet" body="..." primary={{ label: "Go to Latest", href: "/" }} />',
    rules: ["Never hand-write `.empty` markup."],
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
  },
  {
    id: "section-head",
    name: "Section head",
    kind: "layout",
    summary: "A section header with more room above than below, so it belongs to what follows.",
    classes: ["section-head"],
    when: ["title a group of rows or cards on a page"],
    keywords: ["heading", "group title"],
  },
  {
    id: "meta",
    name: "Meta line",
    kind: "layout",
    summary: "One quiet line of facts, separated by centered dots.",
    classes: ["meta"],
    when: ["date, duration and source under a title"],
    keywords: ["subtitle", "facts line"],
  },
  {
    id: "cover",
    name: "Cover",
    kind: "container",
    summary: "A generated cover image, drawn once per theme.",
    classes: ["cover"],
    when: ["show an episode or briefing cover"],
    keywords: ["artwork", "thumbnail", "album art"],
  },
];
