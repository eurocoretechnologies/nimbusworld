import type { ChapterId } from "@/data/content";
import { invLerp } from "./math";

/**
 * The master scroll map. Weights come from the phase-1 brief (0.00–1.00);
 * disabled segments are skipped and the rest are renormalised, so adding a
 * chapter later only means flipping `enabled` — scene code works purely in
 * segment-local 0→1 progress and never hardcodes global numbers.
 */
export type SegmentId =
  | "hero"
  | "open"
  | "pune"
  | "pullback"
  | "destinations"
  | "courses"
  | "languages"
  | "visa"
  | "professional"
  | "journey"
  | "finale";

interface SegmentDef {
  id: SegmentId;
  chapter: ChapterId;
  weight: number;
  enabled: boolean;
}

const DEFINITIONS: SegmentDef[] = [
  { id: "hero", chapter: "prologue", weight: 0.08, enabled: true },
  { id: "open", chapter: "prologue", weight: 0.08, enabled: true },
  { id: "pune", chapter: "prologue", weight: 0.1, enabled: true },
  { id: "pullback", chapter: "prologue", weight: 0.1, enabled: true },
  { id: "destinations", chapter: "destinations", weight: 0.14, enabled: true },
  { id: "courses", chapter: "courses", weight: 0.12, enabled: true },
  { id: "languages", chapter: "languages", weight: 0.12, enabled: true },
  { id: "visa", chapter: "visa", weight: 0.13, enabled: true },
  { id: "professional", chapter: "professional", weight: 0.12, enabled: true },
  { id: "journey", chapter: "journey", weight: 0.2, enabled: true },
  { id: "finale", chapter: "finale", weight: 0.16, enabled: true },
];

export interface Segment extends SegmentDef {
  start: number;
  end: number;
}

const enabled = DEFINITIONS.filter((d) => d.enabled);
const totalWeight = enabled.reduce((s, d) => s + d.weight, 0);

export const SEGMENTS: Segment[] = (() => {
  let cursor = 0;
  return enabled.map((d) => {
    const len = d.weight / totalWeight;
    const seg = { ...d, start: cursor, end: cursor + len };
    cursor += len;
    return seg;
  });
})();

const byId = new Map(SEGMENTS.map((s) => [s.id, s]));

export const hasSegment = (id: SegmentId) => byId.has(id);
export const segmentOf = (id: SegmentId) => byId.get(id);

/** Segment-local progress, clamped 0..1. Missing segments read as complete/not-started by position. */
export function local(p: number, id: SegmentId): number {
  const s = byId.get(id);
  if (!s) return 0;
  return invLerp(s.start, s.end, p);
}

export function activeSegment(p: number): Segment {
  for (const s of SEGMENTS) if (p < s.end) return s;
  return SEGMENTS[SEGMENTS.length - 1];
}

/** Scroll length of the cinematic track, in viewport heights (scaled by how much film there is). */
export const TRACK_VH = {
  desktop: Math.round(totalWeight * 1750),
  mobile: Math.round(totalWeight * 1250),
};

export function chapterStart(chapter: ChapterId): number | null {
  const first = SEGMENTS.find((s) => s.chapter === chapter);
  return first ? first.start : null;
}
