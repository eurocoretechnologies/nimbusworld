import { clamp, range } from "@/lib/math";
import { local } from "@/lib/timeline";
import { visaStages } from "@/data/content";

/** Stages completed on the passport checklist at progress p (0…6). */
export function visaStagesDone(p: number) {
  const v = local(p, "visa");
  return clamp(Math.floor(range(0.55, 0.93, v) * (visaStages.length + 0.999)), 0, visaStages.length);
}
