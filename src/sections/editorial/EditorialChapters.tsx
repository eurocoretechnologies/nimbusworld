"use client";

import {
  courses,
  coursesCopy,
  journey,
  languages,
  languagesCopy,
  professionalCopy,
  professionalCourses,
  visaCopy,
  visaDisclaimer,
  visaStages,
  vfsPrograms,
} from "@/data/content";
import { goToConsultation } from "@/lib/navigation";

const PATHWAY_COURSE: Record<string, string> = { iata: "IATA", "non-iata": "Non-IATA", visa: "Visa course" };

/** Chapters 03–07 for the static edition: the same copy, set as editorial pages. */
export function EditorialChapters() {
  return (
    <>
      <section id="chapter-courses" className="ed-section ed-dark" aria-labelledby="ed-courses-title">
        <div className="ed-section__head">
          <div>
            <div className="kicker">{coursesCopy.kicker}</div>
            <h2 id="ed-courses-title" className="display">
              {coursesCopy.title} <em>{coursesCopy.titleItalic}</em>
            </h2>
          </div>
          <p>{coursesCopy.intro}</p>
        </div>
        <div className="ed-courses">
          {courses.map((c) => (
            <article key={c.id} className="ed-course">
              <div className="ed-course__meta caps">
                <span>{c.numeral}</span>
                <span>{c.kicker}</span>
              </div>
              <h3 className="display">{c.title}</h3>
              <p>{c.description}</p>
              <ul>
                {coursesCopy.pageList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <button type="button" className="btn btn-link on-paper" onClick={() => goToConsultation({ course: c.formCourse })}>
                {coursesCopy.explore}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section id="chapter-languages" className="ed-section ed-paper" aria-labelledby="ed-lang-title">
        <div className="kicker kicker--deep">{languagesCopy.kicker}</div>
        <div className="ed-languages">
          <h2 id="ed-lang-title" className="display">
            {languagesCopy.title} <em>{languagesCopy.titleItalic}</em>
          </h2>
          <ol className="lang-list">
            {languages.map((l) => (
              <li key={l.id}>
                <button type="button" onClick={() => goToConsultation({ course: l.formCourse })}>
                  <span className="display">{l.name}</span>
                  <span className={l.id === "german" ? "display italic" : "cjk"} lang={l.id === "japanese" ? "ja" : l.id === "chinese" ? "zh" : "de"}>
                    {l.native}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <p className="lang-body">{languagesCopy.body}</p>
        </div>
      </section>

      <section id="chapter-visa" className="ed-section ed-dark" aria-labelledby="ed-visa-title">
        <div className="ed-visa">
          <div>
            <div className="kicker">{visaCopy.kicker}</div>
            <h2 id="ed-visa-title" className="display">
              {visaCopy.title} <em>{visaCopy.titleItalic}</em>
            </h2>
            <p>{visaCopy.body}</p>
            <button type="button" className="btn btn-outline" onClick={() => goToConsultation()}>
              {visaCopy.cta}
            </button>
          </div>
          <ol className="ed-visa__stages">
            {visaStages.map((s) => (
              <li key={s.id}>
                <span className="caps">{s.number}</span>
                <span className="display">{s.title}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="ed-note">{visaDisclaimer}</p>
      </section>

      <section id="chapter-professional" className="ed-section ed-paper" aria-labelledby="ed-prof-title">
        <div className="ed-section__head">
          <div>
            <div className="kicker kicker--deep">{professionalCopy.kicker}</div>
            <h2 id="ed-prof-title" className="display">
              {professionalCopy.title} <em>{professionalCopy.titleItalic}</em>
            </h2>
          </div>
          <p>{professionalCopy.body}</p>
        </div>
        <div className="ed-pathways">
          {professionalCourses.map((c) => (
            <article key={c.id}>
              <div className="caps">{c.pathway}</div>
              <h3 className="display">{c.title}</h3>
              <p>
                {c.description} {c.details}.
              </p>
              <button type="button" className="btn btn-link on-paper" onClick={() => goToConsultation({ course: PATHWAY_COURSE[c.id] })}>
                {professionalCopy.explore}
              </button>
            </article>
          ))}
        </div>
        <aside className="vfs-panel ed-vfs" aria-labelledby="ed-vfs-title">
          <div className="kicker">{professionalCopy.vfs.kicker}</div>
          <h3 id="ed-vfs-title" className="display">
            {professionalCopy.vfs.title} <em>{professionalCopy.vfs.titleItalic}</em>
          </h3>
          <p>{professionalCopy.vfs.body}</p>
          <ol className="vfs-list">
            {vfsPrograms.programs.map((prog) => (
              <li key={prog.id}>
                <span className="vfs-list__label">{prog.label}</span>
                <span className="vfs-list__name display">{prog.name ?? prog.details}</span>
                <span className="vfs-list__where">{vfsPrograms.locations.join(" · ")}</span>
                <span />
              </li>
            ))}
          </ol>
          <p className="vfs-disclaimer">{vfsPrograms.disclaimer}</p>
        </aside>
      </section>

      <section id="chapter-journey" className="ed-section ed-dark" aria-labelledby="ed-journey-title">
        <div className="kicker">{journey.kicker}</div>
        <h2 id="ed-journey-title" className="display ed-journey__title">
          <em>Ten steps, one departure.</em>
        </h2>
        <ol className="ed-journey">
          {journey.steps.map((s) => (
            <li key={s.number}>
              <span className="caps">{s.number}</span>
              <span className="display">{s.title}</span>
              <p>{s.line}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
