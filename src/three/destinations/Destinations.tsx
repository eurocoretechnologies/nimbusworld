"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import {
  BufferGeometry,
  Color,
  CylinderGeometry,
  Line,
  LineDashedMaterial,
  MeshStandardMaterial,
  QuadraticBezierCurve3,
  RingGeometry,
  SphereGeometry,
  Vector3,
  type Group,
  type Mesh,
} from "three";
import { destinations } from "@/data/content";
import { useExperience } from "@/store/experience";
import { COLORS, PUNE } from "../constants";
import { clock } from "../sceneClock";
import { PIN_HEIGHT, pinPositions, pinRise, routeDraw } from "./destinationState";
import { puneLabelOpacity } from "./labels";

const NAVY = new Color(COLORS.navy);
const GOLD = new Color(COLORS.gold);
const GOLD_LIGHT = new Color(COLORS.goldLight);

export function Destinations() {
  const shared = useMemo(
    () => ({
      needle: new CylinderGeometry(0.0022, 0.0022, PIN_HEIGHT, 8).translate(0, PIN_HEIGHT / 2, 0),
      head: new SphereGeometry(0.011, 20, 14),
      hit: new SphereGeometry(0.04, 8, 6),
      ring: new RingGeometry(0.014, 0.018, 40).rotateX(-Math.PI / 2),
      dot: new SphereGeometry(0.005, 12, 8),
      originMat: new MeshStandardMaterial({ color: COLORS.navy, roughness: 0.5 }),
    }),
    [],
  );
  useEffect(
    () => () => Object.values(shared).forEach((r) => r.dispose()),
    [shared],
  );

  const origin = useRef<Group>(null);
  const originLabel = useRef<HTMLDivElement>(null);
  useFrame(() => {
    const o = puneLabelOpacity(clock.p);
    origin.current!.visible = o > 0.01;
    origin.current!.scale.setScalar(Math.max(0.001, o));
    if (originLabel.current) originLabel.current.style.opacity = String(o);
  });

  return (
    <group>
      <group ref={origin} position={[PUNE[0], 0.0015, PUNE[1]]}>
        <mesh geometry={shared.ring} material={shared.originMat} />
        <mesh geometry={shared.dot} material={shared.originMat} />
        <Html position={[0.02, 0, 0.03]} zIndexRange={[20, 10]} style={{ pointerEvents: "none" }}>
          <div ref={originLabel} className="map-label map-label-origin" aria-hidden="true">
            PUNE — ORIGIN
          </div>
        </Html>
      </group>
      {destinations.map((d, i) => (
        <Pin key={d.id} index={i} shared={shared} />
      ))}
      {destinations.map((d, i) => (
        <Route key={d.id} index={i} />
      ))}
    </group>
  );
}

interface PinShared {
  needle: BufferGeometry;
  head: BufferGeometry;
  hit: BufferGeometry;
}

function Pin({ index, shared }: { index: number; shared: PinShared }) {
  const dest = destinations[index];
  const pos = pinPositions[index];
  const group = useRef<Group>(null);
  const headRef = useRef<Mesh>(null);
  const labelRef = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const selectedId = useExperience((s) => s.selectedDestination);
  const select = useExperience((s) => s.selectDestination);
  const selected = selectedId === dest.id;

  const mat = useMemo(() => new MeshStandardMaterial({ color: NAVY.clone(), roughness: 0.35, metalness: 0.2 }), []);
  useEffect(() => () => mat.dispose(), [mat]);

  useEffect(() => {
    mat.color.copy(selected ? GOLD : hovered ? GOLD_LIGHT : NAVY);
    mat.metalness = selected || hovered ? 0.7 : 0.2;
  }, [selected, hovered, mat]);

  useFrame(() => {
    const r = pinRise(clock.p, index);
    const g = group.current!;
    g.visible = r > 0.001;
    g.scale.set(1, Math.max(0.001, r), 1);
    headRef.current!.visible = r > 0.001;
    headRef.current!.position.y = PIN_HEIGHT * r;
    headRef.current!.scale.setScalar(Math.max(0.001, r) * (selected ? 1.35 : 1));
    if (labelRef.current) {
      labelRef.current.style.opacity = String(Math.max(0, (r - 0.6) / 0.4));
      labelRef.current.style.visibility = r > 0.6 ? "visible" : "hidden";
    }
  });

  const onSelect = () => select(selected ? null : dest.id);

  return (
    <group position={[pos.x, 0, pos.z]}>
      <group ref={group}>
        <mesh geometry={shared.needle} material={mat} castShadow />
      </group>
      <mesh ref={headRef} geometry={shared.head} material={mat} position-y={PIN_HEIGHT} castShadow />
      <mesh
        geometry={shared.hit}
        position-y={PIN_HEIGHT * 0.8}
        visible={false}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
      />
      <Html position={[0, PIN_HEIGHT, 0]} zIndexRange={[30, 20]}>
        <button
          ref={labelRef}
          type="button"
          className={`map-label map-pin is-${dest.label ?? "right"} ${selected ? "is-selected" : ""}`}
          aria-pressed={selected}
          onClick={onSelect}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ visibility: "hidden" }}
        >
          {dest.name}
        </button>
      </Html>
    </group>
  );
}

function Route({ index }: { index: number }) {
  const pos = pinPositions[index];
  const selectedId = useExperience((s) => s.selectedDestination);
  const isSelected = selectedId === destinations[index].id;
  const anySelected = selectedId !== null;

  const { line, count } = useMemo(() => {
    const start = new Vector3(PUNE[0], 0.003, PUNE[1]);
    const end = new Vector3(pos.x, PIN_HEIGHT, pos.z);
    const dist = start.distanceTo(end);
    const mid = start.clone().lerp(end, 0.5);
    mid.y += 0.08 + dist * 0.32;
    const curve = new QuadraticBezierCurve3(start, mid, end);
    const pts = curve.getPoints(96);
    const geometry = new BufferGeometry().setFromPoints(pts);
    const material = new LineDashedMaterial({
      color: COLORS.gold,
      dashSize: 0.012,
      gapSize: 0.01,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    const l = new Line(geometry, material);
    l.computeLineDistances();
    l.renderOrder = 2;
    return { line: l, count: pts.length };
  }, [pos]);

  useEffect(
    () => () => {
      line.geometry.dispose();
      (line.material as LineDashedMaterial).dispose();
    },
    [line],
  );

  useEffect(() => {
    const m = line.material as LineDashedMaterial;
    m.opacity = anySelected ? (isSelected ? 1 : 0.25) : 0.85;
    m.color.set(isSelected ? COLORS.goldLight : COLORS.gold);
  }, [anySelected, isSelected, line]);

  useFrame(() => {
    const d = routeDraw(clock.p, index);
    line.visible = d > 0.001;
    line.geometry.setDrawRange(0, Math.floor(count * d));
  });

  return <primitive object={line} />;
}
