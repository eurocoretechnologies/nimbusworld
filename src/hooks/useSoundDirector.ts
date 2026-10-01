"use client";

import { useEffect } from "react";
import { segmentOf } from "@/lib/timeline";
import { sound } from "@/lib/sound";
import { useExperience } from "@/store/experience";
import { FINALE_LEAVES } from "@/three/book/bookPose";
import { JOURNEY_LEAVES } from "@/three/journey/journeyState";

/** Global progress values where a page passes upright — a rustle plays when scrolled across, either way. */
function cuePoints(): number[] {
  const cues: number[] = [];
  const open = segmentOf("open");
  if (open) cues.push(open.start + (open.end - open.start) * 0.42);
  const visa = segmentOf("visa");
  if (visa) cues.push(visa.start + (visa.end - visa.start) * 0.11, visa.start + (visa.end - visa.start) * 0.43);
  const journeySeg = segmentOf("journey");
  if (journeySeg) {
    for (let i = 0; i < JOURNEY_LEAVES; i++) {
      cues.push(journeySeg.start + (journeySeg.end - journeySeg.start) * (0.06 + i * 0.047 + 0.045));
    }
  }
  const fin = segmentOf("finale");
  if (fin) {
    for (let i = 0; i < FINALE_LEAVES; i++) {
      cues.push(fin.start + (fin.end - fin.start) * (0.36 + i * 0.06 + 0.09));
    }
  }
  return cues;
}

export function useSoundDirector() {
  useEffect(() => {
    const cues = cuePoints();
    let lastPlay = 0;
    return useExperience.subscribe((s, prev) => {
      if (s.soundOn !== prev.soundOn) {
        if (s.soundOn) sound?.enable();
        else sound?.disable();
      }
      if (!s.soundOn || s.progress === prev.progress) return;
      const lo = Math.min(s.progress, prev.progress);
      const hi = Math.max(s.progress, prev.progress);
      const now = performance.now();
      if (now - lastPlay > 140 && cues.some((c) => c > lo && c <= hi)) {
        lastPlay = now;
        sound?.pageTurn();
      }
    });
  }, []);
}
