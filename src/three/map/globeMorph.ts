import { Vector3, type Material } from "three";
import { MAP } from "../constants";

/**
 * Wraps the flat paper map onto a sphere in the vertex shader. Every map
 * vertex already encodes its longitude (x) and latitude (−z), so the flat
 * relief and the globe are the same geometry, blended by uMorph.
 */
export const GLOBE_CENTER = new Vector3(0, 0.95, 0.05);
export const GLOBE_RADIUS = 0.5;

export const globeUniforms = {
  uMorph: { value: 0 },
  uSpin: { value: 0 },
  uCenter: { value: GLOBE_CENTER },
  uRadius: { value: GLOBE_RADIUS },
};

const GLSL = /* glsl */ `
uniform float uMorph;
uniform float uSpin;
uniform vec3 uCenter;
uniform float uRadius;
uniform float uYScale;
uniform float uYOffset;
vec3 globePoint(vec3 p, out vec3 n) {
  float lon = radians(p.x / ${MAP.scale.toFixed(6)} + ${MAP.centerLon.toFixed(2)} - uSpin);
  float lat = radians(-p.z / ${MAP.scale.toFixed(6)} + ${MAP.centerLat.toFixed(2)});
  n = vec3(sin(lon) * cos(lat), sin(lat), cos(lon) * cos(lat));
  return uCenter + n * (uRadius + p.y * uYScale + uYOffset);
}
`;

export interface GlobeLayer {
  /** World height of one object-space unit of y (the relief height for land). */
  uYScale: { value: number };
  /** Fixed radial offset above the globe surface. */
  uYOffset: { value: number };
}

export function applyGlobeMorph(material: Material, opts: { normals: boolean }): GlobeLayer {
  const layer: GlobeLayer = { uYScale: { value: 0 }, uYOffset: { value: 0 } };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, globeUniforms, layer);
    let vs = shader.vertexShader.replace("#include <common>", `#include <common>\n${GLSL}`);
    if (opts.normals) {
      vs = vs.replace(
        "#include <defaultnormal_vertex>",
        `#include <defaultnormal_vertex>
        { vec3 gn; globePoint(position, gn);
          transformedNormal = normalize(mix(transformedNormal, mat3(viewMatrix) * gn, uMorph)); }`,
      );
    }
    vs = vs.replace(
      "#include <project_vertex>",
      `vec3 _gn;
      vec3 _gp = globePoint(transformed, _gn);
      vec4 _fw = modelMatrix * vec4(transformed, 1.0);
      vec4 mvPosition = viewMatrix * vec4(mix(_fw.xyz, _gp, uMorph), 1.0);
      gl_Position = projectionMatrix * mvPosition;`,
    );
    shader.vertexShader = vs;
  };
  material.customProgramCacheKey = () => `nimbus-globe-${opts.normals ? "n" : "l"}`;
  return layer;
}
