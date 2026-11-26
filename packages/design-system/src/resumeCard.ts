/**
 * The Resume card: one episode a person is part way through, on Home's Continue listening shelf:
 * cover, title, progress and time left in one press area that resumes. The one place its classes are
 * written. ResumeCard.tsx renders from it; the style guide lists RESUME_CARD. The rules are in
 * styles/resume-card.css.
 */
import type { Guidance } from "./guidance.ts";

export const RESUME_CARD: Guidance = {
  summary:
    "A wide card for an episode part way heard: the whole card resumes it; no other control.",
  useWhen: [
    "Pick up an episode where it stopped, without opening its page.",
    "A shelf of them, last played first; a finished episode leaves it.",
  ],
  dontUseWhen: [
    {
      when: "An episode not yet started: its card shows the cover and facts, and a press opens it.",
    },
    { when: "The episode playing now, on any page.", instead: "Play chip" },
  ],
};

/** Every class the card draws, for the registry and its test. */
export const RESUME_CARD_CLASSES: string[] = [
  "resume-card-panel",
  "resume-card-hit",
  "resume-card-dismiss",
  "resume-card-art",
  "resume-card-glyph",
  "resume-card-text",
  "resume-card-title",
  "resume-card-bar",
  "resume-card-facts",
  "resume-card-show",
  "resume-card-left",
  // Deprecated: ResumeCard no longer draws it (the card is one press area, Dismiss at its corner). 1.0.0 removes it.
  "resume-card-acts",
];

/**
 * What a page's script finds a card's parts by, never by typing the classes: a card a device fills
 * (an episode part way heard) is cloned from a template, then titled and its progress set.
 */
export const RESUME_CARD_SELECTORS = {
  card: ".resume-card-panel",
  hit: ".resume-card-hit",
  title: ".resume-card-title",
  show: ".resume-card-show",
  left: ".resume-card-left",
  bar: ".resume-card-bar",
} as const;

/** Classes the card replaced; none may be written again, in any app that draws the system. */
export const RESUME_CARD_RETIRED: string[] = [];
