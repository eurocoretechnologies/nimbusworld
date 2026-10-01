"use client";

import { useRef } from "react";
import { visaCopy, visaDisclaimer, visaStages } from "@/data/content";
import { usePresence } from "@/hooks/usePresence";
import { useProgressValue } from "@/hooks/useProgress";
import { range } from "@/lib/math";
import { goToConsultation } from "@/lib/navigation";
import { local } from "@/lib/timeline";
import { visaStagesDone } from "@/three/visa/visaState";

const presence = (p: number) => Math.min(range(0.2, 0.34, local(p, "visa")), 1 - range(0, 0.1, local(p, "professional")));

export function VisaOverlay() {
  const block = useRef<HTMLDivElement>(null);
  const foot = useRef<HTMLParagraphElement>(null);
  usePresence(block, presence);
  usePresence(foot, presence, 8);
  const done = useProgressValue(visaStagesDone);

  return (
    <section className="overlay chapter-overlay" aria-labelledby="visa-title">
      <div ref={block} className="visa-block">
        <div className="kicker">{visaCopy.kicker}</div>
        <h2 id="visa-title" className="display">
          {visaCopy.title} <em>{visaCopy.titleItalic}</em>
        </h2>
        <p>{visaCopy.body}</p>
        <button type="button" className="btn btn-outline" onClick={() => goToConsultation()}>
          {visaCopy.cta}
        </button>
        {/* The checklist is printed in the passport; this is its text for assistive tech. */}
        <ol className="sr-only" aria-label="Visa guidance stages" aria-live="polite">
          {visaStages.map((s, i) => (
            <li key={s.id}>
              {s.number} {s.title}
              {i < done ? " — complete" : i === done ? " — now" : ""}
            </li>
          ))}
        </ol>
      </div>
      <p ref={foot} className="visa-disclaimer">
        {visaDisclaimer}
      </p>
    </section>
  );
}
