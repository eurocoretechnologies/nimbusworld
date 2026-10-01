import { CanvasTexture, NoColorSpace, SRGBColorSpace, type Texture } from "three";
import { canvasFonts } from "@/lib/fonts";
import { visaCopy, visaStages } from "@/data/content";
import { drawTracked } from "../textures";

/**
 * Artwork for the passport the book becomes. Deliberately not an imitation of
 * any real travel document: no state emblem, no document number, no
 * machine-readable zone — a guidance record with NIMBUSWORLD's own seal.
 */

const INK = "#0D1830";
const GOLD = "#6F5226";
const RIBBON = "#7E2F2A";

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

/** Cover seal in foil (white on black → alpha/bump mask, like the book title). */
export function createPassportFoil(w = 1024, h = 1390): Texture {
  const { display, ui } = canvasFonts;
  const c = canvas(w, h);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#fff";
  ctx.fillStyle = "#fff";
  const cx = w / 2;
  const cy = h * 0.46;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, w * 0.19, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(cx, cy, w * 0.172, 0, Math.PI * 2);
  ctx.stroke();
  // Fine radial rules inside the seal.
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * w * 0.15, cy + Math.sin(a) * w * 0.15);
    ctx.lineTo(cx + Math.cos(a) * w * 0.165, cy + Math.sin(a) * w * 0.165);
    ctx.stroke();
  }
  ctx.textAlign = "center";
  ctx.font = `600 ${w * 0.026}px ${ui}`;
  drawTracked(ctx, visaCopy.stamp.top.toUpperCase(), cx, cy - w * 0.035, w * 0.012);
  ctx.font = `italic 400 ${w * 0.062}px ${display}`;
  ctx.fillText(visaCopy.stamp.middle, cx, cy + w * 0.04);
  ctx.font = `400 ${w * 0.05}px ${display}`;
  drawTracked(ctx, "NIMBUSWORLD", cx, h * 0.78, w * 0.022);
  ctx.font = `600 ${w * 0.018}px ${ui}`;
  drawTracked(ctx, "GUIDANCE RECORD", cx, h * 0.83, w * 0.011);
  const tex = new CanvasTexture(c);
  tex.colorSpace = NoColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Security-style guilloche wash, printed pale on both inner pages. */
