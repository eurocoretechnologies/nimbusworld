"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { detectCapabilities } from "@/lib/capabilities";
import { TRACK_VH } from "@/lib/timeline";
import { useExperience } from "@/store/experience";
import { useMasterTimeline } from "@/hooks/useMasterTimeline";
import { useSoundDirector } from "@/hooks/useSoundDirector";
import { Header } from "./Header";
import { ChapterRibbon } from "./ChapterRibbon";
import { ChapterIndex } from "./ChapterIndex";
import { Loader } from "./Loader";
import { CinematicOverlays } from "@/sections/overlays/CinematicOverlays";
import { EditorialExperience } from "@/sections/editorial/EditorialExperience";
import { ConsultationSection } from "@/sections/ConsultationSection";
import { Footer } from "@/sections/Footer";

const Stage = dynamic(() => import("@/three/Stage"), { ssr: false });

export function Experience({ hasLogo }: { hasLogo: boolean }) {
  const mode = useExperience((s) => s.mode);
  const isMobile = useExperience((s) => s.isMobile);
  const setMode = useExperience((s) => s.setMode);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const caps = detectCapabilities();
    setMode(caps.webgl && !caps.reducedMotion ? "cinematic" : "editorial", caps.isMobile);
    // Always start the film from the first frame.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, [setMode]);

  useMasterTimeline(trackRef, mode === "cinematic");
  useSoundDirector();

  const cinematic = mode !== "editorial";

  return (
    <>
      <a className="skip-link" href="#consult">
        Skip to the consultation form
      </a>
      <Header hasLogo={hasLogo} />
      {mode === "cinematic" && <Stage isMobile={isMobile} />}
      {mode === "cinematic" && <div className="grain" aria-hidden="true" />}

      <main id="top">
        {cinematic ? (
          <>
            <ChapterRibbon />
            <div ref={trackRef} className="track" style={{ height: `${isMobile ? TRACK_VH.mobile : TRACK_VH.desktop}vh` }}>
              <CinematicOverlays />
            </div>
          </>
        ) : (
          <EditorialExperience />
        )}
        <ConsultationSection />
      </main>
      <Footer hasLogo={hasLogo} />
      <ChapterIndex hasLogo={hasLogo} />
      <Loader hasLogo={hasLogo} />
    </>
  );
}
