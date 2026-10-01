"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshStandardMaterial, PlaneGeometry, type Mesh, type Texture } from "three";
import { COLORS } from "../constants";
import { clock } from "../sceneClock";
import { LineArt } from "../lineart/LineArt";
import { glyphOpacity, lineState } from "./languageState";
import { cityGate, pagodaAndTorii, roundTemple } from "../lineart/drawings";

/**
 * Chapter 04: the page turns typographic. Each language is printed as one
 * large ink glyph, and the ink rises into the architecture it belongs to.
 */
export function Languages({ glyphs }: { glyphs: Texture[] }) {
  const refs = useRef<(Mesh | null)[]>([]);
  const drawings = useMemo(() => [pagodaAndTorii(), cityGate(), roundTemple()], []);
  const states = useMemo(() => [0, 1, 2].map(lineState), []);

  const { plane, mats } = useMemo(() => {
    const plane = new PlaneGeometry(2.62, 1.715);
    plane.rotateX(-Math.PI / 2);
    const mats = glyphs.map(
      (map) =>
        new MeshStandardMaterial({ map, transparent: true, depthWrite: false, roughness: 0.9, opacity: 0, polygonOffset: true, polygonOffsetFactor: -3 }),
    );
    return { plane, mats };
  }, [glyphs]);

  useEffect(
    () => () => {
      plane.dispose();
      mats.forEach((m) => m.dispose());
    },
    [plane, mats],
  );

  useFrame(() => {
    mats.forEach((m, i) => {
      m.opacity = glyphOpacity(clock.p, i);
      const mesh = refs.current[i];
      if (mesh) mesh.visible = m.opacity > 0.001;
    });
  });

  return (
    <group>
      {mats.map((m, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          geometry={plane}
          material={m}
          position={[0, 0.0035, 0]}
          renderOrder={3}
          visible={false}
        />
      ))}
      <LineArt segments={drawings[0]} color={COLORS.navy} width={1.6} state={states[0]} position={[-0.18, 0, -0.05]} scale={1.08} />
      <LineArt segments={drawings[1]} color={COLORS.navy} width={1.5} state={states[1]} position={[0, 0, -0.05]} scale={1.02} />
      <LineArt segments={drawings[2]} color={COLORS.navy} width={1.5} state={states[2]} position={[0, 0, -0.02]} scale={1.1} />
    </group>
  );
}
