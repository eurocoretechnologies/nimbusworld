"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import { PlaneGeometry, type Texture } from "three";
import { BOOK } from "../constants";
import { createLeafMaterials, type LeafUniforms } from "./pageMaterial";

export interface LeafHandle {
  uniforms: LeafUniforms;
  setVisible: (v: boolean) => void;
}

interface LeafProps {
  front: Texture;
  back: Texture;
  normalMap?: Texture;
  segments: number;
  curl?: number;
}

/** One bendable page leaf hinged on the spine (x = 0), driven by its uniforms. */
export const Leaf = forwardRef<LeafHandle, LeafProps>(function Leaf({ front, back, normalMap, segments, curl }, ref) {
  const geometry = useMemo(() => {
    const g = new PlaneGeometry(BOOK.width, BOOK.height - 0.004, segments, 1);
    g.rotateX(-Math.PI / 2);
    g.translate(BOOK.width / 2, 0, 0);
    return g;
  }, [segments]);

  const mats = useMemo(
    () => createLeafMaterials(front, back, BOOK.width, { normalMap, curl }),
    [front, back, normalMap, curl],
  );

  const meshRef = useMemo(() => ({ current: null as import("three").Mesh | null }), []);

  useImperativeHandle(
    ref,
    () => ({
      uniforms: mats.uniforms,
      setVisible: (v: boolean) => {
        if (meshRef.current) meshRef.current.visible = v;
      },
    }),
    [mats, meshRef],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      mats.material.dispose();
      mats.depth.dispose();
    },
    [geometry, mats],
  );

  return (
    <mesh
      ref={(m) => {
        meshRef.current = m;
      }}
      geometry={geometry}
      material={mats.material}
      customDepthMaterial={mats.depth}
      castShadow
      receiveShadow
      frustumCulled={false}
      visible={false}
    />
  );
});
