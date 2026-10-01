import { clamp, easeInOutCubic, easeOutCubic, lerp, range, window4 } from "@/lib/math";
import { local } from "@/lib/timeline";
import { courses } from "@/data/content";

/** Pure course-chapter state (no three.js), shared by the scene, camera and DOM. */
export const SHEET_W = 0.62;
export const SHEET_H = 0.86;

export const SLOTS = [
  { x: -1.0, z: 0.06, r: 0.05 },
  { x: -0.5, z: -0.03, r: -0.025 },
  { x: 0.0, z: 0.05, r: 0.012 },
  { x: 0.5, z: -0.02, r: -0.03 },
  { x: 1.0, z: 0.04, r: 0.04 },
];
export const STACK = { x: 0.62, z: 0.08 };

/** Focus position along the five pages (0…5) through the chapter. */
export function courseFocus(p: number) {
  return range(0.34, 0.94, local(p, "courses")) * courses.length;
}

export function activeCourse(p: number) {
  return clamp(Math.floor(courseFocus(p)), 0, courses.length - 1);
}

export function courseLift(p: number, i: number) {
  return easeInOutCubic(window4(courseFocus(p) - i, 0, 0.25, 0.75, 1));
}

/** World x the camera leans toward while a page is lifted. */
export function courseFocusX(p: number) {
  const f = clamp(courseFocus(p) - 0.5, 0, courses.length - 1);
  const i = Math.floor(f);
  const t = f - i;
  const a = SLOTS[i].x;
  const b = SLOTS[Math.min(i + 1, SLOTS.length - 1)].x;
  return lerp(a, b, easeInOutCubic(t)) * range(0.3, 0.4, local(p, "courses")) * (1 - range(0, 0.12, local(p, "languages")));
}

export function dealt(p: number, i: number) {
  const deal = easeOutCubic(range(0.1 + i * 0.04, 0.3 + i * 0.04, local(p, "courses")));
  const gather = easeInOutCubic(range(0.0, 0.14, local(p, "languages")));
  return Math.min(deal, 1 - gather);
}

