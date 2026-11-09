/**
 * When a finger's sideways swipe takes a toast or a row away (D168, D169): one rule for the Toast and
 * the app's queue and downloads rows, so the two never drift. It came from the app's lib/swipeAway.ts
 * and player/core/gestureMath.ts unchanged.
 */

/**
 * Travel inside this box is a tap, however fast it was. Fingers drift and thumbs drift more: an
 * 8 px slop swallowed real taps as cancelled swipes.
 */
export const TAP_SLOP_PX = 12;

/** Past this share of the width, or this fast over the last 100 ms, and never short of twice the slop. */
export const SWIPE_SHARE = 0.35;
export const SWIPE_SPEED = 0.6;
export const SWIPE_MIN_PX = TAP_SLOP_PX * 2;

export function swipeLeaves(dx: number, width: number, velocityPxPerMs: number): boolean {
  const away = Math.abs(dx);
  if (away < SWIPE_MIN_PX) return false;
  return away > width * SWIPE_SHARE || Math.abs(velocityPxPerMs) > SWIPE_SPEED;
}

/**
 * How far a finger goes before the press has a direction: under Chrome's own touch slop (8 px on
 * Android), so the page has not begun to scroll when it is decided.
 */
export const AXIS_PX = 6;
/** How much the sideways part may trail the upright one and still be a swipe (tan 37 degrees). */
export const SIDEWAYS_RATIO = 0.75;

export interface Sample {
  /** Position along the gesture axis, in CSS pixels. */
  value: number;
  /** Event timestamp in milliseconds. */
  t: number;
}

/** Samples older than this stop describing what the finger is doing now. */
const VELOCITY_WINDOW_MS = 100;
const MAX_SAMPLES = 6;

/**
 * A short ring of recent positions. Release velocity comes from the last 100 ms only: averaging a
 * whole drag would report the slow start of a flick, and the thing would spring back instead of
 * leaving.
 */
export function createVelocityTracker(windowMs = VELOCITY_WINDOW_MS) {
  const samples: Sample[] = [];
  return {
    reset(first?: Sample): void {
      samples.length = 0;
      if (first) samples.push(first);
    },
    push(value: number, t: number): void {
      samples.push({ value, t });
      if (samples.length > MAX_SAMPLES) samples.shift();
    },
    /** Pixels per millisecond along the axis; positive is toward larger values. */
    velocity(): number {
      return estimateVelocity(samples, windowMs);
    },
  };
}

export function estimateVelocity(
  samples: readonly Sample[],
  windowMs = VELOCITY_WINDOW_MS,
): number {
  const last = samples.at(-1);
  if (!last) return 0;
  const first = samples.find((sample) => last.t - sample.t < windowMs) ?? samples[0];
  if (!first || last.t === first.t) return 0;
  return (last.value - first.value) / (last.t - first.t);
}
