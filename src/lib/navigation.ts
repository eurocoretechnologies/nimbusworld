import type { ChapterId } from "@/data/content";
import { segmentOf, type SegmentId } from "@/lib/timeline";
import { useExperience } from "@/store/experience";
import { scrollToId, scrollToProgress } from "./scroll";

/** Where each chapter "opens" on the master timeline — a settled frame, not the raw segment start. */
const LANDINGS: Partial<Record<ChapterId, [SegmentId, number]>> = {
  prologue: ["hero", 0],
  destinations: ["destinations", 0.5],
  courses: ["courses", 0.42],
  languages: ["languages", 0.32],
  visa: ["visa", 0.64],
  professional: ["professional", 0.55],
  journey: ["journey", 0.08],
  finale: ["finale", 1],
};

function landingProgress(chapter: ChapterId): number | null {
  const l = LANDINGS[chapter];
  const s = l ? segmentOf(l[0]) : undefined;
  return l && s ? s.start + (s.end - s.start) * l[1] : null;
}

/** Jump to a point inside a segment (used by in-chapter selectors). */
export function goToSegment(id: SegmentId, t: number, duration = 1.6) {
  const s = segmentOf(id);
  if (s) scrollToProgress(s.start + (s.end - s.start) * t, duration);
}

export function goToChapter(chapter: ChapterId) {
  const { mode, setIndexOpen } = useExperience.getState();
  setIndexOpen(false);
  if (mode === "editorial") {
    scrollToId(`chapter-${chapter}`);
    return;
  }
  const p = landingProgress(chapter);
  if (p !== null) scrollToProgress(p, chapter === "prologue" ? 2.2 : 3);
}

export function goToConsultation(prefill?: { destination?: string; course?: string }) {
  const state = useExperience.getState();
  if (prefill) state.setPrefill(prefill);
  state.setIndexOpen(false);
  scrollToId("consult", 2.4);
}
