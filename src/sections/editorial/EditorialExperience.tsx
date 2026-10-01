"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { destinations, destinationsCopy, finale, hero, prologue } from "@/data/content";
import { goToConsultation } from "@/lib/navigation";
import { scrollToId } from "@/lib/scroll";
import { BookStill, FinaleStill, PuneStill } from "./Illustrations";
import { EditorialMap } from "./EditorialMap";
import { EditorialChapters } from "./EditorialChapters";

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: reduce ? 0.6 : 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** The static editorial edition: same story and copy, no canvas. */
export function EditorialExperience() {
  const [selected, setSelected] = useState<string | null>(null);
  const sel = destinations.find((d) => d.id === selected) ?? null;

  return (
    <div className="editorial">
      <section id="chapter-prologue" className="ed-hero" aria-labelledby="ed-hero-title">
        <Reveal className="ed-hero__art">
          <BookStill />
        </Reveal>
        <div className="ed-hero__text">
          <Reveal>
            <div className="kicker">{hero.kicker}</div>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 id="ed-hero-title" className="hero-overlay__title display">
              {hero.titleLine1}
              <br />
              <em>{hero.titleLine2}</em>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="hero-overlay__sub">{hero.supporting}</p>
          </Reveal>
          <Reveal delay={0.3} className="hero-overlay__ctas">
            <button type="button" className="btn btn-solid" onClick={() => scrollToId("ed-prologue")}>
              {hero.primaryCta}
            </button>
            <button type="button" className="btn btn-link" onClick={() => goToConsultation()}>
              {hero.secondaryCta}
            </button>
          </Reveal>
        </div>
      </section>

      <section id="ed-prologue" className="ed-spread" aria-labelledby="ed-prologue-title">
        <div className="ed-spread__page ed-spread__page--left">
          <Reveal>
            <div className="kicker kicker--deep">{prologue.kicker}</div>
            <h2 id="ed-prologue-title" className="display ed-spread__line">
              <em>{prologue.line}</em>
            </h2>
            <div className="rule" />
            <p>{prologue.body}</p>
          </Reveal>
        </div>
        <div className="ed-spread__page ed-spread__page--right">
          <Reveal className="ed-pune-label">
            <div className="display">{prologue.stages[0].label}</div>
            <div className="caps">{prologue.stages[0].detail}</div>
          </Reveal>
          <Reveal delay={0.15}>
            <PuneStill />
          </Reveal>
        </div>
        <ol className="ed-stages caps" aria-label="From Pune to the world">
          {prologue.stages.map((s) => (
            <li key={s.id}>{s.label}</li>
          ))}
        </ol>
      </section>

      <section id="chapter-destinations" className="ed-destinations" aria-labelledby="ed-dest-title">
        <Reveal>
          <div className="kicker">{destinationsCopy.kicker}</div>
          <h2 id="ed-dest-title" className="display">
            {destinationsCopy.title} <em>{destinationsCopy.titleItalic}</em>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <EditorialMap selected={selected} onSelect={setSelected} />
        </Reveal>
        <div className="ed-destinations__foot caps">
          <span>{destinationsCopy.hint}</span>
          <span>{destinationsCopy.collectionsNote}</span>
        </div>
        {sel && (
          <div className="destination-card destination-card--static" aria-live="polite">
            <div className="destination-card__meta caps">
              <span>{destinationsCopy.selectedLabel}</span>
            </div>
            <h3 className="destination-card__name display">{sel.name}</h3>
            <ol className="destination-card__path">
              {sel.path.map((step, i) => (
                <li key={step}>
                  {step}
                  {i < sel.path.length - 1 && <span aria-hidden="true">→</span>}
                </li>
              ))}
            </ol>
            <p className="destination-card__summary">{sel.summary}</p>
            <div className="destination-card__actions">
              <button type="button" className="btn btn-navy" onClick={() => goToConsultation({ destination: sel.name })}>
                {destinationsCopy.advisorCta}
              </button>
            </div>
          </div>
        )}
      </section>

      <EditorialChapters />

      <section id="chapter-finale" className="ed-finale" aria-labelledby="ed-finale-title">
        <div className="ed-finale__art">
          <FinaleStill />
          <div className="ed-finale__text">
            <div className="kicker kicker--deep">{finale.kicker}</div>
            <h2 id="ed-finale-title" className="display">
              {finale.line1}
            </h2>
            <div className="rule rule--center" />
            <p className="display">
              <em>{finale.line2}</em>
            </p>
          </div>
        </div>
        <Reveal className="finale-overlay__ctas ed-finale__ctas">
          <button type="button" className="btn btn-solid" onClick={() => goToConsultation()}>
            {finale.primaryCta}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => goToConsultation()}>
            {finale.secondaryCta}
          </button>
        </Reveal>
      </section>
    </div>
  );
}
