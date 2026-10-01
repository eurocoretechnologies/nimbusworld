"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { courses, coursesCopy } from "@/data/content";
import { usePresence } from "@/hooks/usePresence";
import { useProgressValue } from "@/hooks/useProgress";
import { range } from "@/lib/math";
import { goToConsultation, goToSegment } from "@/lib/navigation";
import { local } from "@/lib/timeline";
import { activeCourse } from "@/three/courses/courseState";

const EASE = [0.22, 1, 0.36, 1] as const;

const presence = (p: number) => Math.min(range(0.06, 0.18, local(p, "courses")), 1 - range(0, 0.1, local(p, "languages")));
const focusPresence = (p: number) => Math.min(range(0.3, 0.38, local(p, "courses")), 1 - range(0, 0.08, local(p, "languages")));

export function CoursesOverlay() {
  const head = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  usePresence(head, presence);
  usePresence(bar, focusPresence);
  const index = useProgressValue(activeCourse);
  const course = courses[index];

  return (
    <section className="overlay chapter-overlay" aria-labelledby="courses-title">
      <div ref={head} className="chapter-head">
        <div className="chapter-head__title">
          <div className="kicker">{coursesCopy.kicker}</div>
          <h2 id="courses-title" className="display">
            {coursesCopy.title} <em>{coursesCopy.titleItalic}</em>
          </h2>
        </div>
        <p className="chapter-head__intro hide-mobile">{coursesCopy.intro}</p>
      </div>

      <div ref={bar} className="course-bar">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={course.id}
            className="course-bar__detail"
            aria-live="polite"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div className="kicker">
              {course.numeral} · {course.kicker}
            </div>
            <h3 className="course-bar__title">{course.title}</h3>
            <p>{course.description}</p>
            <p className="course-focus__soon">{course.details}</p>
          </motion.div>
        </AnimatePresence>
        <div className="course-bar__controls">
          <ol className="course-bar__index" aria-label="Courses">
            {courses.map((c, i) => (
              <li key={c.id}>
                <button
                  type="button"
                  className={i === index ? "is-active" : ""}
                  aria-current={i === index ? "true" : undefined}
                  aria-label={c.title}
                  onClick={() => goToSegment("courses", 0.34 + ((i + 0.5) / courses.length) * 0.6)}
                >
                  {c.numeral}
                </button>
              </li>
            ))}
          </ol>
          <div className="course-bar__actions">
            <button type="button" className="chapter-foot__link" onClick={() => goToConsultation({ course: course.formCourse })}>
              {coursesCopy.advisor}
            </button>
            <button type="button" className="btn btn-solid" onClick={() => goToConsultation({ course: course.formCourse })}>
              {coursesCopy.explore}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
