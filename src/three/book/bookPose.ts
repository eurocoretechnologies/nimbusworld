import { easeInOutCubic, lerp, range, window4 } from "@/lib/math";
import { local } from "@/lib/timeline";
import { BOOK } from "../constants";
import { passportness } from "../director";

/** Pure functions of master progress — shared by the book, camera and lighting. */
export function bookPose(p: number) {
  const hero = local(p, "hero");
  const open = local(p, "open");
  const visa = local(p, "visa");
  const fin = local(p, "finale");

  // Opens in the prologue; closes for the Visa chapter, then opens again as a passport.
  const firstOpen = easeInOutCubic(range(0.06, 0.7, open));
  const close = easeInOutCubic(range(0.02, 0.2, visa));
  const reopen = easeInOutCubic(range(0.34, 0.52, visa));
  const openAngle = Math.PI * (firstOpen * (1 - close) + reopen);
  const closedness = 1 - openAngle / Math.PI;

  const heroYaw = lerp(lerp(0.62, 0.46, easeInOutCubic(hero)), 0, easeInOutCubic(range(0, 0.65, open)));
  const visaYaw = 0.32 * easeInOutCubic(window4(visa, 0.06, 0.22, 0.3, 0.46));

  const passport = passportness(p);
  const finaleK = lerp(1, 2.6, easeInOutCubic(range(0.1, 0.55, fin)));

  return {
    open,
    openAngle,
    yaw: heroYaw + visaYaw,
    // A closed book is centred on its own middle; an open one on its spine.
    shift: (-BOOK.width / 2) * closedness,
    thickness: lerp(1, 0.16, passport) * finaleK,
    passport,
  };
}

/** Turn value (0..1) for each of the loose leaves that follow the cover open. */
export function openingLeafTurn(open: number, i: number) {
  return easeInOutCubic(range(0.12 + 0.08 * i, 0.8 + 0.05 * i, open));
}

export const OPENING_LEAVES = 3;
export const FINALE_LEAVES = 6;

export function finaleLeafTurn(fin: number, i: number) {
  const start = 0.36 + i * 0.06;
  return easeInOutCubic(range(start, start + 0.18, fin));
}
