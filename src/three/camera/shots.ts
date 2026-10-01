import { Vector3 } from "three";
import { smootherstep } from "@/lib/math";
import { hasSegment, segmentOf, type SegmentId } from "@/lib/timeline";

/**
 * Composed shots along the film, addressed by segment-local time. Between two
 * shots the camera eases (smootherstep), so every key is a settled frame and
 * scrubbing feels like moving between deliberate compositions.
 */
interface ShotDef {
  seg: SegmentId;
  t: number;
  pos: [number, number, number];
  target: [number, number, number];
  fov: number;
}

const SHOTS: ShotDef[] = [
  // Hero — macro on the foil, then a slow dolly out to the product frame.
  { seg: "hero", t: 0, pos: [0.36, 0.34, 0.34], target: [0.05, 0.15, -0.02], fov: 24 },
  { seg: "hero", t: 1, pos: [-1.0, 2.95, 3.6], target: [-0.58, 0.0, 0.18], fov: 30 },
  // The book opens beneath the camera.
  { seg: "open", t: 0.55, pos: [-0.35, 2.9, 2.35], target: [-0.15, 0, 0.12], fov: 32 },
  { seg: "open", t: 1, pos: [0, 3.35, 1.45], target: [0, 0, 0.05], fov: 34 },
  // Push into the point of light, then glide low across the miniature city.
  { seg: "pune", t: 0.3, pos: [0.64, 1.15, 0.62], target: [0.6, 0, -0.04], fov: 32 },
  { seg: "pune", t: 1, pos: [1.0, 0.64, 0.62], target: [0.55, 0.05, -0.08], fov: 36 },
  // Pull back until the whole world sits on the spread.
  { seg: "pullback", t: 0.4, pos: [0.82, 1.35, 1.15], target: [0.5, 0, -0.03], fov: 34 },
  { seg: "pullback", t: 1, pos: [0.02, 3.55, 1.4], target: [0.02, 0, 0.04], fov: 34 },
  // Destinations — a quarter turn of perspective so the pins stand up.
  { seg: "destinations", t: 0.35, pos: [0.12, 2.55, 2.55], target: [0.08, 0, 0.02], fov: 33 },
  { seg: "destinations", t: 1, pos: [0.02, 2.75, 2.35], target: [0.05, 0, 0.02], fov: 33 },
  // Courses — above the spread while the pages are dealt and lifted.
  { seg: "courses", t: 0.14, pos: [0.02, 3.45, 1.9], target: [0.02, 0, 0.12], fov: 34 },
  { seg: "courses", t: 1, pos: [0.02, 3.35, 1.85], target: [0.02, 0, 0.12], fov: 34 },
  // Languages — a low, frontal view so the architecture stands up; type sits right.
  { seg: "languages", t: 0.18, pos: [0.5, 1.6, 3.55], target: [0.42, 0.42, 0], fov: 32 },
  { seg: "languages", t: 1, pos: [0.4, 1.5, 3.4], target: [0.4, 0.42, 0], fov: 32 },
  // Visa — the book closes into a product shot, becomes a passport, opens.
  { seg: "visa", t: 0.1, pos: [0.1, 2.7, 2.5], target: [0.05, 0, 0.1], fov: 32 },
  { seg: "visa", t: 0.3, pos: [-0.95, 2.25, 2.7], target: [-0.3, 0, 0.1], fov: 30 },
  { seg: "visa", t: 0.54, pos: [-0.9, 3.8, 1.65], target: [-0.9, 0, 0.05], fov: 34 },
  { seg: "visa", t: 1, pos: [-0.85, 3.6, 1.55], target: [-0.85, 0, 0.04], fov: 34 },
  // Professional — back to the book; the pathways pop up and face the reader.
  { seg: "professional", t: 0.18, pos: [0, 3.0, 1.9], target: [0, 0, 0.05], fov: 34 },
  { seg: "professional", t: 0.45, pos: [0, 1.25, 2.5], target: [0.03, 0.18, 0.12], fov: 34 },
  { seg: "professional", t: 1, pos: [-0.1, 1.35, 2.7], target: [0, 0.2, 0.1], fov: 34 },
  // The Journey — pages turn, a terminal vault, lift-off, the globe, the city.
  { seg: "journey", t: 0.06, pos: [0, 3.2, 1.55], target: [0, 0, 0.05], fov: 34 },
  { seg: "journey", t: 0.4, pos: [0, 3.1, 1.45], target: [0, 0, 0.05], fov: 34 },
  { seg: "journey", t: 0.5, pos: [0, 0.34, 1.6], target: [0, 0.38, -0.9], fov: 42 },
  { seg: "journey", t: 0.56, pos: [0, 0.4, 1.4], target: [0, 0.45, -0.9], fov: 42 },
  { seg: "journey", t: 0.64, pos: [0.05, 0.9, 2.3], target: [0.05, 1.05, -0.5], fov: 36 },
  { seg: "journey", t: 0.72, pos: [0, 1.3, 2.35], target: [0, 0.92, 0.05], fov: 32 },
  { seg: "journey", t: 0.8, pos: [0.1, 1.25, 2.3], target: [0, 0.9, 0.05], fov: 32 },
  { seg: "journey", t: 0.9, pos: [0, 0.95, 2.7], target: [0, 0.45, -0.1], fov: 34 },
  { seg: "journey", t: 1, pos: [0, 1.05, 2.9], target: [0, 0.45, -0.1], fov: 34 },
  // Finale — pull back to the thick book; hold on the blank page.
  { seg: "finale", t: 0.12, pos: [0, 1.7, 3.7], target: [0, 0.05, 0], fov: 32 },
  { seg: "finale", t: 0.55, pos: [0, 2.1, 4.6], target: [0, -0.12, 0], fov: 30 },
  { seg: "finale", t: 1, pos: [0, 2.9, 3.25], target: [0, -0.18, 0.18], fov: 30 },
];

interface Shot {
  p: number;
  pos: Vector3;
  target: Vector3;
  fov: number;
}

const KEYS: Shot[] = SHOTS.filter((s) => hasSegment(s.seg)).map((s) => {
  const seg = segmentOf(s.seg)!;
  return {
    p: seg.start + s.t * (seg.end - seg.start),
    pos: new Vector3(...s.pos),
    target: new Vector3(...s.target),
    fov: s.fov,
  };
});

export function sampleShot(p: number, outPos: Vector3, outTarget: Vector3): number {
  if (p <= KEYS[0].p) {
    outPos.copy(KEYS[0].pos);
    outTarget.copy(KEYS[0].target);
    return KEYS[0].fov;
  }
  for (let i = 0; i < KEYS.length - 1; i++) {
    const a = KEYS[i];
    const b = KEYS[i + 1];
    if (p <= b.p) {
      const t = smootherstep((p - a.p) / Math.max(1e-6, b.p - a.p));
      outPos.lerpVectors(a.pos, b.pos, t);
      outTarget.lerpVectors(a.target, b.target, t);
      return a.fov + (b.fov - a.fov) * t;
    }
  }
  const last = KEYS[KEYS.length - 1];
  outPos.copy(last.pos);
  outTarget.copy(last.target);
  return last.fov;
}
