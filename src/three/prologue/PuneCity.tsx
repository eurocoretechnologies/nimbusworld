"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  CatmullRomCurve3,
  Float32BufferAttribute,
  MeshStandardMaterial,
  Object3D,
  SpriteMaterial,
  Vector3,
  type Group,
  type InstancedMesh,
  type Mesh,
  type Sprite,
  type Texture,
} from "three";
import { easeOutCubic, range, seeded, window4 } from "@/lib/math";
import { local } from "@/lib/timeline";
import { COLORS, MAP_ZOOM_MAX, PUNE } from "../constants";
import { clock } from "../sceneClock";
import { mapZoom } from "../map/mapState";

/** Strength of the point of light on the page (shared with the lighting rig). */
export function puneGlow(p: number) {
  return window4(local(p, "pune"), 0.0, 0.2, 0.55, 0.95) * (1 - range(0, 0.2, local(p, "pullback")));
}

/** City radius in world units while the page is at city scale. */
const CITY_RADIUS = 0.36;

interface Block {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  r: number;
  rot: number;
}

// The river in normalised city space (radius 1), running west → east.
const RIVER = [
  new Vector3(-1.2, 0, 0.28),
  new Vector3(-0.6, 0, 0.12),
  new Vector3(-0.15, 0, 0.2),
  new Vector3(0.25, 0, -0.02),
  new Vector3(0.7, 0, 0.1),
  new Vector3(1.25, 0, -0.12),
];

function buildBlocks(count: number): Block[] {
  const rand = seeded(1852);
  const river = new CatmullRomCurve3(RIVER);
  const riverPts = river.getSpacedPoints(80);
  const blocks: Block[] = [];
  const step = 0.07;
  for (let gz = -1; gz <= 1; gz += step) {
    for (let gx = -1; gx <= 1; gx += step) {
      const jx = gx + (rand() - 0.5) * step * 0.35;
      const jz = gz + (rand() - 0.5) * step * 0.35;
      const r = Math.hypot(jx, jz * 1.15);
      if (r > 0.78 + rand() * 0.28) continue;
      let dRiver = Infinity;
      for (const q of riverPts) dRiver = Math.min(dRiver, Math.hypot(q.x - jx, q.z - jz));
      if (dRiver < 0.075) continue;
      if (rand() < 0.12) continue; // squares and gardens
      const centre = Math.pow(Math.max(0, 1 - r), 2.2);
      const h = 0.025 + rand() * 0.05 + centre * (0.12 + rand() * 0.26);
      blocks.push({
        x: jx,
        z: jz,
        w: step * (0.5 + rand() * 0.32),
        d: step * (0.5 + rand() * 0.32),
        h,
        r,
        rot: (rand() - 0.5) * 0.25,
      });
    }
  }
  blocks.sort((a, b) => a.r - b.r);
  return blocks.slice(0, count);
}

function riverGeometry() {
  const curve = new CatmullRomCurve3(RIVER);
  const pts = curve.getSpacedPoints(120);
  const pos: number[] = [];
  const idx: number[] = [];
  const width = 0.028;
  pts.forEach((p, i) => {
    const t = curve.getTangentAt(i / (pts.length - 1));
    const nx = -t.z;
    const nz = t.x;
    const w = width * (0.8 + 0.4 * Math.sin(i * 0.21));
    pos.push(p.x + nx * w, 0, p.z + nz * w, p.x - nx * w, 0, p.z - nz * w);
    if (i > 0) {
      const a = (i - 1) * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  });
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/**
 * Pune in miniature: a point of light on the page, then paper-white blocks
 * rising from it. The city is scaled with the map during the pull-back so it
 * shrinks into the origin marker rather than disappearing.
 */
export function PuneCity({ glow, isMobile }: { glow: Texture; isMobile: boolean }) {
  const city = useRef<Group>(null);
  const blocksRef = useRef<InstancedMesh>(null);
  const river = useRef<Mesh>(null);
  const sprite = useRef<Sprite>(null);
  const core = useRef<Mesh>(null);

  const blocks = useMemo(() => buildBlocks(isMobile ? 160 : 300), [isMobile]);
  const resources = useMemo(() => {
    const box = new BoxGeometry(1, 1, 1);
    box.translate(0, 0.5, 0);
    return {
      box,
      river: riverGeometry(),
      blockMat: new MeshStandardMaterial({ color: COLORS.paperWhite, roughness: 0.86 }),
      riverMat: new MeshStandardMaterial({ color: COLORS.river, roughness: 0.6, transparent: true, opacity: 0 }),
      spriteMat: new SpriteMaterial({ map: glow, blending: AdditiveBlending, depthWrite: false, transparent: true }),
      coreMat: new MeshStandardMaterial({ color: "#FFF3D6", emissive: "#FFE2A8", emissiveIntensity: 3 }),
    };
  }, [glow]);

  useEffect(
    () => () => {
      resources.box.dispose();
      resources.river.dispose();
      resources.blockMat.dispose();
      resources.riverMat.dispose();
      resources.spriteMat.dispose();
      resources.coreMat.dispose();
    },
    [resources],
  );

  const dummy = useMemo(() => new Object3D(), []);
  const lastRise = useRef(-1);

  useFrame(() => {
    const p = clock.p;
    const t = local(p, "pune");
    const scale = (CITY_RADIUS * mapZoom(p)) / MAP_ZOOM_MAX;
    city.current!.scale.setScalar(scale);

    // Blocks rise from the centre outward, then stay.
    const rise = range(0.16, 0.86, t);
    if (Math.abs(rise - lastRise.current) > 1e-4) {
      lastRise.current = rise;
      const mesh = blocksRef.current!;
      blocks.forEach((b, i) => {
        const local01 = easeOutCubic(range(b.r * 0.55, b.r * 0.55 + 0.45, rise));
        dummy.position.set(b.x, 0, b.z);
        dummy.rotation.set(0, b.rot, 0);
        dummy.scale.set(b.w, Math.max(0.0001, b.h * local01), b.d);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.visible = rise > 0;
    }
    resources.riverMat.opacity = 0.85 * range(0.3, 0.7, t);
    river.current!.visible = resources.riverMat.opacity > 0.001;

    // The point of light: appears, seeds the city, then settles to a warm glow.
    const glowAmt = puneGlow(p);
    const sprScale = 0.05 + 0.13 * range(0, 0.2, t);
    sprite.current!.scale.setScalar(sprScale * (0.4 + 0.6 * glowAmt) / Math.max(scale, 1e-4));
    resources.spriteMat.opacity = glowAmt;
    sprite.current!.visible = glowAmt > 0.002;
    core.current!.visible = glowAmt > 0.002;
    core.current!.scale.setScalar(0.012 / Math.max(scale, 1e-4) * (0.5 + glowAmt * 0.5));
  });

  return (
    <group position={[PUNE[0], 0.001, PUNE[1]]}>
      <group ref={city}>
        <instancedMesh ref={blocksRef} args={[resources.box, resources.blockMat, blocks.length]} castShadow receiveShadow visible={false} />
        <mesh ref={river} geometry={resources.river} material={resources.riverMat} position-y={0.004} receiveShadow />
        <mesh ref={core} position-y={0.03}>
          <sphereGeometry args={[1, 16, 12]} />
          <primitive object={resources.coreMat} attach="material" />
        </mesh>
        <sprite ref={sprite} material={resources.spriteMat} position-y={0.03} />
      </group>
    </group>
  );
}
