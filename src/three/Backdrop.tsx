"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { PlaneGeometry, ShaderMaterial } from "three";
import { clock } from "./sceneClock";
import { paperWorld } from "./director";

/**
 * A full-screen quad drawn behind everything: the cool key-light pool of the
 * studio, which can dissolve into a warm ivory "paper world" (Languages).
 */
export function Backdrop() {
  const { geometry, material } = useMemo(() => {
    const geometry = new PlaneGeometry(2, 2);
    const material = new ShaderMaterial({
      uniforms: { uPaper: { value: 0 }, uAspect: { value: 1 } },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 1.0, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform float uPaper;
        varying vec2 vUv;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        void main() {
          vec2 c = vUv - vec2(0.56, 0.56);
          c.x *= 1.6;
          float d = length(c);
          vec3 inkEdge = vec3(0.024, 0.031, 0.051);
          vec3 inkPool = vec3(0.105, 0.150, 0.265);
          vec3 dark = mix(inkPool, inkEdge, smoothstep(0.0, 0.62, d));
          vec3 paperCentre = vec3(0.965, 0.948, 0.918);
          vec3 paperEdge = vec3(0.870, 0.840, 0.785);
          vec3 paper = mix(paperCentre, paperEdge, smoothstep(0.1, 0.9, d));
          vec3 col = mix(dark, paper, uPaper);
          col += (hash(gl_FragCoord.xy) - 0.5) / 255.0 * 2.0; // dither against banding
          gl_FragColor = vec4(col, 1.0);
        }`,
      depthWrite: false,
      depthTest: false,
      toneMapped: false,
    });
    return { geometry, material };
  }, []);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(() => {
    material.uniforms.uPaper.value = paperWorld(clock.p);
  });

  return <mesh geometry={geometry} material={material} renderOrder={-1000} frustumCulled={false} />;
}
