"use client";

import { useRef } from "react";
import { navigation } from "@/data/content";
import { useProgressValue, useScrub } from "@/hooks/useProgress";
import { onPaperAt } from "@/lib/surface";
import { goToChapter, goToConsultation } from "@/lib/navigation";
import { scrollToY } from "@/lib/scroll";
import { useExperience } from "@/store/experience";
import { BrandLogo } from "./BrandLogo";

export function Header({ hasLogo }: { hasLogo: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const setIndexOpen = useExperience((s) => s.setIndexOpen);
  const formInView = useExperience((s) => s.formInView);
  const paperBehind = useProgressValue(onPaperAt);
  const mode = useExperience((s) => s.mode);
  const diving = useExperience((s) => s.selectedDestination !== null);
  const onPaper = formInView || (mode === "cinematic" && (paperBehind || diving));

  // Once the film is under way the bar tightens and recedes.
  useScrub(ref, (el, p) => {
    el.classList.toggle("is-compact", p > 0.012 || mode === "editorial");
  });

  return (
    <header ref={ref} className={`site-header ${onPaper ? "on-paper" : ""} ${mode === "editorial" ? "is-editorial" : ""} ${formInView ? "is-solid" : ""}`}>
      <a
        href="#top"
        className="site-header__logo"
        onClick={(e) => {
          e.preventDefault();
          scrollToY(0, 2.4);
        }}
      >
        <BrandLogo hasLogo={hasLogo} height={81} plate={!onPaper} priority />
      </a>
      <nav aria-label="Primary" className="site-header__nav">
        <button type="button" className="nav-link" onClick={() => setIndexOpen(true)} aria-haspopup="dialog">
          {navigation.chapters}
          <span className="nav-ribbon" aria-hidden="true" />
        </button>
        <button type="button" className="nav-link hide-mobile" onClick={() => goToChapter("destinations")}>
          {navigation.explore}
        </button>
        <button type="button" className="nav-link hide-mobile" onClick={() => goToConsultation()}>
          {navigation.contact}
        </button>
        <button type="button" className="btn btn-outline nav-cta hide-mobile" onClick={() => goToConsultation()}>
          {navigation.start}
        </button>
      </nav>
    </header>
  );
}
