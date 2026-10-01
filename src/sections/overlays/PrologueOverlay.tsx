"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { prologue } from "@/data/content";
import { useProgressValue, useScrub } from "@/hooks/useProgress";
import { range } from "@/lib/math";
import { local } from "@/lib/timeline";
import { stageAt, zoomProgress, STAGES } from "@/three/map/mapState";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Visible from the moment the city appears until the world has settled on the page. */
function labelPresence(p: number) {
  const inn = range(0.22, 0.4, local(p, "pune"));
  const out = 1 - range(0.9, 1, local(p, "pullback"));
  return Math.min(inn, out);
}

function railPresence(p: number) {
  const inn = range(0.1, 0.3, local(p, "pune"));
  const out = 1 - range(0.05, 0.25, local(p, "destinations"));
  return Math.min(inn, out);
}

export function PrologueOverlay() {
  const labelRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const stage = useProgressValue(stageAt);
  const stageInfo = prologue.stages.find((s) => s.id === stage)!;

  useScrub(labelRef, (el, p) => {
    const v = labelPresence(p);
    el.style.opacity = String(v);
    el.style.visibility = v <= 0 ? "hidden" : "visible";
  });
  useScrub(railRef, (el, p) => {
    const v = railPresence(p);
    el.style.opacity = String(v);
    el.style.visibility = v <= 0 ? "hidden" : "visible";
    if (barRef.current) barRef.current.style.transform = `scaleX(${0.06 + zoomProgress(p) * 0.94})`;
  });

  return (
    <section className="overlay prologue-overlay" aria-labelledby="prologue-title">
      {/* The prologue is printed on the page in the scene; this is its text for assistive tech. */}
      <div className="sr-only">
        <h2 id="prologue-title">{prologue.kicker}</h2>
        <p>{prologue.line}</p>
        <p>{prologue.body}</p>
      </div>

      <div ref={labelRef} className="stage-label" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={stage}
            className="stage-label__inner"
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="stage-label__name display">{stageInfo.label}</div>
            {stageInfo.detail && <div className="stage-label__detail">{stageInfo.detail}</div>}
          </motion.div>
        </AnimatePresence>
      </div>

      <div ref={railRef} className="stage-rail" aria-hidden="true">
        <div className="stage-rail__track">
          <span ref={barRef} className="stage-rail__bar" />
        </div>
        <div className="stage-rail__labels">
          {STAGES.map((s) => (
            <span key={s} className={s === stage ? "is-active" : ""}>
              {prologue.stages.find((x) => x.id === s)!.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
