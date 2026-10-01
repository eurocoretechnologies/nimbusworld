"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferGeometry,
  Line,
  LineBasicMaterial,
  MeshBasicMaterial,
  QuadraticBezierCurve3,
  SphereGeometry,
  SpriteMaterial,
  Vector3,
  type Mesh,
  type Sprite,
  type Texture,
} from "three";
import { range, window4 } from "@/lib/math";
import { stepLeafTurn } from "./journeyState";
import { local } from "@/lib/timeline";
import { COLORS } from "../constants";
import { clock } from "../sceneClock";
import { Leaf, type LeafHandle } from "../book/Leaf";
import { LineArt, type LineArtState } from "../lineart/LineArt";
import { skyline, terminalVault, university } from "../lineart/drawings";

const vaultState = (p: number): LineArtState => {
  const j = local(p, "journey");
  return { draw: range(0.41, 0.5, j), fold: range(0.55, 0.61, j) };
};
const universityState = (p: number): LineArtState => {
  const j = local(p, "journey");
  return { draw: range(0.82, 0.9, j), fold: range(0.0, 0.1, local(p, "finale")) };
};
const skylineState = (p: number): LineArtState => {
  const j = local(p, "journey");
  return { draw: range(0.88, 0.97, j), fold: range(0.0, 0.1, local(p, "finale")), opacity: 0.75 };
};

/**
 * Chapter 07: pages turn through the steps, become a terminal vault, a flight
 * lifts off the page, the paper world wraps into a globe, and a university
 * and a city draw themselves in.
 */
export function Journey({ stepPrints, leafBack, glow, isMobile }: { stepPrints: Texture[]; leafBack: Texture; glow: Texture; isMobile: boolean }) {
  const leaves = useRef<(LeafHandle | null)[]>([]);
  const dawn = useRef<Sprite>(null);
  const head = useRef<Mesh>(null);
  const headGlow = useRef<Sprite>(null);
  const drawings = useMemo(() => ({ vault: terminalVault(), uni: university(), city: skyline() }), []);

  const flight = useMemo(() => {
    const curve = new QuadraticBezierCurve3(new Vector3(0.1, 0.02, 0.55), new Vector3(0.15, 0.55, -0.1), new Vector3(0.05, 1.45, -0.9));
    const pts = curve.getPoints(80);
    const line = new Line(new BufferGeometry().setFromPoints(pts), new LineBasicMaterial({ color: COLORS.goldLight, transparent: true }));
    line.renderOrder = 6;
    return { curve, line, count: pts.length };
  }, []);

  const res = useMemo(
    () => ({
      dawnMat: new SpriteMaterial({ map: glow, color: "#F2D39A", blending: AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }),
      headMat: new MeshBasicMaterial({ color: "#FFF3D6" }),
      headGlowMat: new SpriteMaterial({ map: glow, blending: AdditiveBlending, depthWrite: false, transparent: true }),
      headGeo: new SphereGeometry(0.008, 12, 8),
    }),
    [glow],
  );

  useEffect(
    () => () => {
      flight.line.geometry.dispose();
      (flight.line.material as LineBasicMaterial).dispose();
      res.dawnMat.dispose();
      res.headMat.dispose();
      res.headGlowMat.dispose();
      res.headGeo.dispose();
    },
    [flight, res],
  );

  const tmp = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const p = clock.p;
    const j = local(p, "journey");

    // Only a moving leaf, or the next page waiting on top of the stack, is drawn.
    let topShown = false;
    leaves.current.forEach((leaf, i) => {
      if (!leaf) return;
      const t = stepLeafTurn(p, i);
      leaf.uniforms.uTurn.value = t;
      leaf.uniforms.uLift.value = 0.0016 + 0.0004 * (stepPrints.length - i);
      const moving = t > 0.001 && t < 0.999;
      const waiting = !topShown && t <= 0.001 && j > 0.03 && j < 0.44;
      if (waiting) topShown = true;
      leaf.setVisible(moving || waiting);
    });

    const d = window4(j, 0.42, 0.48, 0.55, 0.61);
    res.dawnMat.opacity = d * 0.9;
    dawn.current!.visible = d > 0.001;

    const fly = range(0.54, 0.66, j);
    const flyOut = 1 - range(0.66, 0.72, j);
    const lineVisible = fly > 0.001 && flyOut > 0.001;
    flight.line.visible = lineVisible;
    flight.line.geometry.setDrawRange(0, Math.floor(flight.count * fly));
    (flight.line.material as LineBasicMaterial).opacity = 0.9 * flyOut;
    head.current!.visible = headGlow.current!.visible = lineVisible && fly < 0.999;
    if (lineVisible) {
      flight.curve.getPoint(fly, tmp);
      head.current!.position.copy(tmp);
      headGlow.current!.position.copy(tmp);
      res.headGlowMat.opacity = flyOut;
    }
  });

  return (
    <group>
      {stepPrints.map((front, i) => (
        <Leaf
          key={i}
          ref={(h) => {
            leaves.current[i] = h;
          }}
          front={front}
          back={leafBack}
          segments={isMobile ? 18 : 30}
          curl={0.75}
        />
      ))}
      <LineArt segments={drawings.vault} color="#C9B48A" width={1.5} state={vaultState} />
      <sprite ref={dawn} material={res.dawnMat} position={[0, 0.06, -0.95]} scale={[1.6, 0.45, 1]} visible={false} />
      <primitive object={flight.line} />
      <mesh ref={head} geometry={res.headGeo} material={res.headMat} visible={false} />
      <sprite ref={headGlow} material={res.headGlowMat} scale={[0.12, 0.12, 1]} visible={false} />
      <LineArt segments={drawings.city} color={COLORS.gold} width={1.1} state={skylineState} position={[0, 0, -0.1]} />
      <LineArt segments={drawings.uni} color={COLORS.goldLight} width={1.4} state={universityState} position={[0, 0, 0.25]} scale={1.1} />
    </group>
  );
}

