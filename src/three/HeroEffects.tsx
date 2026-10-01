"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { DepthOfField, EffectComposer } from "@react-three/postprocessing";
import { Vector3 } from "three";
import type { DepthOfFieldEffect } from "postprocessing";
import { range } from "@/lib/math";
import { local } from "@/lib/timeline";
import { BOOK } from "./constants";
import { clock } from "./sceneClock";
import { bookPose } from "./book/bookPose";

/**
 * Shallow depth of field for the macro hero only. The composer is switched
 * off (not unmounted) outside the hero so the default render path costs
 * nothing extra for the rest of the film.
 */
export function HeroEffects() {
  const [enabled, setEnabled] = useState(true);
  const dof = useRef<DepthOfFieldEffect>(null);
  const focus = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const hero = local(clock.p, "hero");
    const strength = 1 - range(0.05, 0.75, hero);
    const want = strength > 0.01;
    if (want !== enabled) setEnabled(want);
    if (!dof.current) return;

    // Focus on the foil title, wherever the book currently sits.
    const pose = bookPose(clock.p);
    const lx = pose.shift + (BOOK.width + BOOK.overhang) / 2;
    const ly = BOOK.half + BOOK.cover + BOOK.gap;
    const c = Math.cos(pose.yaw);
    const s = Math.sin(pose.yaw);
    focus.set(lx * c, ly, -lx * s);
    dof.current.target = focus;
    dof.current.bokehScale = 5.5 * strength;
  });

  return (
    <EffectComposer enabled={enabled} multisampling={4}>
      <DepthOfField ref={dof} target={focus} worldFocusRange={0.16} bokehScale={5.5} />
    </EffectComposer>
  );
}
