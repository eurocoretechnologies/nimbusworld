"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  type Group,
  type LineSegments,
  type Mesh,
} from "three";
import { range } from "@/lib/math";
import { local } from "@/lib/timeline";
import { COLORS, PUNE } from "../constants";
import { clock } from "../sceneClock";
import { spreadClipPlanes } from "./clipping";
import { loadRelief } from "./loadRelief";
import type { ReliefBuffers } from "./buildRelief";
import { globeMorph, globeSpin, mapPresence, mapZoom, RELIEF_HEIGHT } from "./mapState";
import { applyGlobeMorph, GLOBE_CENTER, GLOBE_RADIUS, globeUniforms } from "./globeMorph";

const PAGE = new Color(COLORS.ivory);
/** Land sits clear of the page plane so the two never share a depth. */
const LAND_BASE = 0.0016;
const LAND = new Color(COLORS.paperWhite);

/**
 * The world, rising out of the paper. The whole map zooms about Pune's
 * position on the page, so the pull-back from city to planet is one
 * continuous scale change rather than a cut.
 */
export function WorldMap({ isMobile }: { isMobile: boolean }) {
  const [buffers, setBuffers] = useState<ReliefBuffers | null>(null);

  useEffect(() => {
    let alive = true;
    loadRelief(isMobile ? "110m" : "50m").then((b) => alive && setBuffers(b));
    return () => {
      alive = false;
    };
  }, [isMobile]);

  if (!buffers) return null;
  return <WorldMapContent buffers={buffers} />;
}

function WorldMapContent({ buffers }: { buffers: ReliefBuffers }) {
  const group = useRef<Group>(null);
  const land = useRef<Mesh>(null);
  const coast = useRef<LineSegments>(null);
  const grat = useRef<LineSegments>(null);

  const ocean = useRef<Mesh>(null);
  const { geometries, materials, layers } = useMemo(() => {
    const landGeo = new BufferGeometry();
    landGeo.setAttribute("position", new BufferAttribute(buffers.positions, 3));
    landGeo.setAttribute("normal", new BufferAttribute(buffers.normals, 3));
    landGeo.setIndex(new BufferAttribute(buffers.index, 1));
    landGeo.computeBoundingSphere();
    const coastGeo = new BufferGeometry();
    coastGeo.setAttribute("position", new BufferAttribute(buffers.coast, 3));
    const gratGeo = new BufferGeometry();
    gratGeo.setAttribute("position", new BufferAttribute(buffers.graticule, 3));

    const landMat = new MeshStandardMaterial({
      color: PAGE.clone(),
      roughness: 0.88,
      clippingPlanes: spreadClipPlanes,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    });
    const coastMat = new LineBasicMaterial({
      color: COLORS.rule,
      transparent: true,
      opacity: 0,
      clippingPlanes: spreadClipPlanes,
      depthWrite: false,
    });
    const gratMat = new LineBasicMaterial({
      color: COLORS.rule,
      transparent: true,
      opacity: 0,
      clippingPlanes: spreadClipPlanes,
      depthWrite: false,
    });
    const landLayer = applyGlobeMorph(landMat, { normals: true });
    const coastLayer = applyGlobeMorph(coastMat, { normals: false });
    const gratLayer = applyGlobeMorph(gratMat, { normals: false });

    // The ocean the paper continents wrap around once the map becomes a globe.
    const oceanGeo = new SphereGeometry(GLOBE_RADIUS * 0.994, 64, 48);
    const oceanMat = new MeshStandardMaterial({ color: "#E6DDCB", roughness: 0.92, transparent: true, opacity: 0 });

    return {
      geometries: { landGeo, coastGeo, gratGeo, oceanGeo },
      materials: { landMat, coastMat, gratMat, oceanMat },
      layers: { landLayer, coastLayer, gratLayer },
    };
  }, [buffers]);

  useEffect(
    () => () => {
      Object.values(geometries).forEach((g) => g.dispose());
      Object.values(materials).forEach((m) => m.dispose());
    },
    [geometries, materials],
  );

  useFrame(() => {
    const p = clock.p;
    const presence = mapPresence(p);
    const visible = presence > 0.001;
    group.current!.visible = visible;
    if (!visible) return;

    const s = mapZoom(p);
    group.current!.position.set(PUNE[0] * (1 - s), 0, PUNE[1] * (1 - s));
    group.current!.scale.set(s, 1, s);

    const dive = clock.dive;
    const morph = globeMorph(p);
    // On the globe the relief is exaggerated a little so the coasts still read.
    const h = Math.max(0.0001, RELIEF_HEIGHT * presence * (1 + dive * 1.2 + morph * 0.6));
    land.current!.scale.y = h;
    // Coastline ink sits on the top edge of the raised paper.
    coast.current!.position.y = LAND_BASE + h + 0.0004;
    materials.landMat.color.copy(PAGE).lerp(LAND, presence);

    globeUniforms.uMorph.value = morph;
    globeUniforms.uSpin.value = globeSpin(p);
    layers.landLayer.uYScale.value = h;
    layers.coastLayer.uYOffset.value = h + 0.0015;
    layers.gratLayer.uYOffset.value = 0.001;
    materials.oceanMat.opacity = morph;
    ocean.current!.visible = morph > 0.001;
    // Shadow lookups use the flat position, so the globe does not receive them.
    land.current!.receiveShadow = morph < 0.001;

    const pull = local(p, "pullback");
    materials.coastMat.opacity = 0.75 * presence * range(0.1, 0.5, pull);
    materials.gratMat.opacity = 0.42 * presence * range(0.55, 0.9, pull);
    grat.current!.visible = materials.gratMat.opacity > 0.001;
  });

  return (
    <>
    <group ref={group} visible={false}>
      <mesh ref={land} geometry={geometries.landGeo} material={materials.landMat} position-y={LAND_BASE} receiveShadow />
      <lineSegments ref={coast} geometry={geometries.coastGeo} material={materials.coastMat} position-y={0.0009} renderOrder={1} />
      <lineSegments ref={grat} geometry={geometries.gratGeo} material={materials.gratMat} position-y={0.0012} renderOrder={1} />
    </group>
      <mesh ref={ocean} geometry={geometries.oceanGeo} material={materials.oceanMat} position={GLOBE_CENTER} visible={false} />
    </>
  );
}
