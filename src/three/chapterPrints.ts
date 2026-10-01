import { CanvasTexture, SRGBColorSpace, type Texture } from "three";
import { canvasFonts } from "@/lib/fonts";
import { courses, coursesCopy, journey, professionalCourses } from "@/data/content";
import { drawTracked } from "./textures";

const INK = "#0D1830";
const SOFT = "#353A45";
const MUTED = "#50555F";
const GOLD = "#6F5226";
const GOLD_LINE = "#A07E45";

function make(w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!, w, h);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
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

function tracked(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, tracking: number, align: "left" | "right" = "left") {
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * (chars.length - 1);
  let cx = align === "left" ? x : x - total;
  const prev = ctx.textAlign;
  ctx.textAlign = "left";
  chars.forEach((c, i) => {
    ctx.fillText(c, cx, y);
    cx += widths[i] + tracking;
  });
  ctx.textAlign = prev;
}

const SHEET_TINTS = ["#EFE8DB", "#FBF8F1", "#EDE6D8", "#F1EBDF", "#EAE3D5"];

/** One editorial course page per course (after the Courses reference board). */
export function createCoursePrints(): Texture[] {
  const { display, ui } = canvasFonts;
  return courses.map((course, i) =>
    make(720, 998, (ctx, w, h) => {
      ctx.fillStyle = SHEET_TINTS[i % SHEET_TINTS.length];
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = GOLD_LINE;
      ctx.fillRect(0, 0, w, 6);
      const m = w * 0.1;
      ctx.fillStyle = GOLD;
      ctx.font = `600 ${w * 0.024}px ${ui}`;
      tracked(ctx, course.numeral, m, h * 0.09, w * 0.01);
      ctx.fillStyle = MUTED;
      tracked(ctx, course.kicker.toUpperCase(), w - m, h * 0.09, w * 0.01, "right");
      ctx.fillStyle = INK;
      ctx.font = `400 ${w * 0.11}px ${display}`;
      const words = course.title.split(" ");
      const titleLines = words.length > 1 ? [words.slice(0, -1).join(" "), words[words.length - 1]] : words;
      titleLines.forEach((l, k) => ctx.fillText(l, m, h * 0.42 + k * w * 0.115));
      let y = h * 0.42 + (titleLines.length - 1) * w * 0.115 + w * 0.09;
      ctx.fillStyle = SOFT;
      ctx.font = `500 ${w * 0.03}px ${ui}`;
      wrap(ctx, course.description, w - m * 2).forEach((l) => {
        ctx.fillText(l, m, y);
        y += w * 0.048;
      });
      y += w * 0.04;
      ctx.fillStyle = "#E2D9C8";
      ctx.fillRect(m, y, w - m * 2, 2);
      y += w * 0.07;
      ctx.fillStyle = "#20273A";
      ctx.font = `500 ${w * 0.027}px ${ui}`;
      coursesCopy.pageList.forEach((item) => {
        ctx.fillText(item, m, y);
        y += w * 0.052;
      });
      ctx.fillStyle = INK;
      ctx.font = `600 ${w * 0.022}px ${ui}`;
      tracked(ctx, coursesCopy.explore.toUpperCase(), m, h * 0.92, w * 0.009);
      ctx.fillStyle = GOLD_LINE;
      ctx.fillRect(m, h * 0.92 + w * 0.02, w * 0.36, 2);
    }),
  );
}

