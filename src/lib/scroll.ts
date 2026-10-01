import type Lenis from "lenis";

/**
 * Imperative scroll helpers shared by the nav, index and CTAs. The Lenis
 * instance is registered by the master timeline hook; when it is absent
 * (editorial mode) native smooth scrolling is used instead.
 */
let lenis: Lenis | null = null;
let track: HTMLElement | null = null;

export function registerScroller(instance: Lenis | null, trackEl: HTMLElement | null) {
  lenis = instance;
  track = trackEl;
}

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollToY(y: number, duration = 2.2) {
  if (lenis) {
    lenis.scrollTo(y, duration <= 0 ? { immediate: true, force: true } : { duration, easing: (t) => 1 - Math.pow(1 - t, 3) });
  } else {
    window.scrollTo({ top: y, behavior: reducedMotion() ? "auto" : "smooth" });
  }
}

/** Scroll so the master timeline lands on progress p (0..1). */
export function scrollToProgress(p: number, duration = 2.4) {
  if (!track) return;
  const top = track.getBoundingClientRect().top + window.scrollY;
  const scrollable = track.offsetHeight - window.innerHeight;
  scrollToY(top + p * scrollable + 1, duration);
}

export function scrollToId(id: string, duration = 2.2) {
  const el = document.getElementById(id);
  if (!el) return;
  scrollToY(el.getBoundingClientRect().top + window.scrollY, duration);
}