function guilloche(ctx: CanvasRenderingContext2D, w: number, h: number, seed: number) {
  ctx.save();
  ctx.lineWidth = 1;
  for (let k = 0; k < 16; k++) {
    ctx.strokeStyle = k % 2 ? "rgba(140,107,55,0.16)" : "rgba(58,96,110,0.12)";
    ctx.beginPath();
    for (let i = 0; i <= 240; i++) {
      const t = i / 240;
      const a = t * Math.PI * 2;
      const r = w * (0.2 + k * 0.012) * (1 + 0.08 * Math.sin(a * (7 + seed) + k * 0.4));
      const x = w / 2 + Math.cos(a) * r * 1.2;
      const y = h * 0.5 + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  for (let k = 0; k < 28; k++) {
    ctx.strokeStyle = "rgba(58,96,110,0.07)";
    ctx.beginPath();
    for (let i = 0; i <= 120; i++) {
      const x = (i / 120) * w;
      const y = h * 0.08 + k * h * 0.032 + Math.sin(i * 0.22 + k * 0.5) * h * 0.008;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function pageCanvas(w: number, h: number, seed: number) {
  const c = canvas(w, h);
  const ctx = c.getContext("2d")!;
  guilloche(ctx, w, h, seed);
  return { c, ctx };
}

function toTexture(c: HTMLCanvasElement) {
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export function createPassportLeftPage(w = 1024, h = 1390): Texture {
  const { ui } = canvasFonts;
  const { c, ctx } = pageCanvas(w, h, 0);
  ctx.fillStyle = "rgba(53,58,69,0.9)";
  ctx.font = `600 ${w * 0.017}px ${ui}`;
  ctx.textAlign = "center";
  drawTracked(ctx, "GUIDANCE RECORD · NIMBUSWORLD", w / 2, h * 0.06, w * 0.008);
  return toTexture(c);
}

/** The stage checklist; redrawn as stages complete (completed = 0…6). */
export class ChecklistPage {
  readonly texture: Texture;
  private ctx: CanvasRenderingContext2D;
  private w: number;
  private h: number;
  private shown = -1;

  constructor(w = 1024, h = 1390) {
    const { c, ctx } = pageCanvas(w, h, 2);
    this.ctx = ctx;
    this.w = w;
    this.h = h;
    this.texture = toTexture(c);
    this.draw(0);
  }

  draw(completed: number) {
    if (completed === this.shown) return;
    this.shown = completed;
    const { ctx, w, h } = this;
    const { display, ui } = canvasFonts;
    ctx.clearRect(0, 0, w, h);
    guilloche(ctx, w, h, 2);
    const left = w * 0.16;
    const right = w * 0.84;
    const top = h * 0.2;
    const row = h * 0.1;
    visaStages.forEach((stage, i) => {
      const y = top + i * row;
      const done = i < completed;
      const now = i === completed;
      ctx.fillStyle = GOLD;
      ctx.font = `600 ${w * 0.022}px ${ui}`;
      ctx.textAlign = "left";
      ctx.fillText(stage.number, left, y);
      ctx.fillStyle = done || now ? INK : "rgba(64,69,80,0.95)";
      ctx.font = `${now ? "italic " : ""}400 ${w * 0.052}px ${display}`;
      ctx.fillText(stage.title, left + w * 0.09, y);
      ctx.strokeStyle = now ? INK : "rgba(185,172,146,0.9)";
      ctx.lineWidth = now ? 2 : 1.4;
      ctx.beginPath();
      ctx.moveTo(left, y + row * 0.36);
      ctx.lineTo(right, y + row * 0.36);
      ctx.stroke();
      if (done) {
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(right - w * 0.05, y - w * 0.012);
        ctx.lineTo(right - w * 0.034, y + w * 0.004);
        ctx.lineTo(right - w * 0.004, y - w * 0.03);
        ctx.stroke();
      } else if (now) {
        ctx.fillStyle = INK;
        ctx.font = `600 ${w * 0.018}px ${ui}`;
        ctx.textAlign = "right";
        drawTracked(ctx, visaCopy.now.toUpperCase(), right - w * 0.03, y, w * 0.008);
      }
    });
    this.texture.needsUpdate = true;
  }
}

/** The round "Guided — every step — Pune" stamp, in ribbon-red ink with a worn edge. */
export function createStampTexture(size = 512): Texture {
  const { display, ui } = canvasFonts;
  const c = canvas(size, size);
  const ctx = c.getContext("2d")!;
  const cx = size / 2;
  ctx.strokeStyle = RIBBON;
  ctx.fillStyle = RIBBON;
  ctx.lineWidth = size * 0.014;
  ctx.beginPath();
  ctx.arc(cx, cx, size * 0.44, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = size * 0.006;
  ctx.beginPath();
  ctx.arc(cx, cx, size * 0.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.font = `600 ${size * 0.06}px ${ui}`;
  drawTracked(ctx, visaCopy.stamp.top.toUpperCase(), cx, cx - size * 0.04, size * 0.022);
  ctx.font = `italic 400 ${size * 0.11}px ${display}`;
  ctx.fillText(visaCopy.stamp.middle, cx, cx + size * 0.09);
  ctx.font = `600 ${size * 0.045}px ${ui}`;
  drawTracked(ctx, visaCopy.stamp.bottom.toUpperCase(), cx, cx + size * 0.2, size * 0.02);
  // Worn ink: knock random specks out of the impression.
  ctx.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    ctx.globalAlpha = Math.random() * 0.6;
    ctx.fillRect(x, y, 1 + Math.random() * 3, 1 + Math.random() * 2);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  return toTexture(c);
}
