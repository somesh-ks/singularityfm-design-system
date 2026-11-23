/**
 * Structured accessibility contracts and minimal standalone usage examples for every component in
 * the registry and every exported React component. Read by registry.ts, scripts/system/parts.ts,
 * scripts/system/componentParts.ts, scripts/system/build.ts and the style guide so system.json,
 * tokens/parts/*.md, tokens/components/*.md and component pages share one contract.
 */
import type { A11yGuidance } from "./guidance.ts";

/** Accessibility contract keyed by registry component name (all 28 entries in registry.ts). */
export const REGISTRY_A11Y = {
  Button: {
    role: "Native <button> (or <a href> when href is set)",
    aria: [
      "Accessible name comes from children; provide descriptive label text.",
      "Do not nest interactive elements inside Button.",
    ],
    keyboard: ["Enter and Space activate <button>; Enter activates link (<a href>)."],
    focus: "Native keyboard focus ring via :focus-visible.",
  },
  "Icon button": {
    role: "Native <button> (or <a href> when href is set)",
    aria: [
      'label prop is required and sets aria-label because the child Icon is aria-hidden="true".',
      "Toggle buttons pass aria-pressed and swap between off and filled child Icons.",
    ],
    keyboard: ["Enter and Space activate the button; Enter activates link mode."],
    focus: "Native 44px touch target with :focus-visible focus ring.",
  },
  FAB: {
    role: "Native <button> (or <a href> when href is set)",
    aria: [
      "label prop is required and sets aria-label.",
      'The visible extended text span is aria-hidden="true" so screen readers announce label once.',
    ],
    keyboard: ["Enter and Space activate the button; Enter activates link mode."],
    focus: "Native keyboard focus ring via :focus-visible.",
  },
  Link: {
    role: "Native <a href>",
    aria: [
      "Accessible name comes from children.",
      'External source links use target="_blank" with rel="noopener noreferrer".',
    ],
    keyboard: ["Enter navigates to href."],
    focus: "Native focus ring via :focus-visible with 44px tap area.",
  },
  "Play chip": {
    role: 'Native <button type="button">',
    aria: [
      "Requires aria-label when label is omitted (glyph-only mode).",
      'Inner glyph slot and PlayingBars are aria-hidden="true"; player script updates data-state, data-playing and aria-label.',
    ],
    keyboard: ["Enter and Space toggle or start playback via native button activation."],
    focus: "Native keyboard focus ring via :focus-visible.",
  },
  "Segmented navigation": {
    role: 'Container role="tablist" with child <button role="tab"> items',
    aria: [
      "Name the tablist with aria-label or aria-labelledby.",
      'Active tab sets aria-selected="true" and omits tabIndex; inactive tabs set aria-selected="false" and tabIndex={-1}.',
      "Each tab carries aria-controls matching its panel id; icon tabs use aria-label={tab.label}.",
    ],
    keyboard: ["mountSegmentedNav() handles ArrowLeft, ArrowRight, Home, End, Enter and Space."],
    focus: "Roving tabindex moves focus onto the newly selected tab.",
  },
  Icon: {
    role: 'Decorative <svg aria-hidden="true" focusable="false">',
    aria: [
      "Always hidden from assistive technology; wrap inside Button, IconButton or labelled text.",
    ],
    keyboard: ["None; non-interactive graphic."],
    focus: 'Not focusable (focusable="false").',
  },
  Avatar: {
    role: 'Base UI Avatar.Root: static <span> or interactive <button type="button"> when label is set',
    aria: [
      "Pass label to render an interactive profile button with aria-label={label}.",
      'Decorative shape SVG inside is aria-hidden="true".',
    ],
    keyboard: ["When label is provided, Enter and Space trigger the profile button."],
    focus: "Focusable only when label renders it as a button.",
  },
  "Row exit": {
    role: "Native <li> list item",
    aria: [
      "Place inside <ul> or <ol>; page scripts mark data-removing or data-gone and pair removal with Toast Undo.",
    ],
    keyboard: ["Inherits keyboard semantics of controls placed inside the row."],
    focus: "Page script should restore or move focus cleanly when removing a focused row.",
  },
  Badge: {
    role: "Static inline <span>",
    aria: [
      "Inline text label; ensure surrounding text provides context when a count or status alone is ambiguous.",
    ],
    keyboard: ["None; non-interactive indicator."],
    focus: "Not focusable.",
  },
  Flag: {
    role: 'Decorative <img alt="" aria-hidden="true"> or <span aria-hidden="true">',
    aria: [
      'Flag glyphs are always aria-hidden="true"; text passed with the text prop stays readable. A region flag alone carries no name: put the country or language in nearby text or the parent\'s aria-label.',
    ],
    keyboard: ["None; decorative region mark."],
    focus: "Not focusable.",
  },
  Code: {
    role: 'Focusable <pre tabIndex={0}> + Copy IconButton + <span role="status"> live region',
    aria: [
      "label sets aria-label on the <pre> region.",
      'Copy button announces completion through the polite <span role="status"> live region.',
    ],
    keyboard: [
      "Tab focuses <pre> for arrow-key scrolling/selection and moves to the Copy button; Enter/Space copies.",
    ],
    focus: "Both <pre tabIndex={0}> and the Copy button receive keyboard focus.",
  },
  Switch: {
    role: 'Native <input type="checkbox" role="switch">',
    aria: [
      "Native checked state drives switch semantics; associate with <label for>, aria-label or aria-labelledby.",
      'role="switch" has no mixed state: a script-set indeterminate is visual only. Use a Checkbox when a mixed state must be announced.',
    ],
    keyboard: ["Space toggles the switch; submits inside forms."],
    focus: "Native focus ring via :focus-visible on the switch control.",
  },
  Slider: {
    role: 'Native <input type="range">',
    aria: [
      "Must be named via aria-label, aria-labelledby or associated <label for>.",
      "Expose min, max, step and native numeric value.",
    ],
    keyboard: [
      "ArrowLeft/ArrowDown decrease, ArrowRight/ArrowUp increase, PageUp/PageDown/Home/End step.",
    ],
    focus: "Native thumb focus ring via :focus-visible.",
  },
  Field: {
    role: "Native <input> (or <textarea> when multiline)",
    aria: [
      "Associate with a visible <label>, aria-label or aria-labelledby.",
      'Set aria-invalid="true" for validation errors and aria-describedby for error messages.',
    ],
    keyboard: ["Standard native text input/textarea editing and Tab navigation."],
    focus: "Native input/textarea focus ring.",
  },
  Chip: {
    role: 'Native <input type="checkbox"> wrapped in <label>',
    aria: [
      "Group related filter chips inside ChipGroup with aria-label or aria-labelledby.",
      "Checked state is native to the checkbox.",
    ],
    keyboard: ["Space toggles selection; Tab moves between checkboxes."],
    focus: "Native focus ring styled around the pill via :focus-visible.",
  },
  "Segmented choice": {
    role: '<fieldset role="radiogroup"> containing native <input type="radio"> controls',
    aria: [
      "Name the radiogroup with aria-label or aria-labelledby.",
      "Setting disabled disables all radio options in the fieldset.",
    ],
    keyboard: ["ArrowLeft/ArrowUp and ArrowRight/ArrowDown move and select options natively."],
    focus: "Tab enters the selected radio item; native focus ring on the active segment.",
  },
  "Search field": {
    role: '<label> wrapping <input type="search"> plus optional Clear IconButton',
    aria: [
      "Pass label for the input's aria-label.",
      'Clear button (when clearable) carries aria-label="Clear text".',
    ],
    keyboard: [
      "Escape or activating Clear empties the search input when installSearchClear() is wired.",
    ],
    focus: "Standard search input focus; clearing returns focus appropriately via script.",
  },
  Select: {
    role: "Native <select>",
    aria: [
      "Associate with label prop, aria-label, aria-labelledby or <label for>.",
      "On phone screens selectSheet.ts opens a modal Sheet listbox alternative.",
    ],
    keyboard: ["Space, Enter or Alt+ArrowDown opens the picker; Arrow keys navigate options."],
    focus: "Native select focus ring; modal picker restores focus to trigger on close.",
  },
  Menu: {
    role: 'Native popover <div popover="auto"> containing <div role="menu" aria-label={title}> and MenuItem buttons',
    aria: [
      'Trigger button opens the menu with popoverTarget={id}; title sets aria-label={title} on role="menu" and <h2 id={id}-title>.',
      'Close IconButton sets aria-label="Close" with data-menu-close.',
    ],
    keyboard: [
      "Browser popover supports Escape and light dismiss. The package ships no menu script: the host page handles ArrowUp/ArrowDown between items (MENU_SELECTORS from ./menu finds them).",
    ],
    focus:
      "The host page moves focus to the first item on open; the browser returns focus to the popoverTarget trigger on close, and the header Close button closes it.",
  },
  Banner: {
    role: '<div role="alert"> for tone="danger", otherwise <div role="status">',
    aria: [
      'Leading Icon is aria-hidden="true".',
      "Pass bodyId so related controls can link with aria-describedby.",
    ],
    keyboard: ["Enter follows the optional action link."],
    focus: "Static notice region; the optional action link is keyboard focusable.",
  },
  Toast: {
    role: 'Live region role="status" (or role="alert" for danger messages)',
    aria: [
      "Mounted once per page; suppresses text for one render during role switches so stale text is not announced.",
      'Dismiss button uses aria-label="Dismiss".',
    ],
    keyboard: ["Tab reaches action and Dismiss buttons when visible; Enter/Space activates."],
    focus: "Does not steal focus from the active control when appearing.",
  },
  Dialog: {
    role: "Native modal <dialog data-dialog>",
    aria: [
      "Pair with DialogTitle and pass aria-labelledby matching DialogTitle's id.",
      "Renders closed by default; open with dialog.showModal().",
    ],
    keyboard: ['Escape closes the modal natively; Enter submits form method="dialog" buttons.'],
    focus: "Browser traps focus inside open modal <dialog> and restores focus to opener on close.",
  },
  Sheet: {
    role: "Native modal <dialog data-sheet aria-labelledby={titleId}>",
    aria: [
      "titleId links <dialog> aria-labelledby to the SheetHeader h2 heading.",
      "Rendered closed on server; open with dialog.showModal().",
    ],
    keyboard: ["Escape closes the sheet natively; Tab cycles within modal contents."],
    focus: "Browser traps focus inside open <dialog> and restores focus to opener on close.",
  },
  Drawer: {
    role: "Host Base UI drawer/dialog island contract (not exported as a React component yet)",
    aria: [
      "Host island provides dialog role, aria-labelledby on SheetHeader titleId and aria-label on the Close IconButton.",
    ],
    keyboard: ["Escape dismisses the drawer and closes the modal viewport."],
    focus: "Base UI primitive traps focus while open and returns focus to trigger on close.",
  },
  Wheel: {
    role: "Touch picker list inside a modal Sheet opened by Select[data-wheel]",
    aria: ["Sheet heading names the picker; active row updates the underlying native <select>."],
    keyboard: [
      "Sheet Close and Escape dismiss picker; desktop keeps native <select> keyboard nav.",
    ],
    focus: "Modal sheet manages focus while open and restores focus on confirm or cancel.",
  },
  Ripple: {
    role: 'Decorative ripple layer (<span aria-hidden="true">)',
    aria: [
      'Always aria-hidden="true"; host <button> or <a href> provides accessible role and name.',
    ],
    keyboard: ["None; host interactive element handles keyboard activation."],
    focus: "Not focusable; host element owns focus ring.",
  },
  Glow: {
    role: 'Decorative glow layer (<span aria-hidden="true">)',
    aria: [
      'Injected transiently with aria-hidden="true" when favorite toggles on; honors prefers-reduced-motion.',
    ],
    keyboard: ["None; host toggle button retains aria-pressed and keyboard handling."],
    focus: "Not focusable.",
  },
  Dial: {
    role: 'List <ul role="list"> of DialTile items, each a native <button> or <a href>',
    aria: [
      'Each DialTile\'s label prop names its action ("Play Hard Fork"); the visible name, pin and count are aria-hidden so it reads once.',
      'The tile playing now carries aria-current="true" on its press area; the page\'s player sets it with data-playing on the tile and clears both from the last.',
    ],
    keyboard: [
      "Tab moves across tiles; Enter or Space plays a button tile, Enter opens a link tile.",
    ],
    focus:
      "Each tile shows the native :focus-visible ring; a focused tile in a sideways row scrolls into view.",
  },
  "Page dots": {
    role: 'Decorative dots <span aria-hidden="true">; PageArrows are native <button>s',
    aria: [
      "The dots are hidden from screen readers: the row's own items carry the content.",
      "PageArrows take prevLabel and nextLabel as aria-label and aria-controls the row's id; an arrow at the row's end is disabled.",
      "PageArrows do nothing until the page calls installPageArrows() from @singularityfm/design-system/pageDots once the row is in the page.",
    ],
    keyboard: [
      "PageArrows: Enter and Space move the row a screen. A swipe or Tab through the row does the same where they are hidden.",
    ],
    focus: "PageArrows show the native :focus-visible ring; disabled arrows leave the tab order.",
  },
  "Resume card": {
    role: "<article> with Play and Dismiss native <button>s",
    aria: [
      "playLabel and dismissLabel name the two IconButtons; the progress bar is aria-hidden and facts says the time left in words.",
    ],
    keyboard: ["Tab reaches Dismiss then Play; Enter or Space activates each."],
    focus: "IconButtons show the native :focus-visible ring.",
  },
  Band: {
    role: "<section> with an <h2> heading",
    aria: ["The heading names the section; the Singularity mark before it is decorative."],
    keyboard: ["None of its own; the action and the items inside take focus in DOM order."],
    focus: "Not focusable; children manage focus.",
  },
  "Topic tile": {
    role: 'List <ul role="list"> of tiles, each a native <a href> or a visually hidden <input type="checkbox">',
    aria: [
      'The visible topic name is the accessible name; covers are decorative (alt="").',
      "A checkbox tile's checked state is native; the check glyph is aria-hidden.",
    ],
    keyboard: ["Tab moves across tiles; Enter opens a link tile, Space toggles a checkbox tile."],
    focus: "The tile wears the foundations' focus ring for its hidden input or its link.",
  },
} satisfies Record<string, A11yGuidance>;

