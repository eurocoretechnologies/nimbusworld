"use client";

import { Suspense, use, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Stats } from "@react-three/drei";
import { damp } from "@/lib/math";
import { segmentOf } from "@/lib/timeline";
import { useExperience } from "@/store/experience";
import { loadSceneAssets } from "./assets";
import { clock } from "./sceneClock";
import { Book } from "./book/Book";
import { CameraRig } from "./camera/CameraRig";
import { Lighting } from "./Lighting";
import { HeroEffects } from "./HeroEffects";
import { InRange } from "./InRange";
import { PuneCity } from "./prologue/PuneCity";
import { WorldMap } from "./map/WorldMap";
import { Destinations } from "./destinations/Destinations";
import { Backdrop } from "./Backdrop";
import { Courses } from "./courses/Courses";
import { Languages } from "./languages/Languages";
import { PassportPages } from "./visa/PassportPages";
import { Professional } from "./professional/Professional";
import { Journey } from "./journey/Journey";

/**
 * Smooths the master progress into the scene clock and keeps the demand
 * frameloop alive only while something is still settling.
 */
function ProgressDriver() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(
    () =>
      useExperience.subscribe((s, prev) => {
        if (s.progress !== prev.progress) invalidate();
      }),
    [invalidate],
  );
  useFrame((_, dt) => {
    const target = useExperience.getState().progress;
    const diff = target - clock.p;
    if (Math.abs(diff) < 2e-5) {
      clock.p = target;
    } else {
      clock.p += diff * damp(9, Math.min(dt, 0.05));
      invalidate();
    }
  });
  return null;
}

/** Compiles every material once, with all objects forced visible, before the curtain lifts. */
function Prewarm() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  const setSceneReady = useExperience((s) => s.setSceneReady);
  useEffect(() => {
    let cancelled = false;
    // A timeout rather than rAF: compiling needs no frame, and rAF is paused in background tabs.
    const timer = setTimeout(() => {
      const hidden: { visible: boolean; obj: import("three").Object3D }[] = [];
      scene.traverse((o) => {
        if (!o.visible) {
          hidden.push({ visible: false, obj: o });
          o.visible = true;
        }
      });
      const done = () => {
        hidden.forEach(({ obj }) => (obj.visible = false));
        clock.warming = false;
        invalidate();
        if (!cancelled) setTimeout(() => !cancelled && setSceneReady(), 30);
      };
      gl.compileAsync(scene, camera).then(done, done);
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [gl, scene, camera, setSceneReady, invalidate]);
  return null;
}

function SceneContent({ isMobile }: { isMobile: boolean }) {
  const assets = use(loadSceneAssets(isMobile));

  const seg = (id: Parameters<typeof segmentOf>[0]) => segmentOf(id)!;
  const at = (id: Parameters<typeof segmentOf>[0], t: number) => {
    const s = seg(id);
    return s.start + (s.end - s.start) * t;
  };

  return (
    <>
      <Backdrop />
      <Lighting isMobile={isMobile} />
      <Book assets={assets} isMobile={isMobile} />
      <WorldMap isMobile={isMobile} />
      <InRange from={seg("pune").start} to={seg("pullback").end}>
        <PuneCity glow={assets.glow} isMobile={isMobile} />
      </InRange>
      <InRange from={at("pullback", 0.7)} to={at("courses", 0.15)}>
        <Destinations />
      </InRange>
      <InRange from={seg("courses").start} to={at("languages", 0.16)}>
        <Courses prints={assets.coursePrints} />
      </InRange>
      <InRange from={seg("languages").start} to={at("visa", 0.02)}>
        <Languages glyphs={assets.glyphs} />
      </InRange>
      <InRange from={at("visa", 0.3)} to={at("professional", 0.25)}>
        <PassportPages />
      </InRange>
      <InRange from={at("professional", 0.15)} to={at("journey", 0.1)}>
        <Professional prints={assets.professional} />
      </InRange>
      <InRange from={seg("journey").start} to={at("finale", 0.12)}>
        <Journey stepPrints={assets.stepPrints} leafBack={assets.leafBack} glow={assets.glow} isMobile={isMobile} />
      </InRange>
      {!isMobile && <HeroEffects />}
      <Prewarm />
    </>
  );
}

/** Dev-only: step the loop by hand (useful when the tab is hidden and rAF is paused). */
function DevHooks() {
  const advance = useThree((s) => s.advance);
  const get = useThree((s) => s.get);
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    let t = performance.now();
    Object.assign(window, {
      __nimbusThree: get,
      __nimbusSettle: (frames = 90) => {
        for (let i = 0; i < frames; i++) advance((t += 16.7), true);
      },
    });
  }, [advance]);
  return null;
}

export function Scene({ isMobile }: { isMobile: boolean }) {
  // ?debug shows a live frame-rate meter (the demand loop idles at 0 fps by design).
  const debug = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("debug");
  return (
    <>
      {debug && <Stats />}
      <ProgressDriver />
      <DevHooks />
      <CameraRig isMobile={isMobile} />
      <Suspense fallback={null}>
        <SceneContent isMobile={isMobile} />
      </Suspense>
    </>
  );
}
