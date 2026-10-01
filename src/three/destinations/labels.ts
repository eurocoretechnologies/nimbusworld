import { range } from "@/lib/math";
import { local } from "@/lib/timeline";

/** The Pune origin marker shows once the world is on the page, until the map folds away. */
export function puneLabelOpacity(p: number) {
  const inWorld = range(0.8, 0.98, local(p, "pullback"));
  const fold = 1 - range(0, 0.1, local(p, "courses"));
  return Math.min(inWorld, fold);
}
