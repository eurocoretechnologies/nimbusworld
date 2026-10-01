"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { clock } from "../sceneClock";

import type { LineArtState } from "./lineArtState";

export type { LineArtState };

interface LineArtProps {
  segments: Float32Array;
  color: string;
  width?: number;
  state: (p: number) => LineArtState;
  position?: [number, number, number];
  scale?: number;
  rotationY?: number;
}

/** Ink linework that draws itself up out of the page and folds back into it. */
export function LineArt({ segments, color, width = 1.3, state, position = [0, 0, 0], scale = 1, rotationY = 0 }: LineArtProps) {
  const group = useRef<Group>(null);
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);

  const { line, material, geometry, count } = useMemo(() => {
    const geometry = new LineSegmentsGeometry();
    geometry.setPositions(segments);
    const material = new LineMaterial({ color, linewidth: width, transparent: true, depthWrite: false, opacity: 1 });
    const line = new LineSegments2(geometry, material);
    line.frustumCulled = false;
    line.renderOrder = 5;
    return { line, material, geometry, count: segments.length / 6 };
  }, [segments, color, width]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useEffect(() => {
    material.resolution.set(size.width * dpr, size.height * dpr);
    material.linewidth = width * dpr;
  }, [material, size, dpr, width]);

  useFrame(() => {
    const s = state(clock.p);
    const visible = s.draw > 0.001 && s.fold < 0.999;
    group.current!.visible = visible;
    if (!visible) return;
    geometry.instanceCount = Math.max(1, Math.floor(count * Math.min(1, s.draw)));
    group.current!.scale.set(scale, scale * Math.max(0.001, 1 - s.fold), scale);
    material.opacity = (s.opacity ?? 1) * (1 - s.fold * 0.6);
  });

  return (
    <group ref={group} position={position} rotation-y={rotationY} visible={false}>
      <primitive object={line} />
    </group>
  );
}
