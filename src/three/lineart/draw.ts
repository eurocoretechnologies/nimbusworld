/**
 * A tiny 3D pen: builds line-segment lists (x1,y1,z1,x2,y2,z2 …) for the
 * architectural drawings that rise out of the page.
 */
export type V3 = [number, number, number];

export class Pen {
  readonly out: number[] = [];

  seg(a: V3, b: V3) {
    this.out.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    return this;
  }

  poly(pts: V3[], closed = false) {
    for (let i = 0; i < pts.length - 1; i++) this.seg(pts[i], pts[i + 1]);
    if (closed && pts.length > 2) this.seg(pts[pts.length - 1], pts[0]);
    return this;
  }

  /** Axis-aligned box edges; (cx, cz) centre, y0 base. */
  box(cx: number, y0: number, cz: number, w: number, h: number, d: number) {
    const x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2, y1 = y0 + h;
    const b: V3[] = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]];
    const t: V3[] = b.map(([x, , z]) => [x, y1, z]);
    this.poly(b, true).poly(t, true);
    for (let i = 0; i < 4; i++) this.seg(b[i], t[i]);
    return this;
  }

  /** Horizontal ring. */
  ring(cx: number, y: number, cz: number, r: number, n = 48, sx = 1) {
    const pts: V3[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push([cx + Math.cos(a) * r * sx, y, cz + Math.sin(a) * r]);
    }
    return this.poly(pts, true);
  }

  /** Sampled curve from a parametric function. */
  curve(f: (t: number) => V3, n = 24) {
    const pts: V3[] = [];
    for (let i = 0; i <= n; i++) pts.push(f(i / n));
    return this.poly(pts);
  }

  /** Horizontal rows of window rectangles on a facade facing +z. */
  windows(cx: number, y0: number, z: number, w: number, h: number, cols: number, rows: number, ww: number, wh: number) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = cx - w / 2 + (w / cols) * (c + 0.5);
        const y = y0 + (h / rows) * (r + 0.5);
        this.poly([[x - ww / 2, y - wh / 2, z], [x + ww / 2, y - wh / 2, z], [x + ww / 2, y + wh / 2, z], [x - ww / 2, y + wh / 2, z]], true);
      }
    }
    return this;
  }

  /** Sorted bottom-up so a partial draw grows from the page upward. */
  build(): Float32Array {
    const n = this.out.length / 6;
    const idx = Array.from({ length: n }, (_, i) => i);
    const key = (i: number) => Math.min(this.out[i * 6 + 1], this.out[i * 6 + 4]) + 0.02 * Math.abs(this.out[i * 6 + 1] - this.out[i * 6 + 4]);
    idx.sort((a, b) => key(a) - key(b));
    const res = new Float32Array(this.out.length);
    idx.forEach((src, dst) => res.set(this.out.slice(src * 6, src * 6 + 6), dst * 6));
    return res;
  }
}
