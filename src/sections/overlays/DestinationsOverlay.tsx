"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { destinations, destinationsCopy } from "@/data/content";
import { useScrub } from "@/hooks/useProgress";
import { range } from "@/lib/math";
import { goToConsultation } from "@/lib/navigation";
import { local } from "@/lib/timeline";
import { useExperience } from "@/store/experience";

const EASE = [0.22, 1, 0.36, 1] as const;

function presence(p: number) {
  const inn = range(0.04, 0.16, local(p, "destinations"));
  const out = 1 - range(0, 0.08, local(p, "courses"));
  return Math.min(inn, out);
}

export function DestinationsOverlay() {
  const headRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLDivElement>(null);
  const selectedId = useExperience((s) => s.selectedDestination);
  const select = useExperience((s) => s.selectDestination);
  const index = destinations.findIndex((d) => d.id === selectedId);
  const selected = index >= 0 ? destinations[index] : null;

  const apply = (el: HTMLElement, p: number) => {
    const v = presence(p);
    el.style.opacity = String(v);
    el.style.visibility = v <= 0 ? "hidden" : "visible";
    el.style.transform = `translate3d(0, ${(1 - v) * 16}px, 0)`;
  };
  useScrub(headRef, apply);
  useScrub(footRef, apply);

  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && select(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, select]);

  return (
    <section className="overlay destinations-overlay" aria-labelledby="destinations-title">
      {/* While diving, the chapter title steps back so the card and the place carry the frame. */}
      <div className={`destinations-overlay__chrome ${selected ? "is-dimmed" : ""}`}>
        <div ref={headRef} className="destinations-overlay__head">
          <div className="kicker">{destinationsCopy.kicker}</div>
          <h2 id="destinations-title" className="display">
            {destinationsCopy.title} <em>{destinationsCopy.titleItalic}</em>
          </h2>
        </div>

        <div ref={footRef} className="destinations-overlay__foot caps">
          <span>{destinationsCopy.hint}</span>
          <span className="hide-mobile">{destinationsCopy.collectionsNote}</span>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.aside
            key={selected.id}
            className="destination-card"
            aria-live="polite"
            initial={{ opacity: 0, y: 30, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.9, delay: 0.5, ease: EASE } }}
            exit={{ opacity: 0, y: 16, transition: { duration: 0.35 } }}
          >
            <div className="destination-card__meta caps">
              <span>{destinationsCopy.selectedLabel}</span>
              <span>
                {String(index + 1).padStart(2, "0")} / {String(destinations.length).padStart(2, "0")}
              </span>
            </div>
            <h3 className="destination-card__name display">{selected.name}</h3>
            <ol className="destination-card__path" aria-label="What we explore together">
              {selected.path.map((step, i) => (
                <li key={step}>
                  {step}
                  {i < selected.path.length - 1 && <span aria-hidden="true">→</span>}
                </li>
              ))}
            </ol>
            <p className="destination-card__summary">{selected.summary}</p>
            <div className="destination-card__actions">
              <button
                type="button"
                className="btn btn-navy"
                onClick={() => goToConsultation({ destination: selected.name })}
              >
                {destinationsCopy.advisorCta}
              </button>
              <button type="button" className="btn btn-link on-paper" onClick={() => select(null)}>
                {destinationsCopy.back}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </section>
  );
}
