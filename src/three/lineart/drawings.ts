import { seeded } from "@/lib/math";
import { Pen, type V3 } from "./draw";

/**
 * The architecture drawn out of ink. Deliberately evocative rather than
 * literal: a pagoda and torii, a neoclassical city gate, a round temple of
 * tiered roofs, a vaulted terminal, a university and a skyline.
 */

/** Five-tier pagoda with upturned eaves, and a torii gate beside it. */
export function pagodaAndTorii(): Float32Array {
  const pen = new Pen();
  pen.box(0, 0, 0, 0.56, 0.035, 0.56);
  let y = 0.035;
  for (let i = 0; i < 5; i++) {
    const b = 0.34 - i * 0.045;
    const bodyH = i === 0 ? 0.12 : 0.085;
    pen.box(0, y, 0, b, bodyH, b);
    // Posts on the facade.
    for (const f of [-0.25, 0.25]) pen.seg([f * b, y, b / 2], [f * b, y + bodyH, b / 2]);
    y += bodyH;
    const r = b / 2 + 0.085;
    const lift = 0.03;
    // Eaves: each edge sags in the middle and lifts at the corners.
    const corners: [number, number][] = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    for (let e = 0; e < 4; e++) {
      const [ax, az] = corners[e];
      const [bx, bz] = corners[(e + 1) % 4];
      pen.curve((t) => {
        const s = (t - 0.5) * 2;
        return [(ax + (bx - ax) * t) * r, y + lift * s * s, (az + (bz - az) * t) * r];
      }, 12);
    }
    // Roof planes up to the next body.
    const top = y + 0.045;
    const inner = (b - 0.045) / 2;
    for (const [cx, cz] of corners) pen.seg([cx * r, y + lift, cz * r], [cx * inner, top, cz * inner]);
    y = top;
  }
  // Spire with rings.
  pen.seg([0, y, 0], [0, y + 0.22, 0]);
  for (let k = 0; k < 7; k++) pen.ring(0, y + 0.04 + k * 0.022, 0, 0.022 - k * 0.0012, 16);

  // Torii to the right and forward.
  const tx = 0.72;
  const tz = 0.28;
  const postH = 0.4;
  const half = 0.2;
  for (const s of [-1, 1]) {
    pen.seg([tx + s * half, 0, tz], [tx + s * (half - 0.018), postH, tz]);
    pen.seg([tx + s * half + 0.014, 0, tz], [tx + s * (half - 0.018) + 0.014, postH, tz]);
  }
  pen.curve((t) => {
    const x = (t - 0.5) * 2 * (half + 0.1);
    return [tx + x, postH + 0.03 + 0.03 * Math.pow(Math.abs(x) / (half + 0.1), 2), tz];
  }, 20);
  pen.curve((t) => {
    const x = (t - 0.5) * 2 * (half + 0.1);
    return [tx + x, postH + 0.055 + 0.035 * Math.pow(Math.abs(x) / (half + 0.1), 2), tz];
  }, 20);
  pen.seg([tx - half - 0.05, postH - 0.07, tz], [tx + half + 0.05, postH - 0.07, tz]);
  pen.seg([tx, postH - 0.07, tz], [tx, postH + 0.035, tz]);
  return pen.build();
}

/** A neoclassical city gate: colonnade, entablature, attic and a sculpture block. */
export function cityGate(): Float32Array {
  const pen = new Pen();
  // Stepped base.
  pen.box(0, 0, 0, 1.36, 0.02, 0.4).box(0, 0.02, 0, 1.3, 0.02, 0.36);
  const baseY = 0.04;
  const colH = 0.42;
  const xs = [-0.55, -0.33, -0.11, 0.11, 0.33, 0.55];
  for (const z of [0.12, -0.12]) {
    for (const x of xs) {
      // Column: fluted as three hairlines, with base and capital.
      for (const dx of [-0.016, 0, 0.016]) pen.seg([x + dx, baseY + 0.015, z], [x + dx * 0.85, baseY + colH - 0.02, z]);
      pen.box(x, baseY, z, 0.05, 0.015, 0.05);
      pen.box(x, baseY + colH - 0.02, z, 0.056, 0.02, 0.056);
    }
  }
  // Entablature, cornice and attic.
  const eY = baseY + colH;
  pen.box(0, eY, 0, 1.3, 0.06, 0.34);
  pen.box(0, eY + 0.06, 0, 1.36, 0.02, 0.38);
  pen.seg([-0.65, eY + 0.03, 0.17], [0.65, eY + 0.03, 0.17]);
  // Triglyph rhythm on the frieze.
  for (let i = 0; i <= 24; i++) {
    const x = -0.63 + (1.26 / 24) * i;
    pen.seg([x, eY + 0.005, 0.17], [x, eY + 0.03, 0.17]);
  }
  pen.box(0, eY + 0.08, 0, 0.62, 0.1, 0.26);
  pen.box(0, eY + 0.18, 0, 0.66, 0.015, 0.28);
  // Sculpture plinth and a stylised group above it.
  pen.box(0, eY + 0.195, 0, 0.2, 0.05, 0.12);
  pen.curve((t) => [(t - 0.5) * 0.22, eY + 0.26 + Math.sin(t * Math.PI) * 0.07, 0], 16);
  pen.seg([0, eY + 0.245, 0], [0, eY + 0.36, 0]);
  pen.curve((t) => [(t - 0.5) * 0.08, eY + 0.36 + Math.sin(t * Math.PI) * 0.03, 0], 10);
  // Flanking gatehouses.
  for (const s of [-1, 1]) {
    pen.box(s * 0.86, 0, 0.02, 0.26, 0.3, 0.3);
    pen.windows(s * 0.86, 0.05, 0.17, 0.2, 0.2, 2, 2, 0.04, 0.06);
    pen.poly([[s * 0.73, 0.3, 0.17], [s * 0.86, 0.36, 0.17], [s * 0.99, 0.3, 0.17]]);
  }
  return pen.build();
}

