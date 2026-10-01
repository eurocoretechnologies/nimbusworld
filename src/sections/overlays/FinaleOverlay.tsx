"use client";

import { AnimatePresence, motion } from "motion/react";
import { finale } from "@/data/content";
import { useProgressValue } from "@/hooks/useProgress";
import { goToConsultation } from "@/lib/navigation";
import { local } from "@/lib/timeline";

const EASE = [0.22, 1, 0.36, 1] as const;

export function FinaleOverlay() {
  const show = useProgressValue((p) => local(p, "finale") > 0.9);

  return (
    <section className="overlay finale-overlay" aria-labelledby="finale-title">
      {/* The finale lines are printed on the blank page in the scene. */}
      <div className="sr-only">
        <h2 id="finale-title">{finale.line1}</h2>
        <p>{finale.line2}</p>
      </div>
      <AnimatePresence>
        {show && (
          <motion.div
            className="finale-overlay__ctas"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 1.1, ease: EASE } }}
            exit={{ opacity: 0, y: 10, transition: { duration: 0.4 } }}
          >
            <button type="button" className="btn btn-solid" onClick={() => goToConsultation()}>
              {finale.primaryCta}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => goToConsultation()}>
              {finale.secondaryCta}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
