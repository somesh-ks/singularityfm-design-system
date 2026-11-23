/**
 * The Resume card: one episode a person is part way through, on Home's Continue listening shelf:
 * cover, title, progress, time left, and Play and Dismiss beside them. The one place its classes are
 * written. ResumeCard.tsx renders from it; the style guide lists RESUME_CARD. The rules are in
 * styles/resume-card.css.
 */
import type { Guidance } from "./guidance.ts";

export const RESUME_CARD: Guidance = {
  summary:
    "A wide card for an episode part way heard: cover, title, progress, time left, Play, Dismiss.",
  useWhen: [
    "Pick up an episode where it stopped, without opening its page.",
    "A shelf of them, last played first, each dismissable.",
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
  "resume-card-art",
  "resume-card-text",
  "resume-card-title",
  "resume-card-bar",
  "resume-card-facts",
  "resume-card-acts",
];

/** Classes the card replaced; none may be written again, in any app that draws the system. */
export const RESUME_CARD_RETIRED: string[] = [];
