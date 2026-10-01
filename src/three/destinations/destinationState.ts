import { destinations } from "@/data/content";
import { easeOutCubic, range } from "@/lib/math";
import { local } from "@/lib/timeline";
import { project } from "../constants";

export const PIN_HEIGHT = 0.1;

export const pinPositions = destinations.map((d) => {
  const [x, z] = project(d.lon, d.lat);
  return { id: d.id, x, z };
});

export function pinPosition(id: string) {
  return pinPositions.find((p) => p.id === id) ?? null;
}

/** 0..1 rise of pin i (staggered), sinking back into the page in the finale. */
export function pinRise(p: number, i: number) {
  const d = local(p, "destinations");
  const rise = easeOutCubic(range(0.05 + i * 0.035, 0.3 + i * 0.035, d));
  const sink = 1 - range(0, 0.12, local(p, "courses"));
  return Math.min(rise, sink);
}

export function routeDraw(p: number, i: number) {
  const d = local(p, "destinations");
  const draw = range(0.22 + i * 0.03, 0.5 + i * 0.03, d);
  const undraw = 1 - range(0, 0.08, local(p, "courses"));
  return Math.min(draw, undraw);
}
