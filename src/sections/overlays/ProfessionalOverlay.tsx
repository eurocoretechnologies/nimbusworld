"use client";

import { useRef } from "react";
import { professionalCopy, professionalCourses, vfsPrograms } from "@/data/content";
import { usePresence } from "@/hooks/usePresence";
import { range } from "@/lib/math";
import { goToConsultation } from "@/lib/navigation";
import { local } from "@/lib/timeline";

const headPresence = (p: number) => Math.min(range(0.3, 0.42, local(p, "professional")), 1 - range(0.58, 0.66, local(p, "professional")));
const vfsPresence = (p: number) => Math.min(range(0.64, 0.74, local(p, "professional")), 1 - range(0, 0.05, local(p, "journey")));

const COURSE_FOR: Record<string, string> = { iata: "IATA", "non-iata": "Non-IATA", visa: "Visa course" };

export function ProfessionalOverlay() {
  const head = useRef<HTMLDivElement>(null);
  const vfs = useRef<HTMLElement>(null);
  usePresence(head, headPresence);
  usePresence(vfs, vfsPresence, 30);

  return (
    <section className="overlay chapter-overlay" aria-labelledby="professional-title">
      <div ref={head} className="chapter-head">
        <div className="chapter-head__title">
          <div className="kicker">{professionalCopy.kicker}</div>
          <h2 id="professional-title" className="display">
            {professionalCopy.title} <em>{professionalCopy.titleItalic}</em>
          </h2>
        </div>
        <div className="chapter-head__intro">
          <p className="hide-mobile">{professionalCopy.body}</p>
          <ul className="pathway-links">
            {professionalCourses.map((c) => (
              <li key={c.id}>
                <button type="button" className="chapter-foot__link" onClick={() => goToConsultation({ course: COURSE_FOR[c.id] })}>
                  {c.title}
                </button>
                <span className="sr-only">
                  {c.pathway}. {c.description} {c.details}.
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* The VFS Global tie-up: an institutional panel, described only as a tie-up. */}
      <aside ref={vfs} className="vfs-panel" aria-labelledby="vfs-title">
        <div className="kicker">{professionalCopy.vfs.kicker}</div>
        <h3 id="vfs-title" className="display">
          {professionalCopy.vfs.title} <em>{professionalCopy.vfs.titleItalic}</em>
        </h3>
        <p>{professionalCopy.vfs.body}</p>
        <ol className="vfs-list">
          {vfsPrograms.programs.map((prog) => (
            <li key={prog.id}>
              <span className="vfs-list__label">{prog.label}</span>
              <span className="vfs-list__name display">{prog.name ?? prog.details}</span>
              <span className="vfs-list__where">{vfsPrograms.locations.join(" · ")}</span>
              <button type="button" className="chapter-foot__link" onClick={() => goToConsultation()}>
                {professionalCopy.vfs.explore} <span aria-hidden="true">→</span>
                <span className="sr-only"> {prog.label}</span>
              </button>
            </li>
          ))}
        </ol>
        <p className="vfs-disclaimer">{vfsPrograms.disclaimer}</p>
      </aside>
    </section>
  );
}
