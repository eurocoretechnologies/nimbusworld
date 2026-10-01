"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useExperience } from "@/store/experience";
import { registerScroller, scrollToProgress } from "@/lib/scroll";

/**
 * One master timeline, scrubbed by scroll across the cinematic track.
 * It only ever tweens a single proxy value 0→1; everything else (3D scene,
 * overlays) derives from that value, so reversing the scroll reverses the
 * whole film with no per-section state to get out of sync.
 */
export function useMasterTimeline(trackRef: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const trackEl = trackRef.current;
    if (!enabled || !trackEl) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9 });
    const onTick = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);
    registerScroller(lenis, trackEl);
    if (process.env.NODE_ENV !== "production") {
      // Dev-only: jump the film to a given progress, e.g. __nimbusGo(0.42).
      Object.assign(window, {
        __nimbusGo: (p: number, d = 0) => scrollToProgress(p, d),
        __nimbusState: () => useExperience.getState(),
      });
    }

    const setProgress = useExperience.getState().setProgress;
    const proxy = { p: 0 };
    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: trackEl,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    timeline.to(proxy, { p: 1, duration: 1, onUpdate: () => setProgress(proxy.p) });

    // Lock scrolling while the chapter index is open.
    const unsub = useExperience.subscribe((s, prev) => {
      if (s.indexOpen !== prev.indexOpen) {
        if (s.indexOpen) lenis.stop();
        else lenis.start();
      }
    });

    return () => {
      unsub();
      timeline.scrollTrigger?.kill();
      timeline.kill();
      gsap.ticker.remove(onTick);
      lenis.destroy();
      registerScroller(null, null);
    };
  }, [trackRef, enabled]);
}
