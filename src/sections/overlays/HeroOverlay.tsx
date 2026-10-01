"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { hero } from "@/data/content";
import { useScrub } from "@/hooks/useProgress";
import { range } from "@/lib/math";
import { goToConsultation } from "@/lib/navigation";
import { scrollToProgress } from "@/lib/scroll";
import { local, segmentOf } from "@/lib/timeline";
import { useExperience } from "@/store/experience";
import { SoundToggle } from "@/components/SoundToggle";

const EASE = [0.22, 1, 0.36, 1] as const;

export function HeroOverlay() {
  const block = useRef<HTMLDivElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  const ready = useExperience((s) => s.sceneReady);

  useScrub(block, (el, p) => {
    const out = range(0.3, 0.85, local(p, "hero"));
    el.style.opacity = String(1 - out);
    el.style.transform = `translate3d(0, ${-out * 40}px, 0)`;
    el.style.visibility = out >= 1 ? "hidden" : "visible";
  });
  useScrub(controls, (el, p) => {
    const out = range(0.15, 0.6, local(p, "hero"));
    el.style.opacity = String(1 - out);
    el.style.visibility = out >= 1 ? "hidden" : "visible";
  });

  const reveal = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    transition: { duration: 1.4, delay, ease: EASE },
  });

  const begin = () => {
    const open = segmentOf("open");
    if (open) scrollToProgress(open.end - 0.002, 3.2);
  };

  return (
    <section className="overlay hero-overlay" aria-labelledby="hero-title">
      <div ref={block} className="hero-overlay__block">
        <motion.div className="kicker" {...reveal(0.2)}>
          {hero.kicker}
        </motion.div>
        <h1 id="hero-title" className="hero-overlay__title display">
          <motion.span style={{ display: "block" }} {...reveal(0.35)}>
            {hero.titleLine1}
          </motion.span>
          <motion.em style={{ display: "block" }} {...reveal(0.5)}>
            {hero.titleLine2}
          </motion.em>
        </h1>
        <motion.p className="hero-overlay__sub" {...reveal(0.75)}>
          {hero.supporting}
        </motion.p>
        <motion.div className="hero-overlay__ctas" {...reveal(0.95)}>
          <button type="button" className="btn btn-solid" onClick={begin}>
            {hero.primaryCta}
          </button>
          <button type="button" className="btn btn-link" onClick={() => goToConsultation()}>
            {hero.secondaryCta}
          </button>
        </motion.div>
      </div>

      <motion.div
        ref={controls}
        className="hero-overlay__controls"
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: 1.2, delay: 1.2 }}
      >
        <SoundToggle />
        <div className="scroll-cue" aria-hidden="true">
          <span>{hero.scrollCue}</span>
          <span className="scroll-cue__line" />
        </div>
      </motion.div>
    </section>
  );
}
