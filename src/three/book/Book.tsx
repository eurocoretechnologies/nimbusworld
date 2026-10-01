"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import {
  BoxGeometry,
  Color,
  MeshStandardMaterial,
  PlaneGeometry,
  type Group,
  type Mesh,
} from "three";
import { range } from "@/lib/math";
import { local } from "@/lib/timeline";
import { BOOK, COLORS } from "../constants";
import { clock } from "../sceneClock";
import type { SceneAssets } from "../assets";
import { Leaf, type LeafHandle } from "./Leaf";
import {
  bookPose,
  FINALE_LEAVES,
  finaleLeafTurn,
  OPENING_LEAVES,
  openingLeafTurn,
} from "./bookPose";

const { width: W, height: H, half, cover, overhang, gap } = BOOK;
const BOARD_W = W + overhang;
const BOARD_D = H + overhang * 2;
const BLOCK_W = W - cover;
const BLOCK_X = (W + cover) / 2;

// Stacking heights on each side of the gutter (world units above the page plane).
const RIGHT_SURFACE_Y = 0.0004;
const LEFT_SURFACE_Y = -gap + 0.0003;
const PROLOGUE_DECAL_Y = -0.0009;
const FINALE_DECAL_Y = 0.0034;

interface BookProps {
  assets: SceneAssets;
  isMobile: boolean;
}

