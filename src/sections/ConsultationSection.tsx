"use client";

import { useEffect, useRef } from "react";
import { consultation, contact } from "@/data/content";
import { useExperience } from "@/store/experience";
import { ConsultationForm } from "./ConsultationForm";

export function ConsultationSection() {
  const ref = useRef<HTMLElement>(null);
  const setFormInView = useExperience((s) => s.setFormInView);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setFormInView(entry.isIntersecting), {
      rootMargin: "0px 0px -35% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [setFormInView]);

  return (
    <section ref={ref} id="consult" className="consult" aria-labelledby="consult-title">
      <div className="consult__intro">
        <div className="kicker kicker--deep">{consultation.kicker}</div>
        <h2 id="consult-title" className="display">
          {consultation.title} <em>{consultation.titleItalic}</em>
        </h2>
        <p>{consultation.body}</p>
        <dl className="consult__contact">
          <dt>Office</dt>
          <dd>{contact.officeAddress}</dd>
          <dt>Phone</dt>
          <dd>{contact.phone}</dd>
          <dt>Email</dt>
          <dd>{contact.email}</dd>
        </dl>
      </div>
      <ConsultationForm />
    </section>
  );
}
