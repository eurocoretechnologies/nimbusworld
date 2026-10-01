export interface Capabilities {
  webgl: boolean;
  reducedMotion: boolean;
  isMobile: boolean;
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return false;
    (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function detectCapabilities(): Capabilities {
  const params = new URLSearchParams(window.location.search);
  // ?editorial forces the static version for review.
  const forceEditorial = params.has("editorial");
  return {
    webgl: !forceEditorial && hasWebGL(),
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    isMobile: window.matchMedia("(max-width: 767px)").matches,
  };
}