export function Book({ assets, isMobile }: BookProps) {
  const yawRef = useRef<Group>(null);
  const shiftRef = useRef<Group>(null);
  const frontHalf = useRef<Group>(null);
  const rightBlock = useRef<Mesh>(null);
  const leftBlock = useRef<Mesh>(null);
  const backCover = useRef<Group>(null);
  const frontCover = useRef<Group>(null);
  const spineLower = useRef<Group>(null);
  const spineUpper = useRef<Group>(null);
  const foil = useRef<Mesh>(null);
  const passportFoil = useRef<Mesh>(null);
  const leftSurface = useRef<Mesh>(null);
  const prologueDecal = useRef<Mesh>(null);
  const finaleDecal = useRef<Mesh>(null);
  const openingLeaves = useRef<(LeafHandle | null)[]>([]);
  const finaleLeaves = useRef<(LeafHandle | null)[]>([]);

  const segments = isMobile ? 18 : 30;

  const materials = useMemo(() => {
    const leather = new MeshStandardMaterial({
      color: new Color(COLORS.leather),
      map: assets.leather.map,
      normalMap: assets.leather.normalMap,
      roughnessMap: assets.leather.roughnessMap,
      roughness: 1,
      metalness: 0,
      envMapIntensity: 0.9,
    });
    leather.normalScale.set(0.55, 0.55);

    const edge = new MeshStandardMaterial({ map: assets.edge, roughness: 0.95, color: "#ffffff" });
    const paperPlain = new MeshStandardMaterial({ color: COLORS.paper, roughness: 0.95 });
    const pageRight = new MeshStandardMaterial({
      map: assets.pageRight,
      normalMap: assets.paperNormal,
      roughness: 0.93,
    });
    pageRight.normalScale.set(0.3, 0.3);
    const pageLeft = pageRight.clone();
    pageLeft.map = assets.pageLeft;

    const foilMat = new MeshStandardMaterial({
      color: new Color(COLORS.foil),
      metalness: 1,
      roughness: 0.27,
      alphaMap: assets.foil,
      bumpMap: assets.foil,
      bumpScale: -1.2,
      transparent: true,
      depthWrite: false,
      envMapIntensity: 2.2,
    });

    // The passport seal shares the stamping treatment and cross-fades with the title.
    const passportFoilMat = foilMat.clone();
    passportFoilMat.alphaMap = assets.passportFoil;
    passportFoilMat.bumpMap = assets.passportFoil;
    passportFoilMat.opacity = 0;

    const decal = (map: typeof assets.prologuePrint) =>
      new MeshStandardMaterial({
        map,
        transparent: true,
        depthWrite: false,
        roughness: 0.85,
        opacity: 0,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      });

    // Faces that lie directly under a printed page surface are never drawn —
    // two coplanar layers would z-fight at grazing angles.
    const hidden = new MeshStandardMaterial({ visible: false });
    // The front half's underside is seen while it swings over, then hidden once it lands.
    const leftUnderside = paperPlain.clone();

    return {
      leather,
      edge,
      paperPlain,
      pageRight,
      pageLeft,
      foilMat,
      passportFoilMat,
      hidden,
      leftUnderside,
      prologueDecal: decal(assets.prologuePrint),
      finaleDecal: decal(assets.finalePrint),
      // Box face order: +x, −x, +y, −y, +z, −z
      rightBlock: [edge, paperPlain, hidden, paperPlain, edge, edge],
      leftBlock: [edge, paperPlain, paperPlain, leftUnderside, edge, edge],
    };
  }, [assets]);

  const geo = useMemo(() => {
    const block = new BoxGeometry(BLOCK_W, half, H);
    const surface = new PlaneGeometry(W, H - 0.002);
    surface.rotateX(-Math.PI / 2);
    const foilPlane = new PlaneGeometry(BOARD_W - 0.03, BOARD_D - 0.03);
    foilPlane.rotateX(-Math.PI / 2);
    return { block, surface, foilPlane };
  }, []);

  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      const { rightBlock: _r, leftBlock: _l, ...single } = materials;
      Object.values(single).forEach((m) => m.dispose());
    },
    [geo, materials],
  );

  useFrame(() => {
    const p = clock.p;
    const pose = bookPose(p);
    const k = pose.thickness;
    const fin = local(p, "finale");

    yawRef.current!.rotation.y = pose.yaw;
    shiftRef.current!.position.x = pose.shift;
    frontHalf.current!.rotation.z = pose.openAngle;

    // Thickening for the finale: the page plane stays put, the book grows downward.
    rightBlock.current!.scale.y = k;
    rightBlock.current!.position.y = -(k * half) / 2;
    leftBlock.current!.scale.y = k;
    leftBlock.current!.position.y = gap + (k * half) / 2;
    backCover.current!.position.y = -(k * half + cover / 2);
    frontCover.current!.position.y = gap + k * half + cover / 2;
    foil.current!.position.y = gap + k * half + cover + 0.0007;
    passportFoil.current!.position.y = gap + k * half + cover + 0.0009;
    materials.foilMat.opacity = 1 - pose.passport;
    materials.passportFoilMat.opacity = pose.passport;
    foil.current!.visible = pose.passport < 0.999;
    passportFoil.current!.visible = pose.passport > 0.001;
    const spineH = k * half + cover;
    // The lower spine stops just under the (slightly lower) left page so the gutter reads as paper.
    const lowerH = spineH - gap - 0.001;
    spineLower.current!.scale.y = lowerH / (half + cover);
    spineLower.current!.position.y = -gap - 0.001 - lowerH / 2;
    spineUpper.current!.scale.y = (spineH + gap) / (half + cover + gap);
    spineUpper.current!.position.y = (spineH + gap) / 2;
    assets.edge.repeat.set(1, k * 1.1);

    // The printed left page is swapped in once the half has landed.
    const landed = pose.openAngle > Math.PI * 0.985;
    leftSurface.current!.visible = landed;
    materials.leftUnderside.visible = !landed;

    // Opening flutter: loose leaves trail the board.
    openingLeaves.current.forEach((leaf, i) => {
      if (!leaf) return;
      const t = openingLeafTurn(pose.open, i);
      leaf.uniforms.uTurn.value = t;
      const rightLift = RIGHT_SURFACE_Y + 0.0004 * (OPENING_LEAVES - i);
      const leftLift = LEFT_SURFACE_Y + 0.0003 * (i + 1);
      leaf.uniforms.uLift.value = rightLift + (leftLift - rightLift) * t;
      // At rest a leaf is indistinguishable from the page under it; only draw it in motion.
      leaf.setVisible(t > 0.001 && t < 0.999);
    });

    // Finale: a run of pages, one future after another.
    const finaleActive = fin > 0.28;
    finaleLeaves.current.forEach((leaf, i) => {
      if (!leaf) return;
      const t = finaleLeafTurn(fin, i);
      leaf.uniforms.uTurn.value = t;
      const rightLift = RIGHT_SURFACE_Y + 0.0003 * (FINALE_LEAVES - i);
      const leftLift = PROLOGUE_DECAL_Y + 0.0003 * (i + 1);
      leaf.uniforms.uLift.value = rightLift + (leftLift - rightLift) * t;
      leaf.setVisible(finaleActive && t < 0.999);
    });

    // Printed type fades in on its page.
    const prologueOpacity =
      range(0.72, 0.95, pose.open) * (1 - range(0.02, 0.3, local(p, "pullback")));
    materials.prologueDecal.opacity = prologueOpacity;
    prologueDecal.current!.visible = prologueOpacity > 0.001;
    const finaleOpacity = range(0.86, 0.97, fin);
    materials.finaleDecal.opacity = finaleOpacity;
    finaleDecal.current!.visible = finaleOpacity > 0.001;
  });

  return (
    <group ref={yawRef}>
      <group ref={shiftRef}>
        {/* Right (static) half */}
        <mesh ref={rightBlock} geometry={geo.block} material={materials.rightBlock} position-x={BLOCK_X} castShadow receiveShadow />
        <group ref={backCover} position-x={BOARD_W / 2}>
          <RoundedBox args={[BOARD_W, cover, BOARD_D]} radius={0.005} smoothness={3} material={materials.leather} castShadow receiveShadow />
        </group>
        <group ref={spineLower} position-x={-cover / 2}>
          <RoundedBox args={[cover, half + cover, BOARD_D]} radius={0.005} smoothness={3} material={materials.leather} castShadow />
        </group>
        <mesh geometry={geo.surface} material={materials.pageRight} position={[W / 2, RIGHT_SURFACE_Y, 0]} receiveShadow />

        {/* Front half — rotates about the spine to open */}
        <group ref={frontHalf}>
          <mesh ref={leftBlock} geometry={geo.block} material={materials.leftBlock} position-x={BLOCK_X} castShadow receiveShadow />
          <group ref={frontCover} position-x={BOARD_W / 2}>
            <RoundedBox args={[BOARD_W, cover, BOARD_D]} radius={0.005} smoothness={3} material={materials.leather} castShadow receiveShadow />
          </group>
          <mesh ref={foil} geometry={geo.foilPlane} material={materials.foilMat} position-x={BOARD_W / 2} renderOrder={2} />
          <mesh ref={passportFoil} geometry={geo.foilPlane} material={materials.passportFoilMat} position-x={BOARD_W / 2} renderOrder={2} visible={false} />
          <group ref={spineUpper} position-x={-cover / 2}>
            <RoundedBox args={[cover, half + cover + gap, BOARD_D]} radius={0.005} smoothness={3} material={materials.leather} castShadow />
          </group>
        </group>

        {/* Left printed page (static frame; revealed once the half has landed) */}
        <mesh ref={leftSurface} geometry={geo.surface} material={materials.pageLeft} position={[-W / 2, LEFT_SURFACE_Y, 0]} receiveShadow visible={false} />
        <mesh ref={prologueDecal} geometry={geo.surface} material={materials.prologueDecal} position={[-W / 2, PROLOGUE_DECAL_Y, 0]} renderOrder={3} visible={false} />
        <mesh ref={finaleDecal} geometry={geo.surface} material={materials.finaleDecal} position={[-W / 2, FINALE_DECAL_Y, 0]} renderOrder={3} visible={false} />

        {Array.from({ length: OPENING_LEAVES }, (_, i) => (
          <Leaf
            key={`o${i}`}
            ref={(h) => {
              openingLeaves.current[i] = h;
            }}
            front={assets.leafFront}
            back={assets.leafBack}
            segments={segments}
          />
        ))}
        {Array.from({ length: FINALE_LEAVES }, (_, i) => (
          <Leaf
            key={`f${i}`}
            ref={(h) => {
              finaleLeaves.current[i] = h;
            }}
            front={assets.leafFront}
            back={assets.leafBack}
            segments={segments}
            curl={0.8}
          />
        ))}
      </group>
    </group>
  );
}
