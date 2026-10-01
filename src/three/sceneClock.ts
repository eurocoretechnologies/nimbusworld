import { local, type SegmentId } from "@/lib/timeline";

/**
 * Transient, per-frame scene state. Written once per frame by the
 * ProgressDriver (first useFrame subscriber) and read by every scene object;
 * nothing here goes through React state, so scrolling never re-renders.
 */
export const clock = {
  /** Smoothed master progress 0..1. */
  p: 0,
  /** 0..1 blend toward the selected destination's dive shot. */
  dive: 0,
  /** Pointer position in -1..1, damped. */
  px: 0,
  py: 0,
  /** True until shaders are pre-compiled: range-gated objects mount once so they compile up front. */
  warming: true,
};

export const seg = (id: SegmentId) => local(clock.p, id);
