"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { journey } from "@/data/content";
import { usePresence } from "@/hooks/usePresence";
import { useProgressValue, useScrub } from "@/hooks/useProgress";
import { range } from "@/lib/math";
import { local } from "@/lib/timeline";
import { JOURNEY_LEAVES, journeyStep } from "@/three/journey/journeyState";

const EASE = [0.22, 1, 0.36, 1] as const;
const presence = (p: number) => Math.min(range(0.03, 0.1, local(p, "journey")), 1 - range(0, 0.08, local(p, "finale")));
const stepOf = (p: number) => journeyStep(p, JOURNEY_LEAVES);

export function JourneyOverlay() {
  const kicker = useRef<HTMLDivElement>(null);
  const step = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  usePresence(kicker, presence);
  usePresence(step, presence);
  usePresence(rail, presence, 8);
  const index = useProgressValue(stepOf);
  const current = journey.steps[index];

  useScrub(bar, (el, p) => {
    const i = journeyStep(p, JOURNEY_LEAVES);
    el.style.transform = `scaleX(${(i + 0.5) / journey.steps.length})`;
  });

  return (
    <section className="overlay chapter-overlay" aria-labelledby="journey-title">
      <div ref={kicker} className="journey-kicker kicker">
        {journey.kicker}
      </div>
      <div ref={step} className="journey-step" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.number}
            initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="journey-step__num">{current.number}</div>
            <h2 id="journey-title" className="display">
              <em>{current.title}.</em>
            </h2>
            <p>{current.line}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <nav ref={rail} className="journey-rail" aria-label="Journey steps">
        <div className="journey-rail__track">
          <span ref={bar} className="journey-rail__bar" />
        </div>
        <ol>
          {journey.steps.map((s, i) => (
            <li key={s.number} aria-current={i === index ? "step" : undefined} className={i === index ? "is-active" : i < index ? "is-done" : ""}>
              <span className="hide-mobile">
                {s.number} {s.title}
              </span>
              <span className="show-mobile" aria-hidden="true">
                {s.number}
              </span>
            </li>
          ))}
        </ol>
      </nav>
    </section>
  );
}
