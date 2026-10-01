import type { Topology } from "topojson-specification";
import type { ReliefBuffers } from "./buildRelief";

let cache: Promise<ReliefBuffers> | null = null;

async function buildOnMainThread(detail: "50m" | "110m") {
  const [{ buildRelief }, data] = await Promise.all([
    import("./buildRelief"),
    detail === "50m" ? import("world-atlas/countries-50m.json") : import("world-atlas/countries-110m.json"),
  ]);
  return buildRelief(data.default as unknown as Topology, detail === "50m" ? 0.35 : 0.8);
}

/** Builds the relief once per session, off the main thread where possible. */
export function loadRelief(detail: "50m" | "110m"): Promise<ReliefBuffers> {
  if (cache) return cache;
  cache = new Promise<ReliefBuffers>((resolve, reject) => {
    let worker: Worker;
    try {
      worker = new Worker(new URL("./relief.worker.ts", import.meta.url), { type: "module" });
    } catch {
      buildOnMainThread(detail).then(resolve, reject);
      return;
    }
    worker.onmessage = (e: MessageEvent<ReliefBuffers>) => {
      resolve(e.data);
      worker.terminate();
    };
    worker.onerror = () => {
      worker.terminate();
      buildOnMainThread(detail).then(resolve, reject);
    };
    worker.postMessage({ detail });
  });
  return cache;
}
