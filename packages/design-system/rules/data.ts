/**
 * The lists the rules read, kept as data so the app's design-check, `ds validate` and the library read
 * one copy. A new exception or a removal adds a row here.
 */

/**
 * The only rules that may space with --space-1 (4px), each with why. Everything else spaces on the
 * 8pt grid: a 4px gap between two rows, or under a heading, reads as the two touching. A selector
 * matches when it contains the entry as a whole name. Moved from the app's styles.test.ts
 * (ALLOWED_4PX), which named the reader's selectors as well as the library's.
 */
export const GRID_EXCEPTIONS: [selector: string, reason: string][] = [
  [".banner-notice > .button-text", "the action's hit area reaching into the banner's padding"],
  [".banner-body", "a banner's title onto its body, inside one banner"],
  [".menu-tile", "a glyph onto its word inside one tile: the icon-to-label gap is 4px, items 8px"],
  [".manage-field", "a label onto its field (owner, 2026-11-05)"],
  [".sheet-field", "a label onto its field (owner, 2026-11-05)"],
  [".segmented-nav-tab::after", "the segmented control's inset: the tab's fill sits 4px inside it"],
  [".topic-add-source::after", "the button's hit area reaching 4px past it"],
  [
    ".menu-tiles[data-fold] > .menu-item",
    "the Library card's quick actions are the same tiles on a phone: glyph to word 4px",
  ],
  [".queue-going", "a ring onto its time or percent inside one lead: the icon-to-label gap is 4px"],
  [".create-fab-label", "the button's own inner gap at the label's end"],
  [".sheet-head", "the header's 44px buttons, offset to the edge as a hit area"],
  [".create-more-text", "title onto its subtitle inside one row"],
  [".episode-highlight-actions", "the chips' hit-area overhang under the highlight"],
  [".hero-text", "title onto its subtitle inside one block"],
  [".library-filters", "room for the chips' focus ring inside the scroller"],
  [".filter-chips-scroll", "room for the chips' focus ring inside the scroller"],
  ['[data-view="list"] .card-link::after', "the row's press layer, inset as a hit area"],
  [".card-match", "title onto its subtitle inside one row"],
  [".card-sub", "title onto its subtitle inside one row"],
  [".multiselect-text", "title onto its subtitle inside one option"],
  [".player-collapse", "the button's inner padding and its offset past the focus ring"],
  [".player-meta", "the title onto its meta line"],
  [".player-meta-line", "an icon beside its own label, and the notice's inner padding"],
  [".player-title", "room for the title's focus ring"],
  [".dock-text", "title onto its subtitle inside one row"],
  [".dock-seek-time", "a chip's inner padding"],
  [".scrubber-bubble", "a chip's inner padding and its optical nudge onto the track"],
  [".script-turn", "the speaker onto their words inside one turn"],
  [".row-action::after", "the row's press layer, inset as a hit area"],
  [".source-link", "an icon beside its own label"],
  [".filter-chip", "a chip's inner gap"],
  [".select-tonal > select::picker(select)", "the list's edge onto the label's outline"],
  [".meta-wrap", "the meta link's hit area reaching past its words"],
  [".segmented-choice-item", "the check glyph beside its own segment label"],
  [".segmented-nav", "a segmented track: the pill inset by its 4px track padding"],
  [".settings-text", "title onto its subtitle inside one row"],
  [
    ".costs-answer",
    "a figure's label onto the figure, and the figure onto its line, inside one block",
  ],
  [".toast", "the action's hit area reaching the toast's edge"],
  [".app-bar-back", "the back button's hit area, offset to the edge"],
  [".app-nav-item", "an icon beside its own label"],
  [".source-icon > img", "the favicon's inset inside its own tile"],
  [".source-host", "the separator dot beside its own text"],
  [".score", "the meter beside its own label"],
  [".source-card-score", "the meter beside its own label"],
  [".source-plus-btn", "the button's hit area and its press layer's inset"],
  ["html[data-manage-toast-open]", "a bar's inset sum: the 4px inset doubled, landing on the grid"],
];

export interface RetiredPath {
  /** The import specifier that is retired. */
  path: string;
  /** What to import instead. */
  use: string;
  /** warning while the path still works (deprecated, COMPATIBILITY.md), error once it is removed. */
  severity: "warning" | "error";
}

/** Import paths the package retired. */
export const RETIRED_PATHS: RetiredPath[] = [
  {
    path: "@singularityfm/design-system/Button.astro",
    use: "@singularityfm/design-system/Button",
    severity: "warning",
  },
];
