import { range, smoothstep } from "@/lib/math";
import { local } from "@/lib/timeline";
import { MAP_ZOOM_MAX } from "../constants";

export const STAGES = ["pune", "maharashtra", "india", "world"] as const;
export type Stage = (typeof STAGES)[number];

/** Log-space zoom progress 0 (Pune) → 1 (world) through the pull-back. */
export function zoomProgress(p: number) {
  return smoothstep(range(0.04, 0.96, local(p, "pullback")));
}

/** Map scale: MAP_ZOOM_MAX at city level, 1 when the world fits the spread. */
export function mapZoom(p: number) {
  return Math.exp(Math.log(MAP_ZOOM_MAX) * (1 - zoomProgress(p)));
}

export function stageAt(p: number): Stage {
  const s = mapZoom(p);
  if (s > 150) return "pune";
  if (s > 14) return "maharashtra";
  if (s > 2.5) return "india";
  return "world";
}

/** How present the world map is on the page (0 hidden → 1 fully raised). */
export function mapPresence(p: number) {
  const rise = range(0.06, 0.55, local(p, "pullback"));
  const fold = 1 - range(0.0, 0.18, local(p, "courses"));
  const first = Math.min(rise, fold);
  // The Journey: the world rises once more, wraps into a globe, and settles back.
  const j = local(p, "journey");
  const second = Math.min(range(0.56, 0.62, j), 1 - range(0.8, 0.86, j));
  return Math.max(first, second);
}

/** 0 = flat relief on the page, 1 = a globe floating over the book (Journey · Arrive). */
export function globeMorph(p: number) {
  const j = local(p, "journey");
  return smoothstep(Math.min(range(0.6, 0.7, j), 1 - range(0.76, 0.84, j)));
}

/** Longitude the globe turns to face the camera. */
export function globeSpin(p: number) {
  const j = local(p, "journey");
  // Starts over India and turns west across the oceans as you scroll.
  return 78 - 110 * range(0.62, 0.84, j);
}

export const RELIEF_HEIGHT = 0.011;
