"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { companyInfo } from "@/data/content";
import { BrandLogo } from "./BrandLogo";
import { useExperience } from "@/store/experience";

/** A quiet curtain: a gold hairline fills while the book is bound, then lifts. */
export function Loader({ hasLogo }: { hasLogo: boolean }) {
  const mode = useExperience((s) => s.mode);
  const sceneReady = useExperience((s) => s.sceneReady);
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), 700);
    return () => clearTimeout(t);
  }, []);

  const done = mode === "editorial" || (mode === "cinematic" && sceneReady && minElapsed);

  useEffect(() => {
    document.documentElement.classList.toggle("is-loading", !done);
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="loader"
          role="status"
          aria-label="Loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] } }}
        >
          <div className="loader__inner">
            <BrandLogo hasLogo={hasLogo} height={114} plate priority />
            <div className="loader__title display">
              <em>{companyInfo.tagline}</em>
            </div>
            <div className="loader__line">
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: sceneReady ? 1 : 0.72 }}
                transition={{ duration: sceneReady ? 0.5 : 3.2, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
