"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import type { Mesh, PointLight } from "three";
import { BOOK, PUNE } from "./constants";
import { clock } from "./sceneClock";
import { bookPose } from "./book/bookPose";
import { puneGlow } from "./prologue/PuneCity";

/**
 * A studio built from light cards (no HDR download): one soft warm key
 * casting the shadows, a cool rim, and a procedural environment for the
 * foil and leather reflections.
 */
export function Lighting({ isMobile }: { isMobile: boolean }) {
  const pune = useRef<PointLight>(null);
  const ground = useRef<Mesh>(null);

  useFrame(() => {
    const p = clock.p;
    pune.current!.intensity = 0.55 * puneGlow(p);
    const k = bookPose(p).thickness;
    ground.current!.position.y = -(k * BOOK.half + BOOK.cover) - 0.0012;
  });

  return (
    <>
      <hemisphereLight args={["#C9D3EA", "#141824", 0.5]} />
      <directionalLight
        castShadow
        position={[-2.3, 4.4, 2.4]}
        intensity={2.4}
        color="#FFF1DF"
        shadow-mapSize={isMobile ? [1024, 1024] : [2048, 2048]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.012}
        shadow-camera-left={-2.4}
        shadow-camera-right={2.4}
        shadow-camera-top={2.4}
        shadow-camera-bottom={-2.4}
        shadow-camera-near={1}
        shadow-camera-far={12}
      />
      <directionalLight position={[3.2, 1.6, -2.4]} intensity={0.45} color="#9FB4E0" />
      <pointLight ref={pune} position={[PUNE[0], 0.12, PUNE[1]]} color="#FFD9A0" intensity={0} distance={0.7} decay={2} />

      <mesh ref={ground} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <shadowMaterial transparent opacity={0.55} />
      </mesh>

      <Environment resolution={isMobile ? 128 : 256} frames={1} environmentIntensity={0.55}>
        <Lightformer form="rect" intensity={3} color="#FFF1DC" position={[-3, 4, 2.5]} scale={[4, 2.4, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.2} color="#C9D6F2" position={[3.5, 2.5, -2]} scale={[3, 3, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={1.6} color="#FFE7C4" position={[0, 5, -3]} scale={2.5} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.6} color="#8FA3CC" position={[0, -2, 4]} scale={[6, 1, 1]} target={[0, 0, 0]} />
      </Environment>
    </>
  );
}