/** A round hall of three tiered conical roofs on circular terraces. */
export function roundTemple(): Float32Array {
  const pen = new Pen();
  const terraces = [0.62, 0.53, 0.44];
  terraces.forEach((r, i) => {
    const y = i * 0.035;
    pen.ring(0, y, 0, r, 72).ring(0, y + 0.035, 0, r, 72);
    for (let k = 0; k < 36; k++) {
      const a = (k / 36) * Math.PI * 2;
      pen.seg([Math.cos(a) * r, y, Math.sin(a) * r], [Math.cos(a) * r, y + 0.035, Math.sin(a) * r]);
    }
  });
  let y = 0.105;
  // Hall body.
  pen.ring(0, y, 0, 0.21, 48).ring(0, y + 0.13, 0, 0.21, 48);
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    pen.seg([Math.cos(a) * 0.21, y, Math.sin(a) * 0.21], [Math.cos(a) * 0.21, y + 0.13, Math.sin(a) * 0.21]);
  }
  y += 0.13;
  const tiers = [
    { eave: 0.34, top: 0.17, h: 0.07, drum: 0.06 },
    { eave: 0.27, top: 0.13, h: 0.065, drum: 0.05 },
    { eave: 0.2, top: 0.03, h: 0.1, drum: 0 },
  ];
  for (const t of tiers) {
    pen.ring(0, y, 0, t.eave, 64);
    pen.ring(0, y - 0.012, 0, t.eave * 0.97, 64);
    const topY = y + t.h;
    pen.ring(0, topY, 0, t.top, 40);
    for (let k = 0; k < 32; k++) {
      const a = (k / 32) * Math.PI * 2;
      pen.curve((s) => {
        const r = t.eave + (t.top - t.eave) * s;
        const yy = y + t.h * (1 - Math.pow(1 - s, 1.6));
        return [Math.cos(a) * r, yy, Math.sin(a) * r];
      }, 6);
    }
    y = topY;
    if (t.drum > 0) {
      pen.ring(0, y + t.drum, 0, t.top, 40);
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2;
        pen.seg([Math.cos(a) * t.top, y, Math.sin(a) * t.top], [Math.cos(a) * t.top, y + t.drum, Math.sin(a) * t.top]);
      }
      y += t.drum;
    }
  }
  // Finial.
  pen.seg([0, y, 0], [0, y + 0.12, 0]);
  pen.ring(0, y + 0.05, 0, 0.02, 16).ring(0, y + 0.09, 0, 0.012, 12);
  return pen.build();
}

