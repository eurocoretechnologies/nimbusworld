"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { consultation } from "@/data/content";
import {
  courseOptions,
  destinationOptions,
  levelOptions,
  NOT_SURE,
  validateConsultation,
  type ConsultationRequest,
  type FieldErrors,
} from "@/lib/consultation";
import { useExperience } from "@/store/experience";

type Status = "idle" | "sending" | "sent" | "error";

const EMPTY: ConsultationRequest = {
  name: "",
  phone: "",
  email: "",
  level: "",
  destination: NOT_SURE,
  course: NOT_SURE,
  mode: consultation.modes[0].id,
};

export function ConsultationForm() {
  const uid = useId();
  const prefill = useExperience((s) => s.prefill);
  const [values, setValues] = useState<ConsultationRequest>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [honeypot, setHoneypot] = useState("");

  useEffect(() => {
    setValues((v) => ({
      ...v,
      destination: prefill.destination && destinationOptions.includes(prefill.destination) ? prefill.destination : v.destination,
      course: prefill.course && courseOptions.includes(prefill.course) ? prefill.course : v.course,
    }));
  }, [prefill]);

  const set = (key: keyof ConsultationRequest) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { errors: found } = validateConsultation(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      const first = Object.keys(found)[0];
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, company: honeypot }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 422 && data.fields) {
        setErrors(data.fields);
        setStatus("idle");
        return;
      }
      if (!res.ok || !data.ok) throw new Error(data.error ?? "request_failed");
      setStatus("sent");
      setValues(EMPTY);
    } catch {
      setStatus("error");
    }
  };

  const field = (key: keyof ConsultationRequest) => ({
    id: `${uid}-${key}`,
    name: key,
    value: values[key],
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${uid}-${key}-err` : undefined,
  });

  const errorFor = (key: keyof ConsultationRequest) =>
    errors[key] ? (
      <span id={`${uid}-${key}-err`} className="field__error" role="alert">
        {errors[key]}
      </span>
    ) : null;

  return (
    <div className="consult-form-wrap">
      <AnimatePresence mode="wait" initial={false}>
        {status === "sent" ? (
          <motion.div
            key="sent"
            className="consult-sent"
            role="status"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="kicker">{consultation.kicker}</div>
            <p className="display">{consultation.success}</p>
            <button type="button" className="btn btn-link on-paper" onClick={() => setStatus("idle")}>
              Send another request
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            className="consult-form"
            aria-label="Consultation request"
            noValidate
            onSubmit={onSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <label className="field" htmlFor={`${uid}-name`}>
              <span className="field__label">Full name</span>
              <input type="text" autoComplete="name" required {...field("name")} onChange={(e) => set("name")(e.target.value)} />
              {errorFor("name")}
            </label>
            <label className="field" htmlFor={`${uid}-phone`}>
              <span className="field__label">Phone</span>
              <input type="tel" autoComplete="tel" inputMode="tel" placeholder="+91" required {...field("phone")} onChange={(e) => set("phone")(e.target.value)} />
              {errorFor("phone")}
            </label>
            <label className="field" htmlFor={`${uid}-email`}>
              <span className="field__label">Email</span>
              <input type="email" autoComplete="email" required {...field("email")} onChange={(e) => set("email")(e.target.value)} />
              {errorFor("email")}
            </label>
            <label className="field" htmlFor={`${uid}-level`}>
              <span className="field__label">Current education level</span>
              <select required {...field("level")} onChange={(e) => set("level")(e.target.value)}>
                <option value="" disabled>
                  Select
                </option>
                {levelOptions.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              {errorFor("level")}
            </label>
            <label className="field" htmlFor={`${uid}-destination`}>
              <span className="field__label">Interested destination</span>
              <select {...field("destination")} onChange={(e) => set("destination")(e.target.value)}>
                {destinationOptions.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              {errorFor("destination")}
            </label>
            <label className="field" htmlFor={`${uid}-course`}>
              <span className="field__label">Interested course</span>
              <select {...field("course")} onChange={(e) => set("course")(e.target.value)}>
                {courseOptions.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              {errorFor("course")}
            </label>

            <fieldset className="field field--wide">
              <legend className="field__label">Preferred consultation mode</legend>
              <div className="mode-options">
                {consultation.modes.map((m) => (
                  <label key={m.id} className={`mode-option ${values.mode === m.id ? "is-checked" : ""}`}>
                    <input type="radio" name="mode" value={m.id} checked={values.mode === m.id} onChange={() => set("mode")(m.id)} />
                    {m.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="hp-field" aria-hidden="true">
              <label>
                Company
                <input type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
              </label>
            </div>

            <div className="consult-form__foot">
              <p>{status === "error" ? <span role="alert" className="field__error">{consultation.error}</span> : consultation.privacy}</p>
              <button type="submit" className="btn btn-navy" disabled={status === "sending"} aria-busy={status === "sending"}>
                {status === "sending" ? "Sending…" : consultation.submit}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
