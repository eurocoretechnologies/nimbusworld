import { create } from "zustand";
import type { SegmentId } from "@/lib/timeline";
import { activeSegment } from "@/lib/timeline";

export type ExperienceMode = "pending" | "cinematic" | "editorial";

export interface FormPrefill {
  destination?: string;
  course?: string;
}

interface ExperienceState {
  mode: ExperienceMode;
  isMobile: boolean;
  /** Master timeline progress 0..1 — read transiently in render loops, never via selectors. */
  progress: number;
  segment: SegmentId;
  sceneReady: boolean;
  indexOpen: boolean;
  soundOn: boolean;
  selectedDestination: string | null;
  prefill: FormPrefill;
  /** The consultation section covers the stage — overlays step aside. */
  formInView: boolean;

  setMode: (mode: ExperienceMode, isMobile: boolean) => void;
  setProgress: (p: number) => void;
  setSceneReady: () => void;
  setIndexOpen: (open: boolean) => void;
  toggleSound: () => void;
  selectDestination: (id: string | null) => void;
  setPrefill: (prefill: FormPrefill) => void;
  setFormInView: (v: boolean) => void;
}

export const useExperience = create<ExperienceState>((set, get) => ({
  mode: "pending",
  isMobile: false,
  progress: 0,
  segment: "hero",
  sceneReady: false,
  indexOpen: false,
  soundOn: false,
  selectedDestination: null,
  prefill: {},
  formInView: false,

  setMode: (mode, isMobile) => set({ mode, isMobile }),
  setProgress: (p) => {
    const seg = activeSegment(p).id;
    const state = get();
    // Leaving the destinations chapter always releases a camera dive.
    const selected = seg === "destinations" ? state.selectedDestination : null;
    if (seg !== state.segment || selected !== state.selectedDestination) {
      set({ progress: p, segment: seg, selectedDestination: selected });
    } else {
      set({ progress: p });
    }
  },
  setSceneReady: () => set({ sceneReady: true }),
  setIndexOpen: (indexOpen) => set({ indexOpen }),
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
  selectDestination: (selectedDestination) => set({ selectedDestination }),
  setPrefill: (prefill) => set({ prefill }),
  setFormInView: (formInView) => set({ formInView }),
}));