/** Journey step leaves: a large numeral and the step, on the right-hand page. */
export function createStepPrints(count: number): Texture[] {
  const { display, ui } = canvasFonts;
  return journey.steps.slice(0, count).map((step) =>
    make(512, 695, (ctx, w, h) => {
      ctx.fillStyle = "#F3EEE4";
      ctx.fillRect(0, 0, w, h);
      const g = ctx.createLinearGradient(0, 0, w * 0.2, 0);
      g.addColorStop(0, "rgba(92,78,55,0.22)");
      g.addColorStop(1, "rgba(92,78,55,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.textAlign = "center";
      ctx.fillStyle = GOLD;
      ctx.font = `600 ${w * 0.024}px ${ui}`;
      drawTracked(ctx, "THE JOURNEY", w / 2, h * 0.2, w * 0.01);
      ctx.fillStyle = INK;
      ctx.font = `400 ${w * 0.3}px ${display}`;
      ctx.fillText(step.number, w / 2, h * 0.5);
      ctx.font = `italic 400 ${w * 0.1}px ${display}`;
      ctx.fillText(step.title, w / 2, h * 0.64);
      ctx.fillStyle = GOLD_LINE;
      ctx.fillRect(w / 2 - w * 0.04, h * 0.69, w * 0.08, 2);
      ctx.fillStyle = SOFT;
      ctx.font = `500 ${w * 0.028}px ${ui}`;
      wrap(ctx, step.line, w * 0.6).forEach((l, k) => ctx.fillText(l, w / 2, h * 0.75 + k * w * 0.045));
    }),
  );
}

export interface ProfessionalPrints {
  /** Letter halves for the split-flap tiles: [top, bottom] per letter. */
  flaps: { top: Texture; bottom: Texture }[];
  blank: Texture;
  tag: Texture;
  docFront: Texture;
  docBack: Texture;
  labels: Texture[];
}

/** Split-flap letters, a luggage tag and a document stack — the three pathways as objects. */
export function createProfessionalPrints(): ProfessionalPrints {
  const { display, ui } = canvasFonts;
  const tile = (letter: string | null, half: "top" | "bottom") =>
    make(256, 186, (ctx, w, h) => {
      ctx.fillStyle = "#0D1830";
      ctx.fillRect(0, 0, w, h);
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, half === "top" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.0)");
      g.addColorStop(1, half === "top" ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.25)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      if (letter) {
        ctx.fillStyle = "#D2B785";
        ctx.font = `400 ${h * 2.1}px ${display}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // Each half shows its part of one letter centred on the hinge line.
        ctx.fillText(letter, w / 2, half === "top" ? h * 1.02 : -h * 0.02);
      }
    });
  const letters = ["I", "A", "T", "A"];
  const flaps = letters.map((l) => ({ top: tile(l, "top"), bottom: tile(l, "bottom") }));
  const blank = tile(null, "top");

  const tag = make(600, 800, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#FBF8F1";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.24, h * 0.02);
    ctx.lineTo(w * 0.76, h * 0.02);
    ctx.lineTo(w * 0.98, h * 0.12);
    ctx.lineTo(w * 0.98, h * 0.98);
    ctx.lineTo(w * 0.02, h * 0.98);
    ctx.lineTo(w * 0.02, h * 0.12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.08, w * 0.04, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    ctx.beginPath();
    ctx.arc(w / 2, h * 0.08, w * 0.04, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.textAlign = "center";
    ctx.font = `400 ${w * 0.26}px ${display}`;
    ctx.fillText("PNQ", w / 2, h * 0.58);
    ctx.fillStyle = "#454A55";
    ctx.font = `600 ${w * 0.035}px ${ui}`;
    drawTracked(ctx, "ORIGIN · PUNE", w / 2, h * 0.72, w * 0.014);
    ctx.fillStyle = GOLD_LINE;
    ctx.fillRect(w * 0.3, h * 0.8, w * 0.4, 3);
  });

  const doc = (front: boolean) =>
    make(600, 760, (ctx, w, h) => {
      ctx.fillStyle = front ? "#FBF8F1" : "#EDE6D8";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = front ? INK : "#B4A88F";
      ctx.lineWidth = 3;
      ctx.strokeRect(1.5, 1.5, w - 3, h - 3);
      if (!front) return;
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 2;
      for (let r = 0; r < 5; r++) {
        const y = h * 0.4 + r * h * 0.1;
        ctx.strokeRect(w * 0.12, y - h * 0.025, h * 0.045, h * 0.045);
        ctx.beginPath();
        ctx.moveTo(w * 0.24, y);
        ctx.lineTo(w * (0.7 + (r % 3) * 0.06), y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = INK;
      ctx.font = `400 ${w * 0.07}px ${display}`;
      ctx.fillText("Application", w * 0.12, h * 0.24);
      ctx.fillStyle = MUTED;
      ctx.font = `600 ${w * 0.028}px ${ui}`;
      tracked(ctx, "CHECKLIST", w * 0.12, h * 0.3, w * 0.012);
      // Paperclip.
      ctx.strokeStyle = "#454A55";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(w * 0.72, -h * 0.02);
      ctx.lineTo(w * 0.72, h * 0.12);
      ctx.quadraticCurveTo(w * 0.72, h * 0.16, w * 0.77, h * 0.16);
      ctx.quadraticCurveTo(w * 0.82, h * 0.16, w * 0.82, h * 0.12);
      ctx.lineTo(w * 0.82, h * 0.02);
      ctx.stroke();
    });

  // Small printed captions laid on the page in front of each object.
  const labels = professionalCourses.map((c) =>
    make(640, 220, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = MUTED;
      ctx.font = `600 ${h * 0.1}px ${ui}`;
      tracked(ctx, c.pathway.toUpperCase(), 0, h * 0.2, h * 0.035);
      ctx.fillStyle = INK;
      ctx.font = `400 ${h * 0.3}px ${display}`;
      ctx.fillText(c.title, 0, h * 0.6);
      ctx.fillStyle = SOFT;
      ctx.font = `500 ${h * 0.1}px ${ui}`;
      ctx.fillText(`${c.description} ${c.details}.`, 0, h * 0.85);
    }),
  );
  return { flaps, blank, tag, docFront: doc(true), docBack: doc(false), labels };
}
