import earcut from "earcut";
import { merge } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import { MAP, project } from "../constants";

/**
 * Turns Natural Earth TopoJSON into typed arrays for a paper relief:
 * a flat top cap per landmass (height 1, scaled at runtime) plus outward
 * facing walls, and a coastline line list. Only merged land is produced —
 * no political borders are drawn anywhere on the map.
 */
export interface ReliefBuffers {
  positions: Float32Array;
  normals: Float32Array;
  index: Uint32Array;
  coast: Float32Array;
  graticule: Float32Array;
}

type Ring = number[][];

function signedArea(ring: Ring) {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    a += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]);
  }
  return a / 2;
}

export function buildRelief(topology: Topology, minAreaDeg2: number): ReliefBuffers {
  const countries = topology.objects.countries as GeometryCollection;
  // Antarctica (ISO 010) is dropped; the map is cropped south of Tierra del Fuego.
  const land = merge(
    topology as never,
    countries.geometries.filter((g) => g.id !== "010") as never,
  );

  const pos: number[] = [];
  const nrm: number[] = [];
  const idx: number[] = [];
  const coast: number[] = [];

  for (const polygon of land.coordinates as Ring[][]) {
    const outer = polygon[0];
    if (Math.abs(signedArea(outer)) < minAreaDeg2) continue;
    let maxLat = -90;
    for (const [, lat] of outer) maxLat = Math.max(maxLat, lat);
    if (maxLat < MAP.minLat) continue;

    // Project rings into map space (x, z).
    const rings = polygon.map((ring) => {
      const pts = ring.slice(0, ring.length - 1); // drop closing duplicate
      return pts.map(([lon, lat]) => project(lon, Math.max(lat, MAP.minLat - 2)));
    });

    // Top cap via earcut.
    const flat: number[] = [];
    const holes: number[] = [];
    rings.forEach((r, ri) => {
      if (ri > 0) holes.push(flat.length / 2);
      for (const [x, z] of r) flat.push(x, z);
    });
    const tris = earcut(flat, holes, 2);
    const base = pos.length / 3;
    for (let i = 0; i < flat.length; i += 2) {
      pos.push(flat[i], 1, flat[i + 1]);
      nrm.push(0, 1, 0);
    }
    for (let t = 0; t < tris.length; t += 3) {
      const a = tris[t];
      const b = tris[t + 1];
      const c = tris[t + 2];
      const ax = flat[a * 2], az = flat[a * 2 + 1];
      const bx = flat[b * 2], bz = flat[b * 2 + 1];
      const cx = flat[c * 2], cz = flat[c * 2 + 1];
      // Face normal y-component; flip so every cap faces up.
      const ny = (bz - az) * (cx - ax) - (bx - ax) * (cz - az);
      if (ny >= 0) idx.push(base + a, base + b, base + c);
      else idx.push(base + a, base + c, base + b);
    }

    // Walls — one quad per edge, facing away from the land.
    rings.forEach((r, ringIndex) => {
      const n = r.length;
      // Orientation is recomputed in (x, z) space; area > 0 means counter-clockwise there.
      let area = 0;
      for (let i = 0, j = n - 1; i < n; j = i++) area += (r[j][0] - r[i][0]) * (r[j][1] + r[i][1]);
      for (let i = 0; i < n; i++) {
        const [ax, az] = r[i];
        const [bx, bz] = r[(i + 1) % n];
        const dx = bx - ax;
        const dz = bz - az;
        const len = Math.hypot(dx, dz);
        if (len < 1e-7) continue;
        coast.push(ax, 0, az, bx, 0, bz);
        // Start from the left-hand normal; flip to point out of the ring's interior,
        // and flip again for holes, whose walls face into the hole (the water).
        let nx = -dz / len;
        let nz = dx / len;
        if ((area > 0) !== (ringIndex > 0)) {
          nx = -nx;
          nz = -nz;
        }
        const w = pos.length / 3;
        pos.push(ax, 0, az, bx, 0, bz, bx, 1, bz, ax, 1, az);
        for (let q = 0; q < 4; q++) nrm.push(nx, 0, nz);
        // Geometric normal of (a0, b0, b1) is (−dz, 0, dx); match the outward normal.
        const gx = -dz;
        const gz = dx;
        if (gx * nx + gz * nz >= 0) idx.push(w, w + 1, w + 2, w, w + 2, w + 3);
        else idx.push(w, w + 2, w + 1, w, w + 3, w + 2);
      }
    });
  }

  // Graticule every 15°, clipped to the cropped latitude band.
  const grat: number[] = [];
  for (let lon = -180; lon <= 180; lon += 15) {
    for (let lat = MAP.minLat; lat < MAP.maxLat; lat += 2) {
      const [x1, z1] = project(lon, lat);
      const [x2, z2] = project(lon, Math.min(lat + 2, MAP.maxLat));
      grat.push(x1, 0, z1, x2, 0, z2);
    }
  }
  for (let lat = -45; lat <= 75; lat += 15) {
    for (let lon = -180; lon < 180; lon += 3) {
      const [x1, z1] = project(lon, lat);
      const [x2, z2] = project(lon + 3, lat);
      grat.push(x1, 0, z1, x2, 0, z2);
    }
  }

  return {
    positions: new Float32Array(pos),
    normals: new Float32Array(nrm),
    index: new Uint32Array(idx),
    coast: new Float32Array(coast),
    graticule: new Float32Array(grat),
  };
}
