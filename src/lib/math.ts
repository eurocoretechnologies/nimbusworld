export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const invLerp = (a: number, b: number, v: number) => clamp((v - a) / (b - a));
/** Remap v from [a,b] into 0..1, clamped. */
export const range = invLerp;

export const smoothstep = (t: number) => t * t * (3 - 2 * t);
export const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInCubic = (t: number) => t * t * t;
export const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

/** Rises 0→1 over [a,b] and falls back 1→0 over [c,d]. */
export const window4 = (v: number, a: number, b: number, c: number, d: number) =>
  Math.min(invLerp(a, b, v), 1 - invLerp(c, d, v));

/** Frame-rate independent exponential damping factor. */
export const damp = (lambda: number, dt: number) => 1 - Math.exp(-lambda * dt);

/** Deterministic PRNG (mulberry32) — keeps procedural geometry stable between renders. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
