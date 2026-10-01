"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { chapters, navigation } from "@/data/content";
import { goToChapter, goToConsultation } from "@/lib/navigation";
import { SEGMENTS } from "@/lib/timeline";
import { useExperience } from "@/store/experience";
import { BrandLogo } from "./BrandLogo";

const EASE = [0.22, 1, 0.36, 1] as const;

/** The contents page — opens like a leaf over the film; the scroll position is kept. */
export function ChapterIndex({ hasLogo }: { hasLogo: boolean }) {
  const open = useExperience((s) => s.indexOpen);
  const setOpen = useExperience((s) => s.setIndexOpen);
  const segment = useExperience((s) => s.segment);
  const formInView = useExperience((s) => s.formInView);
  const current = formInView ? "finale" : (SEGMENTS.find((s) => s.id === segment)?.chapter ?? "prologue");
  const currentChapter = chapters.find((c) => c.id === current)!;
  const panel = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && panel.current) {
        const focusable = panel.current.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]");
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => panel.current?.querySelector<HTMLElement>(".index-close")?.focus(), 50);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
      returnFocus.current?.focus?.();
    };
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panel}
          className="index"
          role="dialog"
          aria-modal="true"
          aria-labelledby="index-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, delay: 0.1 } }}
          transition={{ duration: 0.4 }}
        >
          <div className="index__side">
            <BrandLogo hasLogo={hasLogo} height={66} plate />
            <div className="index__now">
              <div className="kicker">{navigation.indexKicker}</div>
              <div className="index__now-title display">
                {currentChapter.title} —<br />
                <em>{currentChapter.subtitle}</em>
              </div>
              <p>{navigation.indexHelp}</p>
            </div>
            <div className="index__side-links">
              <button type="button" className="nav-link" onClick={() => goToConsultation()}>
                {navigation.contact}
              </button>
              <button type="button" className="nav-link is-gold" onClick={() => goToConsultation()}>
                {navigation.start}
              </button>
            </div>
          </div>

          <motion.div
            className="index__page"
            initial={{ x: "30%", rotateY: -12, opacity: 0 }}
            animate={{ x: 0, rotateY: 0, opacity: 1 }}
            exit={{ x: "24%", rotateY: -8, opacity: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <div className="index__head">
              <h2 id="index-title" className="display">
                <em>{navigation.indexTitle}</em>
              </h2>
              <button type="button" className="index-close" aria-label="Close chapter index" onClick={() => setOpen(false)}>
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </button>
            </div>
            <ol className="index__list">
              {chapters.map((c, i) => {
                const isCurrent = c.id === current;
                return (
                  <motion.li
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.035, ease: EASE }}
                  >
                    <button
                      type="button"
                      className={`index__item ${isCurrent ? "is-current" : ""}`}
                      disabled={!c.available}
                      aria-current={isCurrent ? "true" : undefined}
                      onClick={() => goToChapter(c.id)}
                    >
                      <span className="index__num">{c.number}</span>
                      <span className="index__title display">{c.title}</span>
                      <span className="index__sub">
                        {isCurrent ? "Reading" : c.available ? c.subtitle : navigation.comingSoon}
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </ol>
          </motion.div>
          <div className="index__ribbons" aria-hidden="true">
            <span />
            <span />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
