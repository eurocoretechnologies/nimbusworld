/// <reference lib="webworker" />
import type { Topology } from "topojson-specification";
import { buildRelief } from "./buildRelief";

type Detail = "50m" | "110m";

self.onmessage = async (event: MessageEvent<{ detail: Detail }>) => {
  const topology = (
    event.data.detail === "50m"
      ? await import("world-atlas/countries-50m.json")
      : await import("world-atlas/countries-110m.json")
  ).default as unknown as Topology;
  const out = buildRelief(topology, event.data.detail === "50m" ? 0.35 : 0.8);
  (self as unknown as DedicatedWorkerGlobalScope).postMessage(out, [
    out.positions.buffer,
    out.normals.buffer,
    out.index.buffer,
    out.coast.buffer,
    out.graticule.buffer,
  ]);
};
