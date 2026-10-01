import { origin } from "@/data/content";

/**
 * Book geometry in world units. The page plane (the surface the story is
 * printed on when the book lies open) is world y = 0; the spine runs along z
 * at x = 0. Everything else in the scene is placed relative to that plane.
 */
export const BOOK = {
  width: 1.4, // page width (spine → fore-edge)
  height: 1.9, // page height (z)
  half: 0.14, // thickness of each half of the page block
  cover: 0.014, // board thickness
  overhang: 0.028, // board overhang beyond the page block
  gap: 0.003, // clearance between the two page halves when closed
} as const;

export const COLORS = {
  ink: "#06080D",
  navy: "#0D1830",
  leather: "#15213D",
  gold: "#B8955A",
  foil: "#C9A66B",
  goldLight: "#D2B785",
  ivory: "#F3EEE4",
  paper: "#EFE8DA",
  paperWhite: "#FBF8F1",
  rule: "#B7A98F",
  river: "#9FB0C2",
} as const;

/** Equirectangular map laid across the open spread; the gutter falls in the Atlantic. */
export const MAP = {
  centerLon: -20,
  centerLat: 12,
  scale: 0.0063, // world units per degree
  minLat: -56,
  maxLat: 80,
} as const;

export function project(lon: number, lat: number): [number, number] {
  return [(lon - MAP.centerLon) * MAP.scale, -(lat - MAP.centerLat) * MAP.scale];
}

export const PUNE = project(origin.lon, origin.lat);

/** Page area usable by the map (inside the margins of the spread). */
export const SPREAD = {
  xMax: BOOK.width - 0.05,
  zMax: BOOK.height / 2 - 0.05,
} as const;

/** Map zoom at the start of the pull-back: the city of Pune fills the page. */
export const MAP_ZOOM_MAX = 400;
