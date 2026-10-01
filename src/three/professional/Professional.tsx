"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BoxGeometry,
  BufferGeometry,
  CatmullRomCurve3,
  DoubleSide,
  Line,
  LineBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Vector3,
  type Group,
  type Mesh,
  type Texture,
} from "three";
import { easeInOutCubic, easeOutCubic, range } from "@/lib/math";
import { local } from "@/lib/timeline";
import type { ProfessionalPrints } from "../chapterPrints";
import { clock } from "../sceneClock";

const TILE_W = 0.15;
const HALF_H = 0.105;
const GAP = 0.012;

/** 0..1 of pop-up i standing up off the page. */
export function popUp(p: number, i: number) {
  const pr = local(p, "professional");
  const up = easeOutCubic(range(0.2 + i * 0.07, 0.4 + i * 0.07, pr));
  const fold = easeInOutCubic(range(0.0, 0.07, local(p, "journey")));
  return Math.min(up, 1 - fold);
}

function flapFall(p: number, i: number) {
  const pr = local(p, "professional");
  return easeInOutCubic(range(0.38 + i * 0.05, 0.47 + i * 0.05, pr));
}

/** Rotation that stands a pop-up from flat (face up, lying away from the reader) to nearly upright. */
function hinge(amount: number) {
  return -Math.PI / 2 + (Math.PI / 2 - 0.1) * amount;
}

/**
 * Chapter 06: pathways as physical objects that pop up from the page — a
 * split-flap departures board spelling IATA, a luggage tag from Pune, and an
 * application stack.
 */
