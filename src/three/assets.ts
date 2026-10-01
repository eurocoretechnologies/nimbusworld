import type { Texture } from "three";
import { canvasFonts } from "@/lib/fonts";
import { finale, languages, prologue } from "@/data/content";
import {
  createBackdropTexture,
  createCoverFoilTexture,
  createGlowTexture,
  createLeatherMaps,
  createPageEdgeTexture,
  createPageTexture,
  createPaperNormal,
  createPrintTexture,
  drawTracked,
  type LeatherMaps,
} from "./textures";
import { createPassportFoil } from "./visa/passportPrints";
import { createCoursePrints, createProfessionalPrints, createStepPrints, type ProfessionalPrints } from "./chapterPrints";
import { JOURNEY_LEAVES } from "./journey/journeyState";

export interface SceneAssets {
  leather: LeatherMaps;
  paperNormal: Texture;
  pageLeft: Texture;
  pageRight: Texture;
  leafFront: Texture;
  leafBack: Texture;
  edge: Texture;
  foil: Texture;
  passportFoil: Texture;
  backdrop: Texture;
  glow: Texture;
  prologuePrint: Texture;
  finalePrint: Texture;
  glyphs: Texture[];
  coursePrints: Texture[];
  stepPrints: Texture[];
  professional: ProfessionalPrints;
}

const INK = "#0D1830";
const GOLD_INK = "#7A5A28";
const SOFT_INK = "#353A45";

async function fontsReady() {
  if (typeof document === "undefined" || !document.fonts) return;
  const { display, ui } = canvasFonts;
  await Promise.all([
    document.fonts.load(`italic 400 64px ${display}`),
    document.fonts.load(`400 64px ${display}`),
    document.fonts.load(`500 64px ${display}`),
    document.fonts.load(`500 20px ${ui}`),
    document.fonts.load(`600 20px ${ui}`),
    document.fonts.load(`400 200px ${canvasFonts.cjk}`, "日本語中文"),
  ]).catch(() => undefined);
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Page leaf ground — the ivory page with a quiet running head. */
function leafTexture(side: "left" | "right") {
  const { ui } = canvasFonts;
  return createPrintTexture(512, 695, (ctx, w, h) => {
    ctx.fillStyle = "#F3EEE4";
    ctx.fillRect(0, 0, w, h);
    const spineX = side === "right" ? 0 : w;
    const g = ctx.createLinearGradient(spineX, 0, side === "right" ? w * 0.2 : w * 0.8, 0);
    g.addColorStop(0, "rgba(92,78,55,0.22)");
    g.addColorStop(1, "rgba(92,78,55,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(111,82,38,0.85)";
    ctx.font = `600 ${w * 0.017}px ${ui}`;
    ctx.textAlign = "center";
    drawTracked(ctx, "YOUR NEXT CHAPTER", w / 2, h * 0.07, w * 0.006);
  });
}

function prologuePrint() {
  const { display, ui } = canvasFonts;
  return createPrintTexture(1024, 1390, (ctx, w, h) => {
    const left = w * 0.2;
    const maxW = w * 0.56;
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = GOLD_INK;
    ctx.font = `600 ${w * 0.02}px ${ui}`;
    ctx.textAlign = "left";
    let x = left;
    for (const ch of prologue.kicker.toUpperCase()) {
      ctx.fillText(ch, x, h * 0.3);
      x += ctx.measureText(ch).width + w * 0.0064;
    }
    ctx.fillStyle = INK;
    ctx.font = `italic 400 ${w * 0.075}px ${display}`;
    const lines = wrapLines(ctx, prologue.line, maxW);
    lines.forEach((l, i) => ctx.fillText(l, left, h * 0.37 + i * w * 0.079));
    const afterTitle = h * 0.37 + (lines.length - 1) * w * 0.079;
    ctx.fillStyle = "#A07E45";
    ctx.fillRect(left, afterTitle + w * 0.055, w * 0.07, 2);
    ctx.fillStyle = SOFT_INK;
    ctx.font = `500 ${w * 0.0205}px ${ui}`;
    wrapLines(ctx, prologue.body, maxW * 0.86).forEach((l, i) =>
      ctx.fillText(l, left, afterTitle + w * 0.115 + i * w * 0.036),
    );
  });
}

function finalePrint() {
  const { display, ui } = canvasFonts;
  return createPrintTexture(1024, 1390, (ctx, w, h) => {
    const cx = w / 2;
    ctx.textAlign = "center";
    ctx.fillStyle = GOLD_INK;
    ctx.font = `600 ${w * 0.02}px ${ui}`;
    drawTracked(ctx, finale.kicker.toUpperCase(), cx, h * 0.33, w * 0.0064);
    ctx.fillStyle = INK;
    ctx.font = `400 ${w * 0.078}px ${display}`;
    const lines = wrapLines(ctx, finale.line1, w * 0.62);
    lines.forEach((l, i) => ctx.fillText(l, cx, h * 0.415 + i * w * 0.085));
    const y = h * 0.415 + (lines.length - 1) * w * 0.085;
    ctx.fillStyle = "#A07E45";
    ctx.fillRect(cx - w * 0.035, y + w * 0.06, w * 0.07, 2);
    ctx.fillStyle = "#20273A";
    ctx.font = `italic 400 ${w * 0.052}px ${display}`;
    ctx.fillText(finale.line2, cx, y + w * 0.15);
  });
}

/** A single ink glyph printed large across the spread, with a soft bleed into the paper. */
function glyphPrint(text: string, index: number, name: string, isCjk: boolean) {
  const { display, ui, cjk } = canvasFonts;
  return createPrintTexture(2048, 1340, (ctx, w, h) => {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = isCjk ? `400 ${h * 0.4}px ${cjk}` : `italic 400 ${h * 0.46}px ${display}`;
    // Bleed: a blurred pass under the crisp one.
    ctx.fillStyle = "rgba(13,24,48,0.22)";
    ctx.filter = "blur(10px)";
    ctx.fillText(text, w / 2, h * 0.47);
    ctx.filter = "none";
    ctx.fillStyle = "rgba(13,24,48,0.92)";
    ctx.fillText(text, w / 2, h * 0.47);
    ctx.fillStyle = GOLD_INK;
    ctx.font = `600 ${h * 0.02}px ${ui}`;
    drawTracked(ctx, `0${index + 1} · ${name.toUpperCase()}`, w / 2, h * 0.84, h * 0.008);
  });
}

let cache: Promise<SceneAssets> | null = null;

export function loadSceneAssets(isMobile: boolean): Promise<SceneAssets> {
  if (!cache) {
    cache = fontsReady().then(() => ({
      leather: createLeatherMaps(512, 3),
      paperNormal: createPaperNormal(256, 5),
      pageLeft: createPageTexture("left"),
      pageRight: createPageTexture("right"),
      leafFront: leafTexture("right"),
      leafBack: leafTexture("left"),
      edge: createPageEdgeTexture(),
      foil: createCoverFoilTexture(canvasFonts),
      passportFoil: createPassportFoil(),
      backdrop: createBackdropTexture(),
      glow: createGlowTexture(),
      prologuePrint: prologuePrint(),
      finalePrint: finalePrint(),
      coursePrints: createCoursePrints(),
      stepPrints: createStepPrints(JOURNEY_LEAVES),
      professional: createProfessionalPrints(),
      glyphs: languages.map((l, i) => glyphPrint(l.native, i, l.name, l.id !== "german")),
    }));
  }
  return cache;
}
