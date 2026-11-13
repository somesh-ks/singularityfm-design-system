# The owner's taste, for every screen

What the owner wants from any screen drawn with this library, and the rules a phone adds. Moved here from the app's [ledger core](https://github.com/somesh-ks/singularityfm-app/blob/main/docs/design-engineering-ledger.md) (sections 1 and 11, numbers kept) so an agent in any app that installs the package can read it; the core keeps how to work with the owner and the reversals. A decision number (Dn) is the app's record, in [its decisions](https://github.com/somesh-ks/singularityfm-app/tree/main/docs/decisions); DS-n is this repository's. The short form an agent reads first ships in the package: [foundations.md](../../packages/design-system/tokens/foundations.md).

## 1. What the owner wants, in one page

Patterns from about 150 asks, strongest first.

1. **A real app, not a generated page.** The owner called boxed outlines "ai slop" twice (D72, D76) and keeps naming references to copy rather than invent:
   - Google Podcasts and YouTube Music for the whole app (D31).
   - Material 3 tonal surfaces (D72).
   - Anthropic's model list for every dropdown (D51).
   - Speechify for the transcript (D50).
   - Android's rule for the floating button (D52).
   - Native app behaviour for the bottom stack (#120).
   - The first brief set the bar: "a beautiful audio player experience that is snappy, feels like native player, and has beautiful cover art" (2026-10-05).

   Read a new ask as "how does the reference product do this", not "what would look nice". Names follow the reference too: "A real podcast app never has a menu called archive" (2026-10-07), so Archive became Library.
2. **Nothing moves that the owner did not move.** Several asks are the same complaint:
   - Scrub times that shake (2026-10-11).
   - A chip that grows as its check appears (D95, #116).
   - A panel that shakes when More options opens (D102).
   - A page that scrolls itself at each turn (D94).
   - The bottom stack drifting apart (#120).
   
   The code answers with fixed-width chips, hidden sizer copies, `scrollbar-gutter: stable` and checks that take no room. Treat any layout shift as a bug.
3. **Live and quiet.** No waiting copy, no chatter about saving:
   - "Live curated" removed (D75).
   - The age banner removed (2026-10-11).
   - The "Next episode" line removed (D102).
   - The Saving and Saved toast removed, "I want it to feel live and natural" (D115).
   - Labels not bold, "captures too much attention" (#125).
   
   The interface says something only when the owner can act.
4. **Speed is a design property.** Navigation in 32 ms (D47), the early Play tap kept (D82), modulepreload and idle loading (D112). "Delays in time to play" is a design complaint here, not an engineering one.
5. **Affordance, not explanation.** The interface shows what a control does by how it looks and answers, never by a sentence telling the owner what to do.
   - The rule from 2026-10-08: "no instruction text that the control makes obvious", from "These minor usability aspects are the differentiating factors" (`history/2026-10-08-session-learnings.md`).
   - D89 records "a control that explains itself is the thing the owner called slop". It rejected a disabled row with a note; D91 rejected a Format row with a note.
   - Fixes that follow the rule:
     - An unlabelled plus "says nothing about what it makes", so the floating button carries its words (D52).
     - The model field reads as a select: a hand cursor, a caret on focus, and a press opens the whole list (D51).
     - A glyph always says what a press does: refresh for Try again, replay for Play again (D92).
     - A card's title takes the accent under a mouse, because the title opens the page and the art plays (D101).
     - The whole bar opens the player, so it needs no chevron (D102).
     - A control that cannot act stays on its row, dimmed and named, never hidden (D100).
     - A decoration must not look pressable: empty scenes stopped drawing a filled disc in the button's colour (D98).
     - A name is plain text and the row opens the editor: one element, one job (D83).
   - States are shown, not narrated:
     - Hover and press are state layers (D72).
     - The chosen item takes the accent container (D72).
     - The saved control is the confirmation (D115).
     - A source row says "Adding", then "Added", in place (D91).
6. **Minimal, with high brevity.** Fewer controls, fewer words, one way to say each thing.
   - Settings: one job per page (D51).
   - A shorter New episode form (D76, D114), and modes retired: "Remove, always Somesh" (D114).
   - Plain labels: Format, Custom, AI model, Last updated (D83, D102). A model named by its name, never by id (D101). The model is one select on Settings, not a page (D123).
   - One noun for one thing: the third critic round found "five spellings of one noun" (D89). "Story" everywhere in the player (D90).
   - A failure is told once, in one place (D94). A status line is three or four words: "Episode queued", "Writing your episode" (D84).
   - No hedging helper text, and a plainer About (#68, 2026-10-10).
   - Content is brief too: headlines up to 12 words, summaries of 25 to 80 words (D12, D34). The digest has no emoji, no intro paragraph, no dividers and no sign-off (`plan/vision.md`).
   - One filled action per screen: the hero's Play (D77), an empty state's single button (D96), New episode in its own tone so it never competes with Play (D86), the open player's Play disc (`player.css:1548`).
   - Colour is information, not decoration. The bar's play "doesnt need a blue background... catches unnecessary attention", and the bar lost its hover tint (2026-10-08). Delete is red only inside its confirm dialog (`episode-actions.css` `.confirm-delete`).
   - One of each. "Two playback timelines... remove the duplicate" (2026-10-08): one timeline, owned by the bar, with chapter ticks. One transport on screen (D92). Siblings share one size: "Make them all equal sizes" (2026-10-12).
   - Content is the owner's voice: "high brevity, thoughtful, and concise" (2026-10-05). Decorative furniture goes: "Thought of the Day" was cut (D8). Daily is short, weekly is deep.
7. **Every control is complete.** It gets a 44px target (test in `e2e/layout.spec.ts`), a sound (D101), a press state that never shrinks words (D72, `styles.test.ts`) and a focus ring that survives forced colours.
8. **Bans.**
   - From the persona: cream backgrounds, italic accent words, "01/02/03" labels, monospace eyebrows, all-caps labels, gradient washes, grey shadows, terracotta.
   - From the record: a chevron on the bar (D102), a grabber on phone sheets (D106), a drag handle on the player (D111), a Dry tone (D101), the General audience (D114), em dashes (`houseRules.test.ts`).
   - From the chats: a meta line above a headline, locked or disabled topic choices, a combobox for the model, a vendor prefix or model id in any label, "Create" as a navigation tab.
9. **Hierarchy by size and space, never by crowding.** "I hate these smaller texts... very close to other bigger texts... never want such bad typographic decisions" (2026-10-07). A secondary line goes below its title with a full spacing step, never above it (D31). "Breathable" means a full step between a control group and the content it controls (2026-10-12). Every page title uses the detail-page size, and chips and tabs get side padding for balance (2026-10-12).
10. **Taste-neutral choices are delegated.** "You choose a good one" and "you decide voice limits" (2026-10-05). Decide, state the assumption in one line, and move on. Ask only when the choice changes what the owner sees or pays.
11. **Polish is iterative.** "It's a good improvement, but I still anticipate a lot of fine tuning" (2026-10-12). Plan for rounds of screenshot review, not one pass.

Repeat asks are the clearest signal of what was not heard the first time:
- Stories and Transcript tabs: "I've told you multiple times, but you still decide to skip it" (2026-10-12, D101).
- The time zone, removed in D89 and asked back in D100.
- Format and the second voice, removed in D91 and asked back in D100.
- About, "completely removed from before", restored with the version (2026-10-12). Never delete content in a redesign unasked.
- Handle and square top corners, asked again on 2026-10-14 because the first pass covered form sheets only (D111).

## 11. Phone patterns

Read before any UI that a phone shows (the default: every browser test runs on the phone first). Each is a rule the owner set or confirmed; the date or decision is where it came from.

1. **Lists open as bottom sheets, never as popovers** (D167). Under 40rem a select's drawn list, the searchable picker, the multi-select and the More menu are sheets: the raised surface, the sheet radius on the top corners only, a scrim, a slide up in 300 ms and down in 220 (`--duration-sheet-*`, `--ease-drawer`), at most 70dvh tall, padding that clears the safe area at the bottom. A tap outside closes; where the sheet has a head, a pull closes it (`heroMenu.ts`). A popover's backdrop lets a tap through to the page, so a scrim never hides a control a reader could press by accident on the way out.
2. **Marks trail, identity leads.** A check, a chevron or a checkbox sits at the end of a row; an emoji, a favicon or a letter tile leads it (2026-10-23, the Listen in sheet). In a sheet the words come first and the check last, as a phone's own lists do.
3. **One control, one shape** (D167). Chips, select chips, select values, segmented controls and the search field are pills on every page and in every card, and so are form text fields and a card's buttons (D186; a multi-line field 24px); a card's row tiles are concentric with the card. Words and bare glyphs align by their ink, filled and outlined controls by their edge; a row-end glyph pulls out by its measured `--ink-end` (D187). A control that looks different in one place is a bug, not a variant.
4. **Edges line up with the search field.** A row that shares a column with the search field sits its emoji and its chevron 16px in, the field's own padding, so they line up with the field's glyph and its clear button (2026-10-23).
5. **No tap flash, every control shows its own press.** `foundations.css` clears the highlight on buttons, links that act, labels, selects and inputs; the press is a state layer (8% hover, 12% press) on the control's own fill. A flash on one control and not its neighbour is the first thing the owner sees. On touch a control already chosen keeps its own fill under the tap, since the browser holds the press past the click (D352).
6. **Targets.** 44px for every control, 48 for a field, 56 for a one-line row, 64 to 72 for two lines; a 36px chip gets its target from an `::after`. A sticky bar never covers a target at rest (`a11y.spec.ts`, axe).
7. **The thumb's reach.** Every row's actions live in a dots menu at its end (a bottom sheet on a phone), never in a row of icon buttons. The one primary action floats bottom-end and folds to its glyph while reading; the navigation is a bottom bar; a toast sits above the bar and the docked player; sheets rise from the bottom; the app bar carries only Back and the wordmark. Nothing a reader needs often sits at the top.
8. **Swipe and pull.** A toast swipes away sideways (a dismissal, never an Undo: `Toaster.tsx`); a queue row swipes left to leave and moves by a long press (the browser's drag and drop, the one way a long press lifts a row while the list still scrolls); a menu sheet pulls closed; the player pulls down. A short gesture springs back to the same box, and a browser test compares the box to itself, never to a number.
9. **Nothing moves under a finger.** A field grows on focus only with a fine pointer; the picker does not focus its search on a coarse pointer, so the keyboard never covers the list; inputs are 16px so iOS never zooms; fixed elements are held by their bottom edge, so the address bar moves them in one frame.
10. **Widths.** Under 40rem is a phone (sheets, one column, the bottom bar); under 64rem there is no side column (the floating action, the sticky search). Test at 390 by 844 (Pixel 7) and 1280 by 800, light and dark, and screenshot every open state before a PR.

