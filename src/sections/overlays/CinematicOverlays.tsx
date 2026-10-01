"use client";

import type { SegmentId } from "@/lib/timeline";
import { useExperience } from "@/store/experience";
import { HeroOverlay } from "./HeroOverlay";
import { PrologueOverlay } from "./PrologueOverlay";
import { DestinationsOverlay } from "./DestinationsOverlay";
import { CoursesOverlay } from "./CoursesOverlay";
import { LanguagesOverlay } from "./LanguagesOverlay";
import { VisaOverlay } from "./VisaOverlay";
import { ProfessionalOverlay } from "./ProfessionalOverlay";
import { JourneyOverlay } from "./JourneyOverlay";
import { FinaleOverlay } from "./FinaleOverlay";
import { Scrims } from "./Scrims";

/** Each overlay mounts around its own segments (and its neighbours, so fades can cross). */
const MOUNT: [SegmentId[], () => React.JSX.Element][] = [
  [["hero", "open"], HeroOverlay],
  [["open", "pune", "pullback", "destinations"], PrologueOverlay],
  [["pullback", "destinations", "courses"], DestinationsOverlay],
  [["destinations", "courses", "languages"], CoursesOverlay],
  [["courses", "languages", "visa"], LanguagesOverlay],
  [["languages", "visa", "professional"], VisaOverlay],
  [["visa", "professional", "journey"], ProfessionalOverlay],
  [["professional", "journey", "finale"], JourneyOverlay],
  [["finale"], FinaleOverlay],
];

/**
 * The DOM layer over the canvas. Within their segments, overlay styles scrub
 * directly from master progress.
 */
export function CinematicOverlays() {
  const segment = useExperience((s) => s.segment);
  const formInView = useExperience((s) => s.formInView);

  return (
    <div className={`overlays ${formInView ? "is-hidden" : ""}`} inert={formInView}>
      <Scrims />
      {MOUNT.map(([segs, Overlay], i) => (segs.includes(segment) ? <Overlay key={i} /> : null))}
    </div>
  );
}
