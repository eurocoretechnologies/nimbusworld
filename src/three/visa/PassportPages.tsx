"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshStandardMaterial, PlaneGeometry, type Mesh } from "three";
import { easeOutCubic, range } from "@/lib/math";
import { local } from "@/lib/timeline";
import { visaStagesDone } from "./visaState";
import { BOOK } from "../constants";
import { clock } from "../sceneClock";
import { bookPose } from "../book/bookPose";
import { ChecklistPage, createPassportLeftPage, createStampTexture } from "./passportPrints";


const STAMP_SIZE = 0.46;

export function PassportPages() {
  const left = useRef<Mesh>(null);
  const right = useRef<Mesh>(null);
  const stamp = useRef<Mesh>(null);

  const res = useMemo(() => {
    const page = new PlaneGeometry(BOOK.width - 0.04, BOOK.height - 0.04);
    page.rotateX(-Math.PI / 2);
    const stampGeo = new PlaneGeometry(STAMP_SIZE, STAMP_SIZE);
    stampGeo.rotateX(-Math.PI / 2);
    const checklist = new ChecklistPage();
    const make = (map: import("three").Texture) =>
      new MeshStandardMaterial({ map, transparent: true, depthWrite: false, roughness: 0.9, opacity: 0, polygonOffset: true, polygonOffsetFactor: -2 });
    return {
      page,
      stampGeo,
      checklist,
      leftMat: make(createPassportLeftPage()),
      rightMat: make(checklist.texture),
      stampMat: make(createStampTexture()),
    };
  }, []);

  useEffect(
    () => () => {
      res.page.dispose();
      res.stampGeo.dispose();
      [res.leftMat, res.rightMat, res.stampMat].forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
    },
    [res],
  );

  useFrame(() => {
    const p = clock.p;
    const pose = bookPose(p);
    const landed = range(0.93, 1, pose.openAngle / Math.PI);
    const o = pose.passport * landed;
    res.leftMat.opacity = o;
    res.rightMat.opacity = o;
    left.current!.visible = right.current!.visible = o > 0.001;

    res.checklist.draw(visaStagesDone(p));

    // The stamp is pressed once: it arrives slightly large and settles into the paper.
    const press = easeOutCubic(range(0.6, 0.66, local(p, "visa")));
    res.stampMat.opacity = 0.9 * press * o;
    stamp.current!.visible = res.stampMat.opacity > 0.001;
    stamp.current!.scale.setScalar(1.35 - 0.35 * press);
  });

  return (
    <group>
      <mesh ref={left} geometry={res.page} material={res.leftMat} position={[-BOOK.width / 2, -0.0006, 0]} renderOrder={3} visible={false} />
      <mesh ref={right} geometry={res.page} material={res.rightMat} position={[BOOK.width / 2, 0.0022, 0]} renderOrder={3} visible={false} />
      <mesh ref={stamp} geometry={res.stampGeo} material={res.stampMat} position={[-0.72, 0.0002, 0.18]} rotation-y={0.18} renderOrder={4} visible={false} />
    </group>
  );
}
