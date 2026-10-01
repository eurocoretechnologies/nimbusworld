import {
  Color,
  DoubleSide,
  MeshDepthMaterial,
  MeshStandardMaterial,
  RGBADepthPacking,
  type Texture,
} from "three";

/**
 * A page leaf that bends around the spine. The leaf is authored flat in the
 * xz-plane with its hinge on x = 0; the vertex shader wraps it onto a
 * constant-curvature arc whose base angle is uTurn·π. Curvature vanishes at
 * both ends of the turn (sin(π·t)) and uCurl < 1 guarantees the free edge
 * never dips below the page plane on either side.
 */
const BEND_GLSL = /* glsl */ `
uniform float uTurn;
uniform float uCurl;
uniform float uWidth;
uniform float uLift;
vec3 bendPage(vec3 p, out vec3 n) {
  float s = max(p.x, 0.0);
  float theta = uTurn * PI;
  float k = uCurl * sin(uTurn * PI) / uWidth;
  float a = theta + k * s;
  vec3 q;
  if (abs(k) < 1e-4) {
    q = vec3(cos(theta) * s, sin(theta) * s, p.z);
  } else {
    q = vec3((sin(a) - sin(theta)) / k, (cos(theta) - cos(a)) / k, p.z);
  }
  // A leaf in motion lifts slightly off the stack so it never grazes it.
  q.y += uLift + 0.006 * sin(uTurn * PI);
  n = vec3(-sin(a), cos(a), 0.0);
  return q;
}
`;

export interface LeafUniforms {
  uTurn: { value: number };
  uCurl: { value: number };
  uWidth: { value: number };
  uLift: { value: number };
}

export interface LeafMaterials {
  material: MeshStandardMaterial;
  depth: MeshDepthMaterial;
  uniforms: LeafUniforms;
}

export function createLeafMaterials(
  front: Texture,
  back: Texture,
  width: number,
  opts: { normalMap?: Texture; curl?: number } = {},
): LeafMaterials {
  const uniforms: LeafUniforms = {
    uTurn: { value: 0 },
    uCurl: { value: opts.curl ?? 0.7 },
    uWidth: { value: width },
    uLift: { value: 0 },
  };

  const material = new MeshStandardMaterial({
    map: front,
    color: new Color("#ffffff"),
    roughness: 0.92,
    metalness: 0,
    side: DoubleSide,
  });
  if (opts.normalMap) {
    material.normalMap = opts.normalMap;
    material.normalScale.set(0.35, 0.35);
  }

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms, { uBack: { value: back } });
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${BEND_GLSL}`)
      .replace(
        "#include <beginnormal_vertex>",
        `vec3 bentNormal;\nbendPage(position, bentNormal);\nvec3 objectNormal = bentNormal;\n#ifdef USE_TANGENT\nvec3 objectTangent = vec3( tangent.xyz );\n#endif`,
      )
      .replace("#include <begin_vertex>", `vec3 _bn;\nvec3 transformed = bendPage(position, _bn);`)
      // Shadow lookups are offset along the vertex normal; a leaf seen from its
      // back has a downward normal, so bias along the upward-facing side instead.
      .replace(
        "#include <shadowmap_vertex>",
        `transformedNormal = normalMatrix * (bentNormal.y < 0.0 ? -bentNormal : bentNormal);\n#include <shadowmap_vertex>`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nuniform sampler2D uBack;`)
      .replace(
        "#include <map_fragment>",
        `#ifdef USE_MAP
          vec4 sampledDiffuseColor = gl_FrontFacing
            ? texture2D( map, vMapUv )
            : texture2D( uBack, vec2( 1.0 - vMapUv.x, vMapUv.y ) );
          diffuseColor *= sampledDiffuseColor;
        #endif`,
      );
  };
  material.customProgramCacheKey = () => "nimbus-leaf";

  const depth = new MeshDepthMaterial({ depthPacking: RGBADepthPacking });
  depth.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${BEND_GLSL}`)
      .replace("#include <begin_vertex>", `vec3 _bn;\nvec3 transformed = bendPage(position, _bn);`);
  };
  depth.customProgramCacheKey = () => "nimbus-leaf-depth";

  return { material, depth, uniforms };
}
