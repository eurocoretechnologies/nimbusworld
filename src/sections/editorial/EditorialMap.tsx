"use client";

import { useEffect, useState } from "react";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import { destinations, origin } from "@/data/content";

const W = 1000;
const H = 440;
const LON0 = -170;
const LAT_TOP = 80;
const LAT_BOTTOM = -56;
const x = (lon: number) => ((lon - LON0 + 360) % 360) * (W / 350);
const y = (lat: number) => ((LAT_TOP - lat) / (LAT_TOP - LAT_BOTTOM)) * H;

/** Static paper map of coastlines (no borders) with the destination markers. */
export function EditorialMap({ selected, onSelect }: { selected: string | null; onSelect: (id: string | null) => void }) {
  const [paths, setPaths] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    import("world-atlas/land-110m.json").then((mod) => {
      const topo = mod.default as unknown as Topology;
      const land = feature(topo, topo.objects.land as GeometryCollection);
      let d = "";
      for (const f of land.features) {
        const geom = f.geometry as GeoJSON.MultiPolygon | GeoJSON.Polygon;
        const polys = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
        for (const poly of polys) {
          for (const ring of poly) {
            let prevX: number | null = null;
            ring.forEach(([lon, lat], i) => {
              const px = x(lon);
              // Break the path where a ring wraps across the map's seam.
              const jump = prevX !== null && Math.abs(px - prevX) > W / 2;
              d += `${i === 0 || jump ? "M" : "L"}${px.toFixed(1)},${y(Math.max(lat, LAT_BOTTOM - 4)).toFixed(1)}`;
              prevX = px;
            });
          }
        }
      }
      if (alive) setPaths(d);
    });
    return () => {
      alive = false;
    };
  }, []);

  const ox = x(origin.lon);
  const oy = y(origin.lat);

  return (
    <div className="ed-map">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Map of destinations, with routes drawn from Pune">
        <rect width={W} height={H} fill="#F2ECE1" />
        {Array.from({ length: 24 }, (_, i) => (
          <line key={`m${i}`} x1={i * (W / 23.33)} y1={0} x2={i * (W / 23.33)} y2={H} stroke="#D9CFBC" strokeWidth="0.5" />
        ))}
        {paths && <path d={paths} fill="#FBF8F1" stroke="#B7A98F" strokeWidth="0.6" />}
        {destinations.map((dst) => {
          const dx = x(dst.lon);
          const dy = y(dst.lat);
          const mx = (ox + dx) / 2;
          const my = Math.min(oy, dy) - 60;
          const isSel = selected === dst.id;
          return (
            <path
              key={`r${dst.id}`}
              d={`M${ox},${oy} Q${mx},${my} ${dx},${dy}`}
              fill="none"
              stroke={isSel ? "#9C7A43" : "#B7A98F"}
              strokeWidth={isSel ? 1.4 : 0.8}
              strokeDasharray={isSel ? undefined : "2 4"}
            />
          );
        })}
        <circle cx={ox} cy={oy} r="5" fill="none" stroke="#0D1830" />
        <circle cx={ox} cy={oy} r="1.8" fill="#0D1830" />
        <text x={ox + 8} y={oy + 14} fontSize="9" letterSpacing="1.6" fill="#0D1830" fontWeight="600">
          PUNE — ORIGIN
        </text>
      </svg>
      {destinations.map((dst) => (
        <button
          key={dst.id}
          type="button"
          className={`ed-pin ${selected === dst.id ? "is-selected" : ""} is-${dst.label ?? "right"}`}
          style={{ left: `${(x(dst.lon) / W) * 100}%`, top: `${(y(dst.lat) / H) * 100}%` }}
          aria-pressed={selected === dst.id}
          onClick={() => onSelect(selected === dst.id ? null : dst.id)}
        >
          <span className="ed-pin__dot" aria-hidden="true" />
          <span className="ed-pin__label">{dst.name}</span>
        </button>
      ))}
    </div>
  );
}
