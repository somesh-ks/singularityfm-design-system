/**
 * The Band: a tinted block with the Singularity mark in its heading, which sets the app's own
 * podcasts (Catchups: Daily, Weekly and Catch up) apart from public shows on Home and in search
 * results. The one place its classes are written. Band.tsx renders from it; the style guide lists
 * BAND. The rules are in styles/band.css.
 */
import type { Guidance } from "./guidance.ts";

export const BAND: Guidance = {
  summary: "A tinted block with the Singularity mark in its heading, for the app's own podcasts.",
  useWhen: [
    "The app's own podcasts among public shows: the Catchups shelf on Home, Catchups in search results.",
  ],
  dontUseWhen: [
    { when: "Any other group of things; a plain heading and the page's surface hold those." },
    { when: "A state that is good, worth a look or wrong.", instead: "Banner" },
  ],
};

/** Every class the band draws, for the registry and its test. */
export const BAND_CLASSES: string[] = ["band-section", "band-head", "band-title"];

/** Classes the band replaced; none may be written again, in any app that draws the system. */
export const BAND_RETIRED: string[] = [];
