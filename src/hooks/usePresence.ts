"use client";

import type { RefObject } from "react";
import { useScrub } from "./useProgress";

/**
 * Scrubbed presence for an overlay block: opacity and a small rise follow a
 * 0..1 function of master progress; fully hidden blocks leave the a11y tree.
 */
export function usePresence<T extends HTMLElement>(ref: RefObject<T | null>, presence: (p: number) => number, rise = 16) {
  useScrub(ref, (el, p) => {
    const v = presence(p);
    el.style.opacity = String(v);
    el.style.visibility = v <= 0.001 ? "hidden" : "visible";
    el.style.transform = `translate3d(0, ${(1 - v) * rise}px, 0)`;
  });
}