/** A long vaulted terminal: parabolic ribs receding into depth, with a runway horizon. */
export function terminalVault(): Float32Array {
  const pen = new Pen();
  const ribs = 15;
  const span = 1.25;
  const height = 0.95;
  const rib = (z: number, scale = 1) => (t: number): V3 => {
    const x = (t - 0.5) * 2 * span * scale;
    return [x, height * scale * (1 - (x / (span * scale)) ** 2), z];
  };
  const zs: number[] = [];
  for (let i = 0; i < ribs; i++) zs.push(0.85 - (1.7 * i) / (ribs - 1));
  for (const z of zs) pen.curve(rib(z), 40);
  // Longitudinal purlins along the vault.
  for (const t of [0.06, 0.2, 0.35, 0.5, 0.65, 0.8, 0.94]) {
    pen.poly(zs.map((z) => rib(z)(t)));
  }
  // Glazed end wall mullions, and the runway line on the far horizon.
  const endZ = zs[zs.length - 1];
  for (let i = 1; i < 10; i++) {
    const x = -span + (2 * span * i) / 10;
    pen.seg([x, 0, endZ], [x, height * (1 - (x / span) ** 2), endZ]);
  }
  pen.seg([-span * 1.6, 0.002, endZ - 0.02], [span * 1.6, 0.002, endZ - 0.02]);
  // A departures board hung under the vault.
  pen.box(0, 0.5, 0.2, 0.52, 0.12, 0.01);
  for (let r = 0; r < 4; r++) pen.seg([-0.24, 0.52 + r * 0.025, 0.206], [0.24, 0.52 + r * 0.025, 0.206]);
  return pen.build();
}

/** A university front: stepped podium, portico, pediment, drum and dome, and wings. */
export function university(): Float32Array {
  const pen = new Pen();
  for (let i = 0; i < 3; i++) pen.box(0, i * 0.018, 0.02 - i * 0.02, 0.62 - i * 0.04, 0.018, 0.34 - i * 0.02);
  const baseY = 0.054;
  const colH = 0.3;
  for (let i = 0; i < 8; i++) {
    const x = -0.24 + (0.48 / 7) * i;
    pen.seg([x - 0.008, baseY, 0.13], [x - 0.007, baseY + colH, 0.13]);
    pen.seg([x + 0.008, baseY, 0.13], [x + 0.007, baseY + colH, 0.13]);
  }
  const eY = baseY + colH;
  pen.box(0, eY, 0.05, 0.56, 0.04, 0.2);
  pen.poly([[-0.28, eY + 0.04, 0.15], [0, eY + 0.14, 0.15], [0.28, eY + 0.04, 0.15]], true);
  // Main block behind.
  pen.box(0, 0.054, -0.12, 0.72, 0.36, 0.2);
  // Drum and dome.
  const dY = 0.414;
  pen.ring(0, dY, -0.12, 0.13, 48).ring(0, dY + 0.08, -0.12, 0.13, 48);
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    pen.seg([Math.cos(a) * 0.13, dY, -0.12 + Math.sin(a) * 0.13], [Math.cos(a) * 0.13, dY + 0.08, -0.12 + Math.sin(a) * 0.13]);
  }
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    pen.curve((t) => {
      const phi = (t * Math.PI) / 2;
      return [Math.cos(a) * 0.13 * Math.cos(phi), dY + 0.08 + 0.13 * Math.sin(phi), -0.12 + Math.sin(a) * 0.13 * Math.cos(phi)];
    }, 10);
  }
  for (const f of [0.35, 0.7]) pen.ring(0, dY + 0.08 + 0.13 * Math.sin((f * Math.PI) / 2), -0.12, 0.13 * Math.cos((f * Math.PI) / 2), 32);
  pen.box(0, dY + 0.21, -0.12, 0.04, 0.06, 0.04);
  pen.seg([0, dY + 0.27, -0.12], [0, dY + 0.31, -0.12]);
  // Wings with windows.
  for (const s of [-1, 1]) {
    pen.box(s * 0.6, 0.054, -0.08, 0.46, 0.26, 0.18);
    pen.windows(s * 0.6, 0.08, 0.011, 0.42, 0.2, 6, 2, 0.028, 0.06);
  }
  return pen.build();
}

/** A city skyline for the career beyond: towers of varied heights with floor lines. */
export function skyline(): Float32Array {
  const pen = new Pen();
  const rand = seeded(907);
  const n = 11;
  for (let i = 0; i < n; i++) {
    const x = -1.15 + (2.3 * i) / (n - 1) + (rand() - 0.5) * 0.08;
    const z = -0.42 - rand() * 0.25;
    const w = 0.12 + rand() * 0.1;
    const h = 0.45 + Math.pow(rand(), 1.4) * 0.85 * (1 - Math.abs(x) / 1.6);
    pen.box(x, 0, z, w, h, w);
    const floors = Math.floor(h / 0.05);
    for (let f = 1; f < floors; f += 2) pen.seg([x - w / 2, f * 0.05, z + w / 2], [x + w / 2, f * 0.05, z + w / 2]);
    if (rand() > 0.55) {
      pen.box(x, h, z, w * 0.6, 0.08 + rand() * 0.08, w * 0.6);
      pen.seg([x, h + 0.16, z], [x, h + 0.28, z]);
    }
  }
  return pen.build();
}
