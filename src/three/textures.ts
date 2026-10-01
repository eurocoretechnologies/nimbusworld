import {
  CanvasTexture,
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  NoColorSpace,
  RepeatWrapping,
  RGBAFormat,
  SRGBColorSpace,
  type Texture,
} from "three";
import { seeded } from "@/lib/math";

/**
 * Procedural material maps. Generated once on the client (a few ms each) so
 * the scene ships with no texture downloads; each generator can be swapped
 * for a CC0 scan later without touching the materials that consume it.
 */

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

/** Tileable cellular (Worley F2−F1) field — reads as leather grain creases. */
function cellular(size: number, cells: number, seed: number) {
  const rand = seeded(seed);
  const pts = new Float32Array(cells * cells * 2);
  for (let i = 0; i < cells * cells; i++) {
    pts[i * 2] = rand();
    pts[i * 2 + 1] = rand();
  }
  const out = new Float32Array(size * size);
  const cellPx = size / cells;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cx = Math.floor(x / cellPx);
      const cy = Math.floor(y / cellPx);
      let f1 = 1e9;
      let f2 = 1e9;
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          const gx = cx + ox;
          const gy = cy + oy;
          const wx = ((gx % cells) + cells) % cells;
          const wy = ((gy % cells) + cells) % cells;
          const idx = (wy * cells + wx) * 2;
          const px = (gx + pts[idx]) * cellPx;
          const py = (gy + pts[idx + 1]) * cellPx;
          const d = Math.hypot(px - x, py - y);
          if (d < f1) {
            f2 = f1;
            f1 = d;
          } else if (d < f2) f2 = d;
        }
      }
      out[y * size + x] = (f2 - f1) / cellPx;
    }
  }
  return out;
}

/** Tileable value noise with a few octaves. */
function valueNoise(size: number, freq: number, octaves: number, seed: number) {
  const out = new Float32Array(size * size);
  let amp = 1;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    const f = freq << o;
    const rand = seeded(seed + o * 101);
    const grid = new Float32Array(f * f).map(() => rand());
    for (let y = 0; y < size; y++) {
      const gy = (y / size) * f;
      const y0 = Math.floor(gy);
      const ty = gy - y0;
      const sy = ty * ty * (3 - 2 * ty);
      for (let x = 0; x < size; x++) {
        const gx = (x / size) * f;
        const x0 = Math.floor(gx);
        const tx = gx - x0;
        const sx = tx * tx * (3 - 2 * tx);
        const x1 = (x0 + 1) % f;
        const y1 = (y0 + 1) % f;
        const a = grid[y0 * f + x0];
        const b = grid[y0 * f + x1];
        const c = grid[y1 * f + x0];
        const d = grid[y1 * f + x1];
        out[y * size + x] += amp * (a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy);
      }
    }
    norm += amp;
    amp *= 0.5;
  }
  for (let i = 0; i < out.length; i++) out[i] /= norm;
  return out;
}

function heightToNormal(h: Float32Array, size: number, strength: number) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const l = h[y * size + ((x - 1 + size) % size)];
      const r = h[y * size + ((x + 1) % size)];
      const u = h[((y - 1 + size) % size) * size + x];
      const d = h[((y + 1) % size) * size + x];
      let nx = (l - r) * strength;
      let ny = (u - d) * strength;
      let nz = 1;
      const len = Math.hypot(nx, ny, nz);
      nx /= len;
      ny /= len;
      nz /= len;
      const i = (y * size + x) * 4;
      data[i] = (nx * 0.5 + 0.5) * 255;
      data[i + 1] = (ny * 0.5 + 0.5) * 255;
      data[i + 2] = (nz * 0.5 + 0.5) * 255;
      data[i + 3] = 255;
    }
  }
  return data;
}

