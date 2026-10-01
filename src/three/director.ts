import { range, smoothstep } from "@/lib/math";
import { local } from "@/lib/timeline";

/**
 * Chapter-level states shared by several scene objects (and the DOM), each a
 * pure function of master progress so everything scrubs and reverses together.
 */

/** 0 = dark studio, 1 = the whole frame becomes ivory paper (Languages). */
export function paperWorld(p: number) {
  const inn = range(0.02, 0.2, local(p, "languages"));
  const out = range(0.0, 0.16, local(p, "visa"));
  return smoothstep(Math.max(0, inn - out));
}

/** 0 = book, 1 = passport (thin, stamped) — Visa; eases back during Professional. */
export function passportness(p: number) {
  const inn = range(0.14, 0.32, local(p, "visa"));
  const out = range(0.02, 0.22, local(p, "professional"));
  return smoothstep(Math.max(0, inn - out));
}
