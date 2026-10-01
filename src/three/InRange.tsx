"use client";

import { useState, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { clock } from "./sceneClock";

/**
 * Mounts its children only while master progress is within [from, to]
 * (plus a small margin), so chapter objects cost nothing off-screen and
 * their GPU resources are released when unmounted.
 */
export function InRange({ from, to, margin = 0.015, children }: { from: number; to: number; margin?: number; children: ReactNode }) {
  const [active, setActive] = useState(() => clock.warming);
  useFrame(() => {
    const inside = clock.warming || (clock.p >= from - margin && clock.p <= to + margin);
    if (inside !== active) setActive(inside);
  });
  return active ? <>{children}</> : null;
}
