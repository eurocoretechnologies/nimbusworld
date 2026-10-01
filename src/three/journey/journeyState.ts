import { easeInOutCubic, range } from "@/lib/math";
import { local } from "@/lib/timeline";

/** Step pages that turn in the Journey (01 Discover … 07 Prepare). */
export const JOURNEY_LEAVES = 7;

const STEP_START = 0.06;
const STEP_GAP = 0.047;
const STEP_DUR = 0.09;

export function stepLeafTurn(p: number, i: number) {
  const j = local(p, "journey");
  const s = STEP_START + i * STEP_GAP;
  return easeInOutCubic(range(s, s + STEP_DUR, j));
}

/** Which of the ten journey steps is current (0…9), for the DOM. */
export function journeyStep(p: number, leaves: number) {
  const j = local(p, "journey");
  if (j >= 0.82) return 9;
  if (j >= 0.6) return 8;
  if (j >= 0.44) return 7;
  let turned = 0;
  for (let i = 0; i < leaves; i++) if (stepLeafTurn(p, i) > 0.5) turned++;
  return Math.min(turned, leaves - 1);
}

