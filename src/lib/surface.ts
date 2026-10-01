import { local } from "./timeline";
import { paperWorld } from "@/three/director";

/**
 * Whether the top of the frame is paper (the camera is down on the page, or
 * the whole frame has turned ivory) — the header and bookmark switch to ink.
 */
export function onPaperAt(p: number) {
  const pune = local(p, "pune");
  const pull = local(p, "pullback");
  return (pune > 0.12 && pull < 0.8) || paperWorld(p) > 0.5;
}
