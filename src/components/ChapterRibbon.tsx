"use client";

import { AnimatePresence, motion } from "motion/react";
import { chapters } from "@/data/content";
import { useExperience } from "@/store/experience";
import { SEGMENTS } from "@/lib/timeline";
import { onPaperAt } from "@/lib/surface";
import { useProgressValue } from "@/hooks/useProgress";

/** The bookmark on the left edge: always says which chapter you are reading. */
export function ChapterRibbon() {
  const segment = useExperience((s) => s.segment);
  const hidden = useExperience((s) => s.formInView);
  const onPaper = useProgressValue(onPaperAt);
  const chapterId = SEGMENTS.find((s) => s.id === segment)?.chapter ?? "prologue";
  const chapter = chapters.find((c) => c.id === chapterId)!;

  return (
    <div className={`chapter-ribbon ${hidden ? "is-hidden" : ""} ${onPaper ? "on-paper" : ""}`} aria-live="polite">
      <div className="chapter-ribbon__tail" aria-hidden="true" />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={chapter.id}
          className="chapter-ribbon__label"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="sr-only">Now reading: </span>
          {chapter.number} — {chapter.title}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
