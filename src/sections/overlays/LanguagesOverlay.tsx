"use client";

import { useRef } from "react";
import { languages, languagesCopy } from "@/data/content";
import { usePresence } from "@/hooks/usePresence";
import { useProgressValue } from "@/hooks/useProgress";
import { range } from "@/lib/math";
import { goToConsultation, goToSegment } from "@/lib/navigation";
import { local } from "@/lib/timeline";
import { activeLanguage } from "@/three/languages/languageState";

const presence = (p: number) => Math.min(range(0.1, 0.22, local(p, "languages")), 1 - range(0, 0.1, local(p, "visa")));

/** Chapter 04 is set on paper: ink type in a right-hand column, after the reference board. */
export function LanguagesOverlay() {
  const col = useRef<HTMLDivElement>(null);
  const foot = useRef<HTMLDivElement>(null);
  const kicker = useRef<HTMLDivElement>(null);
  usePresence(col, presence);
  usePresence(foot, presence);
  usePresence(kicker, presence);
  const index = useProgressValue(activeLanguage);
  const lang = languages[index];
  const next = languages[(index + 1) % languages.length];

  return (
    <section className="overlay chapter-overlay on-paper" aria-labelledby="languages-title">
      <div ref={kicker} className="lang-kicker kicker kicker--deep">
        {languagesCopy.kicker}
      </div>
      <div ref={col} className="lang-column">
        <h2 id="languages-title" className="display">
          {languagesCopy.title}
          <br />
          <em>{languagesCopy.titleItalic}</em>
        </h2>
        <ol className="lang-list">
          {languages.map((l, i) => (
            <li key={l.id}>
              <button
                type="button"
                className={i === index ? "is-active" : ""}
                aria-current={i === index ? "true" : undefined}
                onClick={() => goToSegment("languages", 0.14 + ((i + 0.55) * (1 - 0.14)) / languages.length)}
              >
                <span className="display">{l.name}</span>
                <span className={l.id === "german" ? "display italic" : "cjk"} lang={l.id === "japanese" ? "ja" : l.id === "chinese" ? "zh" : "de"}>
                  {l.native}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <p className="lang-body">{languagesCopy.body}</p>
        <div className="lang-actions">
          <button type="button" className="btn btn-navy" onClick={() => goToConsultation({ course: lang.formCourse })}>
            {languagesCopy.cta}
          </button>
          <span className="caps lang-count">
            {String(index + 1).padStart(2, "0")} / {String(languages.length).padStart(2, "0")}
          </span>
        </div>
      </div>
      <div ref={foot} className="lang-foot caps hide-mobile" aria-hidden="true">
        <span>
          {String(index + 1).padStart(2, "0")} · {lang.name}
        </span>
        {index < languages.length - 1 && <span>Next · {next.native}</span>}
      </div>
    </section>
  );
}