function dataTexture(data: Uint8Array, size: number, repeat: number, srgb = false) {
  const tex = new DataTexture(data, size, size, RGBAFormat);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.magFilter = LinearFilter;
  tex.minFilter = LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.colorSpace = srgb ? SRGBColorSpace : NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export interface LeatherMaps {
  map: Texture;
  normalMap: Texture;
  roughnessMap: Texture;
}

export function createLeatherMaps(size = 512, repeat = 3): LeatherMaps {
  const grain = cellular(size, 46, 7);
  const fine = valueNoise(size, 64, 2, 19);
  const mottle = valueNoise(size, 4, 3, 31);
  const height = new Float32Array(size * size);
  for (let i = 0; i < height.length; i++) {
    const crease = Math.min(1, grain[i] / 0.42);
    height[i] = Math.pow(crease, 0.6) * 0.85 + fine[i] * 0.15;
  }
  const normal = heightToNormal(height, size, 5.5);
  const rough = new Uint8Array(size * size * 4);
  const color = new Uint8Array(size * size * 4);
  for (let i = 0; i < height.length; i++) {
    // Creases are rougher and a touch darker; tops of the grain pick up a soft sheen.
    const r = 0.58 + (1 - height[i]) * 0.22 + (fine[i] - 0.5) * 0.08;
    rough[i * 4 + 1] = Math.min(255, r * 255);
    rough[i * 4 + 3] = 255;
    const c = (0.84 + mottle[i] * 0.16) * (0.9 + height[i] * 0.1);
    color[i * 4] = color[i * 4 + 1] = color[i * 4 + 2] = Math.min(255, c * 255);
    color[i * 4 + 3] = 255;
  }
  return {
    map: dataTexture(color, size, repeat, true),
    normalMap: dataTexture(normal, size, repeat),
    roughnessMap: dataTexture(rough, size, repeat),
  };
}

/** Fine paper fibre normal map, tiled across page surfaces. */
export function createPaperNormal(size = 256, repeat = 6): Texture {
  const fibre = valueNoise(size, 32, 3, 53);
  const speck = valueNoise(size, 128, 1, 61);
  const h = new Float32Array(size * size);
  for (let i = 0; i < h.length; i++) h[i] = fibre[i] * 0.7 + speck[i] * 0.3;
  return dataTexture(heightToNormal(h, size, 1.6), size, repeat);
}

/** Printed page ground: warm ivory with gutter shadow on the spine side. */
export function createPageTexture(side: "left" | "right", w = 512, h = 700): Texture {
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#F3EEE4";
  ctx.fillRect(0, 0, w, h);
  // Spine is at u = 0 for the right page and u = 1 for the left page.
  const g = side === "right" ? ctx.createLinearGradient(0, 0, w * 0.22, 0) : ctx.createLinearGradient(w, 0, w * 0.78, 0);
  g.addColorStop(0, "rgba(92,78,55,0.30)");
  g.addColorStop(0.35, "rgba(92,78,55,0.08)");
  g.addColorStop(1, "rgba(92,78,55,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // Faint edge toning at the fore-edge.
  const e = side === "right" ? ctx.createLinearGradient(w, 0, w * 0.94, 0) : ctx.createLinearGradient(0, 0, w * 0.06, 0);
  e.addColorStop(0, "rgba(150,128,90,0.10)");
  e.addColorStop(1, "rgba(150,128,90,0)");
  ctx.fillStyle = e;
  ctx.fillRect(0, 0, w, h);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

/** Page-block edge: hundreds of fine sheets, tiled vertically. */
export function createPageEdgeTexture(): Texture {
  const w = 64;
  const h = 512;
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#E4DAC6";
  ctx.fillRect(0, 0, w, h);
  const rand = seeded(11);
  for (let y = 0; y < h; y += 1 + Math.floor(rand() * 2)) {
    const shade = 150 + Math.floor(rand() * 60);
    ctx.fillStyle = `rgba(${shade - 20},${shade - 28},${shade - 45},${0.18 + rand() * 0.22})`;
    ctx.fillRect(0, y, w, 1);
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = tex.wrapT = RepeatWrapping;
  return tex;
}

/**
 * Cover foil artwork, white on black: used as the alpha mask for the gold
 * layer and as its bump map, so the foil reads as stamped into the leather.
 */
export function createCoverFoilTexture(fonts: { display: string; ui: string }, w = 1024, h = 1390): Texture {
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#fff";
  ctx.fillStyle = "#fff";
  const inset1 = w * 0.07;
  const inset2 = w * 0.092;
  ctx.lineWidth = 5;
  ctx.strokeRect(inset1, inset1, w - inset1 * 2, h - inset1 * 2);
  ctx.lineWidth = 2;
  ctx.strokeRect(inset2, inset2, w - inset2 * 2, h - inset2 * 2);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const cx = w / 2;
  ctx.font = `400 ${w * 0.05}px ${fonts.display}`;
  drawTracked(ctx, "NIMBUSWORLD", cx, h * 0.43, w * 0.024);
  ctx.fillRect(cx - w * 0.06, h * 0.462, w * 0.12, 3);
  ctx.font = `italic 300 ${w * 0.092}px ${fonts.display}`;
  ctx.fillText("Your Next Chapter", cx, h * 0.545);
  ctx.font = `500 ${w * 0.019}px ${fonts.ui}`;
  drawTracked(ctx, "PUNE · MAHARASHTRA · INDIA", cx, h * 0.86, w * 0.011);

  const tex = new CanvasTexture(c);
  tex.colorSpace = NoColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export function drawTracked(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, tracking: number) {
  const chars = [...text];
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((s, v) => s + v, 0) + tracking * (chars.length - 1);
  const prevAlign = ctx.textAlign;
  ctx.textAlign = "left";
  let x = cx - total / 2;
  chars.forEach((ch, i) => {
    ctx.fillText(ch, x, y);
    x += widths[i] + tracking;
  });
  ctx.textAlign = prevAlign;
}

/** A transparent canvas for ink printed onto a page. */
export function createPrintTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d")!;
  draw(ctx, w, h);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Screen-space backdrop: the cool key-light pool from the design reference. */
export function createBackdropTexture(): Texture {
  const w = 1024;
  const h = 640;
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#06080D";
  ctx.fillRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w * 0.56, h * 0.44, 0, w * 0.56, h * 0.44, w * 0.58);
  g.addColorStop(0, "rgba(28,39,70,0.85)");
  g.addColorStop(0.45, "rgba(17,25,46,0.55)");
  g.addColorStop(1, "rgba(6,8,13,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  // Dither to avoid banding in the dark gradient.
  const img = ctx.getImageData(0, 0, w, h);
  const rand = seeded(5);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (rand() - 0.5) * 3;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

export function createGlowTexture(): Texture {
  const s = 128;
  const c = makeCanvas(s, s);
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,243,214,1)");
  g.addColorStop(0.18, "rgba(240,205,140,0.55)");
  g.addColorStop(0.5, "rgba(224,184,116,0.12)");
  g.addColorStop(1, "rgba(224,184,116,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}
