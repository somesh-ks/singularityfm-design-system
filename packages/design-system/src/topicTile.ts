/**
 * The Topic tile: a labelled tile with two covers from the topic tucked into its corner. It opens a
 * topic page, or, at first run, is ticked to choose the topic. The one place its classes are written.
 * TopicTile.tsx and TopicGrid.tsx render from it; the style guide lists TOPIC_TILE. The rules are in
 * styles/topic-tile.css.
 */
import type { Guidance } from "./guidance.ts";

export const TOPIC_TILE: Guidance = {
  summary:
    "A labelled tile with two covers in its corner that opens a topic, or is ticked at first run.",
  useWhen: [
    "Browse topics: a grid of them on Home and Search, two across on a phone, four on a wide column.",
    "Choose topics at first run, where each tile is a checkbox.",
  ],
  dontUseWhen: [
    { when: "Filter a list already on screen by a kind.", instead: "Chip" },
    { when: "A show, which plays on a press.", instead: "Dial" },
  ],
};

/** Every class the tile and its grid draw, for the registry and its test. */
export const TOPIC_TILE_CLASSES: string[] = [
  "topic-grid",
  "topic-grid-wide",
  "topic-tile-hit",
  "topic-tile-name",
  "topic-tile-check",
  "topic-cell",
];

/** Classes the tile replaced; none may be written again, in any app that draws the system. */
export const TOPIC_TILE_RETIRED: string[] = [];

/** The grid's classes; `wide` sets four across, for a wide column. */
export const topicGridClass = (wide = false): string =>
  wide ? "topic-grid topic-grid-wide" : "topic-grid";
