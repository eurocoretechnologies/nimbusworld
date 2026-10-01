"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshStandardMaterial, PlaneGeometry, type Group, type Texture } from "three";
import { lerp } from "@/lib/math";
import { clock } from "../sceneClock";
import { courseLift, dealt, SHEET_H, SHEET_W, SLOTS, STACK } from "./courseState";

/**
 * Chapter 03: five course pages, dealt across the spread like proofs on a
 * desk; each in turn lifts toward the reader.
 */
export function Courses({ prints }: { prints: Texture[] }) {
  const refs = useRef<(Group | null)[]>([]);
  const { plane, mats } = useMemo(() => {
    const plane = new PlaneGeometry(SHEET_W, SHEET_H);
    plane.rotateX(-Math.PI / 2);
    const mats = prints.map((map) => new MeshStandardMaterial({ map, roughness: 0.9 }));
    return { plane, mats };
  }, [prints]);

  useEffect(
    () => () => {
      plane.dispose();
      mats.forEach((m) => m.dispose());
    },
    [plane, mats],
  );

  useFrame(() => {
    const p = clock.p;
    SLOTS.forEach((slot, i) => {
      const g = refs.current[i];
      if (!g) return;
      const d = dealt(p, i);
      g.visible = d > 0.001;
      if (!g.visible) return;
      const lift = courseLift(p, i);
      // Lower sheets sit under their neighbours; the lifted sheet rides above all.
      const baseY = 0.004 + i * 0.0026;
      g.position.set(lerp(STACK.x, slot.x, d), baseY + lift * 0.2, lerp(STACK.z, slot.z, d) + lift * 0.12);
      g.rotation.set(lift * 0.42, lerp(0, slot.r, d) * (1 - lift), 0);
      g.scale.setScalar(lerp(0.9, 1, d) * (1 + lift * 0.08));
    });
  });

  return (
    <group>
      {mats.map((m, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          visible={false}
        >
          <mesh geometry={plane} material={m} castShadow receiveShadow />
        </group>
      ))}
    </group>
  );
}
