/**
 * The lists the rules read, kept as data so the app's design-check, `ds validate` and the library read
 * one copy. A new exception or a removal adds a row here.
 */

/**
 * The only rules that may space with --space-1 (4px), each with why. Everything else spaces on the
 * 8pt grid: a 4px gap between two rows, or under a heading, reads as the two touching. A selector
 * matches when it contains the entry as a whole name. These are the library's own selectors, from the
 * app's ALLOWED_4PX; the app passes the rest, which name its own pages, to offGrid, so a 4px case on an
 * app page needs no library release.
 */
export const GRID_EXCEPTIONS: [selector: string, reason: string][] = [
  [".banner-notice > .button-text", "the action's hit area reaching into the banner's padding"],
  [".banner-body", "a banner's title onto its body, inside one banner"],
  [".menu-tile", "a glyph onto its word inside one tile: the icon-to-label gap is 4px, items 8px"],
  [".segmented-nav-tab::after", "the segmented control's inset: the tab's fill sits 4px inside it"],
  [
    ".menu-tiles[data-fold] > .menu-item",
    "the Library card's quick actions are the same tiles on a phone: glyph to word 4px",
  ],
  [".sheet-head", "the header's 44px buttons, offset to the edge as a hit area"],
  [".filter-chips-scroll", "room for the chips' focus ring inside the scroller"],
  ['[data-view="list"] .card-link::after', "the row's press layer, inset as a hit area"],
  [".row-action::after", "the row's press layer, inset as a hit area"],
  [".source-link", "an icon beside its own label"],
  [".filter-chip", "a chip's inner gap"],
  [".select-tonal > select::picker(select)", "the list's edge onto the label's outline"],
  [".meta-wrap", "the meta link's hit area reaching past its words"],
  [".segmented-choice-item", "the check glyph beside its own segment label"],
  [".segmented-nav", "a segmented track: the pill inset by its 4px track padding"],
  [".toast", "the action's hit area reaching the toast's edge"],
  [".app-bar-back", "the back button's hit area, offset to the edge"],
  [".app-nav-item", "an icon beside its own label"],
  [".source-host", "the separator dot beside its own text"],
  [".score", "the meter beside its own label"],
  [".source-plus-btn", "the button's hit area and its press layer's inset"],
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
  ...[
    "Button",
    "Icon",
    "BrandMark",
    "Flag",
    "Badge",
    "Banner",
    "ChapterAside",
    "RowExit",
    "Ripple",
    "SectionTabs",
    "Field",
    "Switch",
    "Slider",
    "Dialog",
    "DialogTitle",
    "DialogActions",
    "Sheet",
    "SheetHeader",
    "Menu",
    "MenuItem",
    "Select",
    "Avatar",
    "Code",
  ].map(
    (name): RetiredPath => ({
      path: `@singularityfm/design-system/${name}.astro`,
      use: `@singularityfm/design-system/${name}`,
      severity: "warning",
    }),
  ),
];

/**
 * Rules where a pixel length is allowed, as [selector, reason]: the geometry of an SVG scene, whose
 * units are the drawing's own (a pivot at 50 90 of a 100 wide figure), never a length on the page.
 */
export const PX_EXCEPTIONS: [selector: string, reason: string][] = [
  [".avatar", "the figure's SVG units: its pivot and its bob are drawn in the picture's own scale"],
  [
    ".avatar-phones",
    "the figure's SVG units: the pair of phones slides in the picture's own scale",
  ],
];
