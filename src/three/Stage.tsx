"use client";

import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";
import { Scene } from "./Scene";

/** The single persistent WebGL canvas, fixed behind the DOM for the whole film. */
export default function Stage({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="stage" aria-hidden="true">
      <Canvas
        frameloop="demand"
        dpr={[1, isMobile ? 1.5 : 1.75]}
        shadows
        camera={{ fov: 28, near: 0.08, far: 30, position: [0.4, 0.4, 0.4] }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.12,
        }}
        onCreated={({ gl }) => {
          gl.localClippingEnabled = true;
        }}
      >
        <Scene isMobile={isMobile} />
      </Canvas>
    </div>
  );
}