export function Professional({ prints }: { prints: ProfessionalPrints }) {
  const boardRef = useRef<Group>(null);
  const tagRef = useRef<Group>(null);
  const docsRef = useRef<Group>(null);
  const flapRefs = useRef<(Group | null)[]>([]);
  const labelRefs = useRef<(Mesh | null)[]>([]);

  const res = useMemo(() => {
    const half = new PlaneGeometry(TILE_W, HALF_H);
    const halfBack = new PlaneGeometry(TILE_W, HALF_H).rotateX(Math.PI);
    const housing = new BoxGeometry(TILE_W * 4 + GAP * 5, HALF_H * 2 + 0.05, 0.03);
    const tagPlane = new PlaneGeometry(0.3, 0.4);
    const docPlane = new PlaneGeometry(0.34, 0.43);
    const labelPlane = new PlaneGeometry(0.52, 0.18).rotateX(-Math.PI / 2);
    const mat = (map: Texture, extra: Partial<MeshStandardMaterial> = {}) =>
      Object.assign(new MeshStandardMaterial({ map, roughness: 0.55 }), extra);
    const blank = mat(prints.blank);
    const flaps = prints.flaps.map((f) => ({ top: mat(f.top), bottom: mat(f.bottom) }));
    const housingMat = new MeshStandardMaterial({ color: "#070B16", roughness: 0.6 });
    const tagMat = new MeshStandardMaterial({ map: prints.tag, alphaTest: 0.5, side: DoubleSide, roughness: 0.85 });
    const docFront = new MeshStandardMaterial({ map: prints.docFront, side: DoubleSide, roughness: 0.9 });
    const docBack = new MeshStandardMaterial({ map: prints.docBack, side: DoubleSide, roughness: 0.9 });
    const labels = prints.labels.map(
      (map) => new MeshStandardMaterial({ map, transparent: true, depthWrite: false, opacity: 0, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2 }),
    );
    const stringCurve = new CatmullRomCurve3([
      new Vector3(0, 0.37, 0.005),
      new Vector3(0.04, 0.45, 0.02),
      new Vector3(0.1, 0.43, 0.03),
      new Vector3(0.12, 0.34, 0.02),
    ]);
    const string = new Line(new BufferGeometry().setFromPoints(stringCurve.getPoints(24)), new LineBasicMaterial({ color: "#8A7E68" }));
    return { half, halfBack, housing, tagPlane, docPlane, labelPlane, blank, flaps, housingMat, tagMat, docFront, docBack, labels, string };
  }, [prints]);

  useEffect(
    () => () => {
      [res.half, res.halfBack, res.housing, res.tagPlane, res.docPlane, res.labelPlane, res.string.geometry].forEach((g) => g.dispose());
      [res.blank, res.housingMat, res.tagMat, res.docFront, res.docBack, ...res.labels, ...res.flaps.flatMap((f) => [f.top, f.bottom])].forEach((m) => m.dispose());
      (res.string.material as LineBasicMaterial).dispose();
    },
    [res],
  );

  useFrame(() => {
    const p = clock.p;
    const pops = [popUp(p, 0), popUp(p, 1), popUp(p, 2)];
    [boardRef, tagRef, docsRef].forEach((ref, i) => {
      const g = ref.current!;
      g.visible = pops[i] > 0.001;
      g.rotation.x = hinge(pops[i]);
    });
    flapRefs.current.forEach((f, i) => {
      if (f) f.rotation.x = Math.PI * flapFall(p, i);
    });
    labelRefs.current.forEach((m, i) => {
      if (!m) return;
      const mat = res.labels[i];
      mat.opacity = range(0.6, 1, pops[i]);
      m.visible = mat.opacity > 0.001;
    });
  });

  const boardW = TILE_W * 4 + GAP * 5;

  return (
    <group>
      {/* Pathway I — split-flap board */}
      <group position={[-0.78, 0.002, 0.22]}>
        <group ref={boardRef} visible={false}>
          <mesh geometry={res.housing} material={res.housingMat} position={[0, HALF_H + 0.025, -0.017]} castShadow />
          {res.flaps.map((f, i) => {
            const x = -boardW / 2 + GAP + TILE_W / 2 + i * (TILE_W + GAP);
            return (
              <group key={i} position={[x, 0.025 + HALF_H, 0]}>
                {/* Letter top (revealed when the flap falls) and blank lower half */}
                <mesh geometry={res.half} material={f.top} position-y={HALF_H / 2 + 0.001} />
                <mesh geometry={res.half} material={res.blank} position-y={-HALF_H / 2 - 0.001} />
                {/* The flap: blank on its face, the letter's lower half on its back */}
                <group
                  ref={(el) => {
                    flapRefs.current[i] = el;
                  }}
                  position-z={0.004}
                >
                  <mesh geometry={res.half} material={res.blank} position-y={HALF_H / 2 + 0.001} castShadow />
                  <mesh geometry={res.halfBack} material={f.bottom} position-y={HALF_H / 2 + 0.001} />
                </group>
              </group>
            );
          })}
        </group>
      </group>

      {/* Pathway II — luggage tag */}
      <group position={[0.08, 0.002, 0.24]} rotation-y={-0.12}>
        <group ref={tagRef} visible={false}>
          <mesh geometry={res.tagPlane} material={res.tagMat} position-y={0.2} castShadow />
          <primitive object={res.string} />
        </group>
      </group>

      {/* Pathway III — application stack */}
      <group position={[0.84, 0.002, 0.22]}>
        <group ref={docsRef} visible={false}>
          <mesh geometry={res.docPlane} material={res.docBack} position={[0.05, 0.215, -0.05]} rotation-z={-0.06} castShadow />
          <mesh geometry={res.docPlane} material={res.docFront} position={[0, 0.215, 0]} rotation-z={0.03} castShadow />
        </group>
      </group>

      {/* Printed captions on the page in front of each object */}
      {[-0.78, 0.08, 0.84].map((x, i) => (
        <mesh
          key={i}
          ref={(el) => {
            labelRefs.current[i] = el;
          }}
          geometry={res.labelPlane}
          material={res.labels[i]}
          position={[x + 0.08, 0.0035, 0.5]}
          renderOrder={3}
          visible={false}
        />
      ))}
    </group>
  );
}
