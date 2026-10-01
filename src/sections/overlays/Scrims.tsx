"use client";

import { useRef } from "react";
import { useScrub } from "@/hooks/useProgress";
import { range } from "@/lib/math";
import { local } from "@/lib/timeline";
import { paperWorld } from "@/three/director";

/**
 * Soft cinematic falloff at the top and bottom of the frame wherever overlay
 * type sits over the scene, so it stays legible over bright paper. Off in the
 * Languages chapter, whose type is set in ink on the paper itself.
 */
function scrimAmount(p: number) {
  const inn = range(0.0, 0.1, local(p, "destinations"));
  const out = 1 - range(0.7, 0.9, local(p, "finale"));
  return Math.min(inn, out) * (1 - paperWorld(p));
}

export function Scrims() {
  const top = useRef<HTMLDivElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const apply = (el: HTMLElement, p: number) => {
    el.style.opacity = String(scrimAmount(p));
  };
  useScrub(top, apply);
  useScrub(bottom, apply);
  return (
    <>
      <div ref={top} className="scrim scrim--top" aria-hidden="true" />
      <div ref={bottom} className="scrim scrim--bottom" aria-hidden="true" />
    </>
  );
}