/** Accessibility contract for hand-authored composite/interactive parts in parts.ts. */
export const PART_A11Y: Record<string, A11yGuidance> = {
  "row-action": {
    role: 'Native <a href> link row or <button type="button"> action row inside a list or card group',
    aria: [
      "Keep the accessible label in visible row text (.settings-label / .settings-hint); do not nest interactive controls inside the row link or button.",
      'Trailing chevron Icon carries aria-hidden="true" so the row text announces cleanly.',
    ],
    keyboard: ["Enter activates a link row; Enter and Space activate a button row."],
    focus: "Minimum 44px target with native :focus-visible ring inside the card tile.",
  },
};

/** Accessibility contract for every exported React component (all 34 .tsx exports in package.json). */
export const COMPONENT_A11Y: Record<string, A11yGuidance> = {
  Avatar: REGISTRY_A11Y.Avatar,
  Badge: REGISTRY_A11Y.Badge,
  Banner: REGISTRY_A11Y.Banner,
  Band: REGISTRY_A11Y.Band,
  Dial: REGISTRY_A11Y.Dial,
  DialTile: REGISTRY_A11Y.Dial,
  PageArrows: REGISTRY_A11Y["Page dots"],
  PageDots: REGISTRY_A11Y["Page dots"],
  ResumeCard: REGISTRY_A11Y["Resume card"],
  TopicGrid: REGISTRY_A11Y["Topic tile"],
  TopicTile: REGISTRY_A11Y["Topic tile"],
  BrandMark: {
    role: 'Decorative <svg aria-hidden="true" focusable="false">',
    aria: ["Hidden from screen readers; adjacent wordmark text or link provides the name."],
    keyboard: ["None; decorative SVG mark."],
    focus: "Not focusable.",
  },
  Button: REGISTRY_A11Y.Button,
  ChapterAside: {
    role: 'Navigation landmark <nav aria-labelledby="aside-title"> with <h2> and <ul role="list">',
    aria: [
      'Marks active section anchor with aria-current="true".',
      "Heading #aside-title labels the landmark.",
    ],
    keyboard: ["Tab navigates section links; Enter jumps to the section anchor."],
    focus: "Native anchor focus ring.",
  },
  Chip: REGISTRY_A11Y.Chip,
  ChipGroup: {
    role: "Native <fieldset>",
    aria: [
      "Name the group with aria-label or aria-labelledby.",
      "Setting disabled disables every Chip inside the group.",
    ],
    keyboard: ["Tab moves between child checkboxes; Space toggles each Chip."],
    focus: "Delegates focus to child Chip inputs.",
  },
  Code: REGISTRY_A11Y.Code,
  Dialog: REGISTRY_A11Y.Dialog,
  DialogActions: {
    role: "Layout container <div> for Dialog action buttons",
    aria: ["Place Button answers inside; avoid disabling Cancel/dismiss path."],
    keyboard: ["Tab moves across action buttons in DOM order; Enter/Space activates."],
    focus: "Child Buttons manage native focus.",
  },
  DialogTitle: {
    role: "Heading <h2 id={...}>",
    aria: ["id must match the parent Dialog's aria-labelledby attribute."],
    keyboard: ["None; static heading."],
    focus: "Not focusable.",
  },
  Fab: REGISTRY_A11Y.FAB,
  Field: REGISTRY_A11Y.Field,
  Flag: REGISTRY_A11Y.Flag,
  Icon: REGISTRY_A11Y.Icon,
  IconButton: REGISTRY_A11Y["Icon button"],
  Link: REGISTRY_A11Y.Link,
  Menu: REGISTRY_A11Y.Menu,
  MenuItem: {
    role: 'Native <button type="button" role="menuitem">',
    aria: ['Must sit inside a role="menu" container; children provide item label.'],
    keyboard: [
      "Enter/Space activates a menu item; ArrowUp/ArrowDown come from the host page's menu script (the package ships none).",
    ],
    focus: "Receives focus during menu keyboard navigation.",
  },
  PlayChip: REGISTRY_A11Y["Play chip"],
  PlayingBars: {
    role: 'Decorative animated bars (<span aria-hidden="true">)',
    aria: [
      'Always aria-hidden="true"; the enclosing button or control must supply aria-label or visible text.',
    ],
    keyboard: ["None; decorative animated state indicator (static under prefers-reduced-motion)."],
    focus: "Not focusable.",
  },
  Ripple: REGISTRY_A11Y.Ripple,
  RowExit: REGISTRY_A11Y["Row exit"],
  SearchField: REGISTRY_A11Y["Search field"],
  SectionTabs: {
    role: 'Navigation landmark <nav aria-label="Sections">',
    aria: ['Renders only for 2 or more sections; active link carries aria-current="true".'],
    keyboard: ["Tab navigates section links; Enter jumps to the section anchor."],
    focus: "Native anchor focus ring.",
  },
  SegmentedChoice: REGISTRY_A11Y["Segmented choice"],
  SegmentedNav: REGISTRY_A11Y["Segmented navigation"],
  Select: REGISTRY_A11Y.Select,
  Sheet: REGISTRY_A11Y.Sheet,
  SheetHeader: {
    role: "Header container with <h2 id={titleId}> and Close IconButton",
    aria: [
      "titleId must match the parent Sheet dialog's aria-labelledby.",
      'Close IconButton sets aria-label="Close" and the configured close data attribute.',
    ],
    keyboard: ["Tab reaches optional back button and Close button; Enter/Space closes sheet."],
    focus: "Close button receives keyboard focus inside Sheet.",
  },
  Slider: REGISTRY_A11Y.Slider,
  Switch: REGISTRY_A11Y.Switch,
  Toast: REGISTRY_A11Y.Toast,
};

