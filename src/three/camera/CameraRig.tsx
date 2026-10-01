"use client";

import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { Vector3, type PerspectiveCamera } from "three";
import { clamp, damp, range, window4 } from "@/lib/math";
import { local, segmentOf } from "@/lib/timeline";
import { courseFocusX } from "../courses/courseState";

const pune = segmentOf("pune")!;
const dest = segmentOf("destinations")!;
import { useExperience } from "@/store/experience";
import { clock } from "../sceneClock";
import { PIN_HEIGHT, pinPosition } from "../destinations/destinationState";
import { sampleShot } from "./shots";

const DIVE_OFFSET = new Vector3(0.1, 0.4, 0.5);

export function CameraRig({ isMobile }: { isMobile: boolean }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);

  const tmp = useMemo(
    () => ({
      pos: new Vector3(),
      target: new Vector3(),
      divePos: new Vector3(),
      diveTarget: new Vector3(),
      offset: new Vector3(),
      right: new Vector3(),
      up: new Vector3(0, 1, 0),
      lastDive: new Vector3(),
    }),
    [],
  );

  // Selecting a destination blends the camera into a dive shot; deselecting reverses it.
  useEffect(() => {
    const unsub = useExperience.subscribe((s, prev) => {
      if (s.selectedDestination === prev.selectedDestination) return;
      const pin = s.selectedDestination ? pinPosition(s.selectedDestination) : null;
      if (pin) tmp.lastDive.set(pin.x, PIN_HEIGHT * 0.55, pin.z);
      gsap.to(clock, {
        dive: pin ? 1 : 0,
        duration: pin ? 1.8 : 1.3,
        ease: "power3.inOut",
        overwrite: true,
        onUpdate: invalidate,
      });
    });
    return unsub;
  }, [invalidate, tmp]);

  // Pointer parallax (desktop only) — a few millimetres of life, never a gimmick.
  useEffect(() => {
    if (isMobile) return;
    const onMove = (e: PointerEvent) => {
      clock.px = (e.clientX / window.innerWidth) * 2 - 1;
      clock.py = (e.clientY / window.innerHeight) * 2 - 1;
      invalidate();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [isMobile, invalidate]);

  const parallax = useMemo(() => ({ x: 0, y: 0 }), []);

  useFrame((_, dt) => {
    const fov = sampleShot(clock.p, tmp.pos, tmp.target);

    // Portrait screens: the desktop hero framing leaves room for type on the left;
    // on a phone the type sits below, so the book is re-centred.
    const p = clock.p;
    const aspect = size.width / size.height;
    if (aspect < 1) {
      // Off-axis framings exist to leave room for type beside the book; on a
      // phone the type sits below, so re-centre — except over the map, where
      // the camera is looking at a real place (Pune, the world).
      const mapShots = window4(p, pune.start, pune.start + 0.01, dest.end - 0.01, dest.end);
      const centre = 1 - mapShots;
      tmp.pos.x -= tmp.target.x * centre;
      tmp.target.x -= tmp.target.x * centre;
    }

    // Courses: lean toward (and a little closer to) the page being lifted.
    const fx = courseFocusX(p);
    if (fx !== 0 || local(p, "courses") > 0) {
      const lean = range(0.3, 0.4, local(p, "courses")) * (1 - range(0, 0.12, local(p, "languages")));
      tmp.pos.x += fx * 0.4;
      tmp.target.x += fx * 0.4;
      tmp.pos.lerp(tmp.target, 0.1 * lean);
    }
    // Back the camera off along its own line of sight so the spread fits the width.
    // The opening macro keeps most of its closeness — it frames a detail, not the book.
    const macro = 1 - range(0.2, 0.9, local(p, "hero"));
    const fit = aspect < 1.25 ? Math.pow(clamp(1.25 / aspect, 1, 3.2), 1 - 0.65 * macro) : 1;
    if (fit !== 1) {
      tmp.offset.subVectors(tmp.pos, tmp.target).multiplyScalar(fit);
      tmp.pos.addVectors(tmp.target, tmp.offset);
    }

    if (clock.dive > 0.0001) {
      tmp.diveTarget.copy(tmp.lastDive);
      tmp.divePos.copy(tmp.lastDive).add(tmp.offset.copy(DIVE_OFFSET).multiplyScalar(fit));
      tmp.pos.lerp(tmp.divePos, clock.dive);
      tmp.target.lerp(tmp.diveTarget, clock.dive);
    }

    const k = damp(4, dt);
    parallax.x += (clock.px - parallax.x) * k;
    parallax.y += (clock.py - parallax.y) * k;
    if (Math.abs(clock.px - parallax.x) > 0.001 || Math.abs(clock.py - parallax.y) > 0.001) invalidate();
    tmp.right.subVectors(tmp.target, tmp.pos).cross(tmp.up).normalize();
    const dist = tmp.pos.distanceTo(tmp.target);
    tmp.pos.addScaledVector(tmp.right, parallax.x * 0.018 * dist);
    tmp.pos.y -= parallax.y * 0.012 * dist;

    camera.position.copy(tmp.pos);
    camera.lookAt(tmp.target);
    const targetFov = fov + (fit - 1) * 2;
    if (Math.abs(camera.fov - targetFov) > 0.001) {
      camera.fov = targetFov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
