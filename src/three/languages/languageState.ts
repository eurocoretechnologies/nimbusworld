import { range, window4 } from "@/lib/math";
import { local } from "@/lib/timeline";
import type { LineArtState } from "../lineart/lineArtState";

/** Pure language-chapter state (no three.js), shared by the scene and DOM. */
const COUNT = 3;
const START = 0.14;
const SPAN = (1 - START) / COUNT;

/** Local 0..1 within language i's third of the chapter. */
export function languagePhase(p: number, i: number) {
  const l = local(p, "languages");
  return range(START + i * SPAN, START + (i + 1) * SPAN, l);
}

/** Which language the chapter is on (0..2), for the DOM. */
export function activeLanguage(p: number) {
  const l = local(p, "languages");
  return Math.min(COUNT - 1, Math.max(0, Math.floor((l - START) / SPAN)));
}

export function glyphOpacity(p: number, i: number) {
  return window4(languagePhase(p, i), 0.0, 0.14, 0.3, 0.5);
}

export function lineState(i: number) {
  return (p: number): LineArtState => {
    const u = languagePhase(p, i);
    return { draw: range(0.2, 0.64, u), fold: range(0.86, 1, u) };
  };
}