/** Minimal standalone React TSX usage example for every exported React component (all 34 .tsx exports). */
export const COMPONENT_EXAMPLES: Record<string, string> = {
  Avatar: '<Avatar shape="cookie" size="md" label="Open profile" />',
  Badge: "<Badge>Admin</Badge>",
  Banner: '<Banner tone="danger" icon="alert" title="Download failed" />',
  BrandMark: "<BrandMark />",
  Band: '<Band title="Catchups">\n  <ul role="list">...</ul>\n</Band>',
  Dial: '<Dial>\n  <DialTile name="Hard Fork" label="Play Hard Fork" count={2}><img src="cover.webp" alt="" /></DialTile>\n</Dial>',
  DialTile:
    '<DialTile name="Hard Fork" label="Play Hard Fork" playing><img src="cover.webp" alt="" /></DialTile>',
  PageArrows: '<PageArrows controls="topics" prevLabel="Earlier topics" nextLabel="More topics" />',
  PageDots: "<PageDots count={3} current={0} />",
  ResumeCard:
    '<ResumeCard title="The Jensen Huang Affair" facts="Hard Fork, 12 min left" progress={0.6} playLabel="Play" dismissLabel="Remove from Continue listening"><img src="cover.webp" alt="" /></ResumeCard>',
  TopicGrid:
    '<TopicGrid>\n  <TopicTile name="Technology" href="/topic/technology" covers={["one.webp"]} />\n</TopicGrid>',
  TopicTile:
    '<TopicTile name="Science" href="/topic/science" covers={["one.webp", "two.webp", "three.webp"]} />',
  Button: '<Button variant="filled" type="submit">Save</Button>',
  ChapterAside:
    '<ChapterAside sections={[{ slug: "intro", title: "Overview" }, { slug: "notes", title: "Notes" }]} />',
  Chip: '<Chip name="topic" value="daily" defaultChecked>Daily</Chip>',
  ChipGroup:
    '<ChipGroup aria-label="Topics">\n  <Chip name="topic" value="daily" defaultChecked>Daily</Chip>\n</ChipGroup>',
  Code: '<Code label="Prompt" text="pnpm run gate" />',
  Dialog:
    '<Dialog id="confirm" aria-labelledby="confirm-title">\n  <DialogTitle id="confirm-title">Delete source?</DialogTitle>\n  <form method="dialog">\n    <DialogActions>\n      <Button variant="text" type="submit" value="cancel">Cancel</Button>\n      <Button variant="text" tone="danger" type="submit" value="delete">Delete</Button>\n    </DialogActions>\n  </form>\n</Dialog>',
  DialogActions:
    '<DialogActions>\n  <Button variant="text">Cancel</Button>\n  <Button variant="filled">Save</Button>\n</DialogActions>',
  DialogTitle: '<DialogTitle id="confirm-title">Delete source?</DialogTitle>',
  Fab: '<Fab icon="plus" label="Add source">Add</Fab>',
  Field:
    '<label htmlFor="title">Title</label>\n<Field id="title" name="title" placeholder="Enter title" />',
  Flag: '<Flag region="SE" />',
  Icon: '<Icon name="plus" size="lg" />',
  IconButton: '<IconButton label="Close"><Icon name="close" size="lg" /></IconButton>',
  Link: '<Link href="/settings">Settings</Link>',
  Menu: '<Menu id="row-menu" title="Row actions">\n  <MenuItem><Icon name="share" /> Share</MenuItem>\n</Menu>',
  MenuItem:
    '<Menu id="row-menu" title="Row actions">\n  <MenuItem><Icon name="share" /> Share</MenuItem>\n</Menu>',
  PlayChip: '<PlayChip label="5 min" aria-label="Play the briefing" data-play-item={0} />',
  PlayingBars: '<button type="button" aria-label="Playing">\n  <PlayingBars />\n</button>',
  Ripple: '<a href="/library" data-ripple><Ripple />Library</a>',
  RowExit: '<ul>\n  <RowExit data-item="1">Row content</RowExit>\n</ul>',
  SearchField:
    '<SearchField label="Search your library" name="q" placeholder="Search your library" />',
  SectionTabs:
    '<SectionTabs sections={[{ slug: "top", title: "Top" }, { slug: "tech", title: "Tech" }]} />',
  SegmentedChoice:
    '<SegmentedChoice name="length" aria-label="Length" defaultValue="3" options={[{ value: "3", label: "3 min" }, { value: "5", label: "5 min" }]} />',
  SegmentedNav:
    '<SegmentedNav aria-label="View" tabs={[{ value: "stories", label: "Stories" }, { value: "transcript", label: "Transcript" }]} />',
  Select: '<Select label="Sort" name="sort">\n  <option value="newest">Newest</option>\n</Select>',
  Sheet:
    '<Sheet id="edit-sheet" title="Edit topic" titleId="edit-sheet-title" close="data-panel-close">\n  <form>...</form>\n</Sheet>',
  SheetHeader:
    '<SheetHeader title="Edit topic" titleId="edit-sheet-title" close="data-panel-close" />',
  Slider: '<Slider aria-label="Speed" min={0.5} max={2} step={0.1} defaultValue={1} />',
  Switch: '<Switch id="autoplay" name="autoplay" aria-label="Autoplay" defaultChecked />',
  Toast: "<Toast />",
};
