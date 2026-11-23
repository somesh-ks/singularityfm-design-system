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
  [
    ".create-fab-label",
    "the word's end onto the Fab's padding, which is sized for the plus's square: 4px more balances it",
  ],
  [".settings-text", "a setting's label onto its hint, inside one row"],
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

/**
 * The control heights, in rem, per mood. Each control takes its height from one of these steps (S, M,
 * L), so two side by side line up: Default S 36px, M 44px, L 48px; Expressive S 44px, M 52px, L 56px.
 * Halloween is Default. The list is the one place the steps live: the size test reads it. The owner's
 * targets (23 Nov) for the adoption PR: a select is one height, 44 (`--field-height`, 48 today); a menu
 * row is 48 (`--size-option`); Topics' Add source is a normal button, 48. The app bar, the navigation bar
 * and the play disc are chrome, outside the steps (SIZE_LITERAL_EXCEPTIONS).
 */
export const SIZE_STEPS = {
  default: [2.25, 2.75, 3],
  expressive: [2.75, 3.25, 3.5],
} as const;

/**
 * Heights that sit off the steps today, by token name, with why. A name here may hold any value in
 * its moods: it is debt to settle, and each entry leaves this list when its height moves onto a step.
 * Chrome is not debt: it is a `:root { --name }` entry in SIZE_LITERAL_EXCEPTIONS. A new off-step
 * height is on neither list, so it fails.
 */
export const SIZE_DEBT: [name: string, reason: string][] = [
  ["button-height-small", "the small button, 32px (40 Expressive); the step is 36 (44)"],
  ["switch-height", "the switch, 32px (40 Expressive): a control without a step yet"],
  ["item-play-size", "Play, 36px by default and 48 Expressive; the Expressive step is 44"],
  ["checkbox-size", "the checkbox box, 18px: a control without a step yet"],
  ["tabs-indicator-height", "the tab's underline, 3px: a bar under the tab, not the tab's height"],
  [
    "mini-player-progress-height",
    "the mini player's progress line, 2px: a line, not a control height",
  ],
  ["cta-height", "never read by a stylesheet (dead); 56px, 64 Expressive"],
  ["toast-min-height", "never read: toast.css draws its own calc(touch + 2 space-1), 52px"],
  ["control-size-md", "the medium round control, 56px: a circle, not a row control"],
];

/**
 * Declarations where a rem or em length is a size on purpose, as ["selector { property }", reason]. A
 * picture, a decoration, a glyph drawn in its text's units, a sheet's cap: none is a control height.
 * The FAB's root size is a control (debt): it moves to a token with the owner's OK. A `:root { --name }`
 * entry for a token in tokens.css exempts that token from the size steps test: chrome, not a control.
 */
export const SIZE_LITERAL_EXCEPTIONS: [declaration: string, reason: string][] = [
  [
    ":root { --app-bar-height }",
    "the app bar, 56px (64 Expressive): chrome, outside the control steps (owner, 23 Nov)",
  ],
  [
    ":root { --nav-bar-height }",
    "the bottom navigation bar, 64px (80 Expressive): chrome, outside the control steps (owner, 23 Nov)",
  ],
  [
    ":root { --nav-indicator-height }",
    "the navigation bar's pill, 32px (40 Expressive): chrome, outside the control steps (owner, 23 Nov)",
  ],
  [
    ":root { --control-size-lg }",
    "the play disc, 72px (80 Expressive): chrome, outside the control steps (owner, 23 Nov)",
  ],
  [
    ":root { --fab-size }",
    "debt: the floating button is a control at 56px, off the steps; a token is due",
  ],
  [":root { --av-size }", "the avatar's picture size, a ramp of its own: a figure, not a control"],
  [':root[data-mood="expressive"] { --av-size }', "the avatar's picture size in Expressive"],
  [".avatar-lg { --av-size }", "the avatar's larger picture size"],
  [".avatar-xl { --av-size }", "the avatar's largest picture size"],
  [
    ':root[data-mood="expressive"] .avatar-lg { --av-size }',
    "the avatar's larger picture size in Expressive",
  ],
  [
    ':root[data-mood="expressive"] .avatar-xl { --av-size }',
    "the avatar's largest picture size in Expressive",
  ],
  [
    "textarea.field-input { min-block-size }",
    "a multi-line field's floor: six lines of text, not a control height",
  ],
  [".flag-inline { block-size }", "the flag glyph, drawn in its text's em"],
  [
    ".picker-pop[data-sheet] { max-block-size }",
    "the phone sheet's height cap, not a control's height",
  ],
  [".cobweb { block-size }", "the decorative scene's own box, drawn at its size"],
  [
    ":root { --pick-list-height }",
    "the tallest an open list grows (select, picker): a list's cap, not a control's height",
  ],
  [
    ":root { --run-height }",
    "the Create run strip above the bottom bar: chrome, sized to its own row",
  ],
  [
    ':root[data-mood="expressive"] .slider-wave-field { --wave-height }',
    "the scrubber's wave: a drawing's height, not a control's",
  ],
  [
    ':root[data-mood="halloween"] .slider-wave-field { --wave-height }',
    "the scrubber's wave in Halloween: a drawing's height, not a control's",
  ],
  [
    ".guide-live-side { block-size }",
    "the style guide's live stage: a box that shows a part, not a control's height",
  ],
];
