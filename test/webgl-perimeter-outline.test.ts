import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "..");
const readSource = (path: string) => readFileSync(resolve(root, path), "utf8");

test("WebGL perimeter mode enforces static solid outline without dash math or filter bugs", () => {
  const css = readSource("src/components/auth/login-experience.module.css");
  const tsx = readSource("src/components/auth/login-experience.tsx");

  // 1. Base .borderTrace has overflow: visible
  assert.match(css, /\.borderTrace\s*\{[^}]*overflow:\s*visible;/);

  // 2. Default SVG renderer keeps its drop-shadow filter and animated dashoffset
  assert.match(css, /\.borderTrace\s*\{[^}]*filter:\s*var\(--auth-border-trace-filter\);/);
  assert.match(css, /\.borderTracePath\s*\{[^}]*stroke-dasharray:\s*2000;/);
  assert.match(css, /\.borderTracePath\s*\{[^}]*stroke-dashoffset:\s*2000;/);
  assert.match(css, /\.borderTracePath\s*\{[^}]*transition:\s*stroke-dashoffset/);

  // 3. WebGL mode specifically isolates .borderTrace: z-index: 4, filter: none, overflow: visible
  assert.match(
    css,
    /\.cardFrameWebglPrototype\s+\.borderTrace,\s*\[data-perimeter-led-renderer="webgl"\]\s+\.borderTrace\s*\{[^}]*z-index:\s*4;[^}]*overflow:\s*visible;[^}]*filter:\s*none;/
  );

  // 4. WebGL mode specifically makes outline 100% static solid with no transitions/dash math
  assert.match(
    css,
    /\.cardFrameWebglPrototype\s+\.borderTracePath,\s*\[data-perimeter-led-renderer="webgl"\]\s+\.borderTracePath\s*\{[^}]*stroke-dasharray:\s*none\s*!important;[^}]*stroke-dashoffset:\s*0\s*!important;[^}]*transition:\s*none\s*!important;[^}]*animation:\s*none\s*!important;[^}]*opacity:\s*1\s*!important;/
  );

  // 5. WebGL mode hides unused SVG perimeter traveling lights
  assert.match(
    css,
    /\.cardFrameWebglPrototype\s+\.perimeterLightPath,\s*\[data-perimeter-led-renderer="webgl"\]\s+\.perimeterLightPath\s*\{[^}]*display:\s*none;/
  );

  // 6. TSX omits pathLength for WebGL prototype (leaving it undefined) while default SVG retains 1000
  assert.match(tsx, /pathLength=\{isConcreteSvgExperiment\s*\|\|\s*isWebglPrototype\s*\?\s*undefined\s*:\s*1000\}/);

  // 7. TSX adds strokeLinejoin="round" to border trace path for smooth corner rendering
  assert.match(tsx, /strokeLinejoin="round"/);
});

test("WebGL LED implementation invariants remain intact and unmodified", () => {
  const webgl = readSource("src/components/auth/webgl-perimeter-led.tsx");
  const tsx = readSource("src/components/auth/login-experience.tsx");
  const css = readSource("src/components/auth/login-experience.module.css");

  // Fragment shader arc-length and 4 ribbons (2 warm + 2 teal)
  assert.match(webgl, /const DURATION_MS = 8_000;/);
  assert.match(webgl, /for \(int i = 0; i < 4; i\+\+\)/);
  assert.match(webgl, /vec3\(1\.0, 0\.78, 0\.25\)/); // Warm tone
  assert.match(webgl, /vec3\(0\.22, 0\.92, 0\.82\)/); // Teal tone
  assert.match(webgl, /float halfRibbon = perimeter \* 0\.09;/);
  assert.match(webgl, /float perimeter = horizontal \* 2\.0 \+ vertical \* 2\.0 \+ corner \* 4\.0;/);

  // Core/halo falloffs are uniform-parameterised radiance knobs only —
  // geometry, arc-length, ribbon length, and spacing stay untouched.
  assert.match(webgl, /float line = 1\.0 - smoothstep\(u_bodyEdge0, u_coreEdge1, borderDistance\);/);
  assert.match(webgl, /float halo = \(1\.0 - smoothstep\(1\.5, u_haloEdge1, borderDistance\)\) \* u_haloPeak;/);

  // "soft" (proven golden baseline) and "none" keep the EXACT historical
  // constants, so their rendering is byte-identical to the approved build.
  assert.match(webgl, /coreEdge0: 1\.25,/);
  assert.match(webgl, /coreEdge1: 2\.15,/);
  assert.match(webgl, /haloEdge1: 6\.5,/);
  assert.match(webgl, /haloPeak: 0\.45,/);
  assert.match(webgl, /white: 0\.35,/);

  // "premium" is an incremental radiance-only step (thicker core, wider
  // halo, richer tones) — no geometry/loop/pass changes.
  assert.match(webgl, /coreEdge0: 1\.45,/);
  assert.match(webgl, /haloEdge1: 10\.5,/);
  assert.match(webgl, /sat: 1\.0,/);

  // Neon radiance: one extra smoothstep "hot centre" contribution, gated by
  // u_hot so every pre-existing mode stays bit-identical (hot: 0.0).
  assert.match(webgl, /float boost = \(1\.0 - smoothstep\(u_hotEdge0, u_hotEdge, borderDistance\)\) \* u_hot;/);
  // The pre-V1 single expression survives verbatim as finalRgbOld, and the
  // final colour is selected from it exactly when u_shape = 0 (see below).
  assert.match(webgl, /float finalAlpha = ribbon \* min\(1\.0, line \+ boost \+ halo \* u_glow\);/);
  assert.match(webgl, /hotEdge: 1\.0,\s*\n\s*hotEdge0: 0\.0,\s*\n\s*hot: 0\.0,/); // none/soft/premium keep hot disabled
  assert.match(webgl, /coreEdge0: 1\.3,/); // neon: crisp, slightly thicker than soft
  assert.match(webgl, /haloEdge1: 5\.0,/); // neon: SMALL controlled halo
  assert.match(webgl, /hotEdge: 0\.9,/);   // neon: hot centre line on the path
  assert.match(webgl, /hot: 0\.85,/);

  // "illuminated": visual mass inverted — base THINNER than the soft
  // baseline, hot line dominant, halo SMALLER than neon's. Same shader and
  // instruction count (tuning-only entry).
  assert.match(webgl, /coreEdge0: 1\.0,/);
  assert.match(webgl, /coreEdge1: 2\.0,/);
  assert.match(webgl, /haloEdge1: 4\.0,/);
  assert.match(webgl, /haloPeak: 0\.2,/);
  assert.match(webgl, /hotEdge: 0\.8,/);
  assert.match(webgl, /hot: 1\.0,/);

  // "reference-v2" isolated experiment: continuous longitudinal envelope
  // without plateau. Body/halo rolls off gently over the 18% segment, hot
  // core is concentrated in central 60%, and centerline is incandescent white.
  assert.match(webgl, /float withinBodyV2 = 1\.0 - smoothstep\(halfRibbon \* 0\.25, halfRibbon, dS\);/);
  assert.match(webgl, /float withinCoreV2 = 1\.0 - smoothstep\(0\.0, halfRibbon \* u_coreFrac, dS\);/);
  assert.match(webgl, /float withinBodyRefined = \(delta >= 0\.0 \? bodyHead : bodyTail\) \* step\(delta, headSpan\) \* step\(-delta, tailSpan\);/);
  assert.match(webgl, /float withinBodyRefinedV2 = \(delta >= 0\.0 \? bodyHeadV2 : bodyTail\) \* step\(delta, headSpan\) \* step\(-delta, tailSpan\);/);
  assert.match(webgl, /float withinBodyTube = \(delta >= 0\.0 \? bodyHeadTube : bodyTailTube\) \* step\(delta, headSpanTube\) \* step\(-delta, tailSpanTube\);/);
  assert.match(webgl, /if \(u_shape > 3\.5\) \{\s*within = withinBodyTube;\s*withinCore = withinCoreTube;\s*\} else if \(u_shape > 2\.5\)/);
  assert.match(webgl, /float hotMask = u_shape > 0\.5 \? coreMask : ribbon;/);
  assert.match(webgl, /vec3 finalRgbOld = \(coreTone \* \(line \+ boost\) \+ colour \* \(halo \* u_glow\)\) \* ribbon;/);
  assert.match(webgl, /vec3 bodyTone = mix\(coreTone, colour, u_bodySat\);/);
  assert.match(webgl, /vec3 finalRgbNew = bodyTone \* \(line \* ribbon\) \+ coreTone \* \(boost \* hotMask\) \+ colour \* \(halo \* u_glow\);/);
  assert.match(webgl, /vec3 finalRgb = u_shape > 0\.5 \? finalRgbNew : finalRgbOld;/);
  assert.match(webgl, /"reference-v2": \{/);
  assert.match(webgl, /coreFrac: 0\.6,/);
  assert.match(webgl, /shape: 1\.0,/);

  // "reference-v2-thick" isolated experiment: thicker core and fuller colored
  // body, keeping the exact same continuous longitudinal envelope V2.
  assert.match(webgl, /"reference-v2-thick": \{/);
  assert.match(webgl, /coreEdge0: 1\.35,/);
  assert.match(webgl, /coreEdge1: 3\.0,/);
  assert.match(webgl, /haloEdge1: 5\.2,/);
  assert.match(webgl, /haloPeak: 0\.22,/);
  assert.match(webgl, /hotEdge: 1\.25,/);

  // Every pre-existing mode keeps u_shape = 0, 1, 2, 3, 4, 5, or 6 → explicit branch selection
  // selects exact legacy, V2, refined, refined-v2, neon-tube, perfect, or neon-tube-solid output without extrapolation.
  const tuningShapeZeros = webgl.match(/shape: 0\.0,/g) ?? [];
  assert.equal(tuningShapeZeros.length, 6, "none/soft/premium/neon/illuminated/reference must all keep shape 0.0");
  const tuningShapeOnes = webgl.match(/shape: 1\.0,/g) ?? [];
  assert.equal(tuningShapeOnes.length, 5, "reference-v2/thick/glm/glm-bold/glm-no-outline keep shape 1.0");
  const tuningShapeTwos = webgl.match(/shape: 2\.0,/g) ?? [];
  assert.equal(tuningShapeTwos.length, 1, "only reference-v2-glm-no-outline-refined uses shape 2.0");
  const tuningShapeThrees = webgl.match(/shape: 3\.0,/g) ?? [];
  assert.equal(tuningShapeThrees.length, 1, "only reference-v2-glm-no-outline-refined-v2 uses shape 3.0");
  const tuningShapeFours = webgl.match(/shape: 4\.0,/g) ?? [];
  assert.equal(tuningShapeFours.length, 1, "only reference-v2-glm-no-outline-neon-tube uses shape 4.0");
  const tuningShapeFives = webgl.match(/shape: 5\.0,/g) ?? [];
  assert.equal(tuningShapeFives.length, 1, "only reference-v2-glm-no-outline-perfect uses shape 5.0");
  const tuningShapeSixes = webgl.match(/shape: 6\.0,/g) ?? [];
  assert.equal(tuningShapeSixes.length, 3, "neon-tube-solid, neon-tube-bold-curve, and neon-tube-ultra use shape 6.0");

  // "reference-v2-glm" isolated experiment: SAME V2 longitudinal envelope —
  // only the radial profile gains volume. The single formula change is the
  // u_hotEdge0 substitution inside the boost smoothstep (zero extra ALU);
  // hotEdge0 = 0.0 reproduces the former smoothstep(0.0, ...) exactly.
  assert.match(webgl, /"reference-v2-glm": \{/);
  assert.match(webgl, /coreEdge0: 1\.25,/);
  assert.match(webgl, /coreEdge1: 3\.1,/);
  assert.match(webgl, /haloEdge1: 4\.2,/);
  assert.match(webgl, /haloPeak: 0\.2,/);
  assert.match(webgl, /white: 0\.48,/);
  assert.match(webgl, /hotEdge: 1\.6,/);
  assert.match(webgl, /hotEdge0: 0\.5,/);
  assert.match(webgl, /hot: 1\.0,/);
  assert.match(webgl, /coreFrac: 0\.65,/);
  // glm, refined, neon-tube, and neon-tube-solid use a 0.5 hot-centre plateau; all pre-existing modes
  // keep hotEdge0 = 0 → bit-identical rendering.
  const hotEdge0Zeros = webgl.match(/hotEdge0: 0\.0,/g) ?? [];
  assert.equal(hotEdge0Zeros.length, 8, "the eight pre-glm modes must keep hotEdge0 0.0");
  const hotEdge0Half = webgl.match(/hotEdge0: 0\.5,/g) ?? [];
  assert.equal(hotEdge0Half.length, 4, "reference-v2-glm, refined, neon-tube, and neon-tube-solid use hotEdge0 0.5");
  const hotEdge0PtSix = webgl.match(/hotEdge0: 0\.6,/g) ?? [];
  assert.equal(hotEdge0PtSix.length, 3, "glm-bold, glm-no-outline, and neon-tube-bold-curve use hotEdge0 0.6");
  const hotEdge0PtEight = webgl.match(/hotEdge0: 0\.8,/g) ?? [];
  assert.equal(hotEdge0PtEight.length, 1, "neon-tube-ultra uses hotEdge0 0.8");
  const hotEdge0PtFourFive = webgl.match(/hotEdge0: 0\.45,/g) ?? [];
  assert.equal(hotEdge0PtFourFive.length, 1, "reference-v2-glm-no-outline-refined-v2 uses hotEdge0 0.45");
  const hotEdge0PtThreeFive = webgl.match(/hotEdge0: 0\.35,/g) ?? [];
  assert.equal(hotEdge0PtThreeFive.length, 1, "reference-v2-glm-no-outline-perfect uses hotEdge0 0.35");

  // "reference-v2-glm-bold": BOLD radial redesign — dome body (bodyEdge0 = 0,
  // width 5.6), fully saturated bodyTone, near-white hot capsule (plateau 0.6
  // → 2.0, white 0.75), subtle 6.5px aura. Same V2 longitudinal envelope.
  assert.match(webgl, /"reference-v2-glm-bold": \{/);
  assert.match(webgl, /bodyEdge0: 0\.0,/);
  assert.match(webgl, /coreEdge1: 5\.6,/);
  assert.match(webgl, /white: 0\.75,/);
  assert.match(webgl, /bodySat: 1\.0,/);
  assert.match(webgl, /hotEdge0: 0\.6,/);
  assert.match(webgl, /hotEdge: 2\.0,/);
  assert.match(webgl, /coreFrac: 0\.65,/);

  assert.equal((webgl.match(/bodyEdge0: 0\.0,/g) ?? []).length, 4, "glm-bold, glm-no-outline, refined, and refined-v2 dome the body");
  assert.equal((webgl.match(/bodyEdge0: 2\.4,/g) ?? []).length, 1, "only neon-tube-ultra uses bodyEdge0 2.4 ultra bold solid tube");
  assert.equal((webgl.match(/bodyEdge0: 1\.85,/g) ?? []).length, 1, "only neon-tube-bold-curve uses bodyEdge0 1.85 bold solid tube");
  assert.equal((webgl.match(/bodyEdge0: 1\.6,/g) ?? []).length, 1, "only neon-tube uses bodyEdge0 1.6 solid tube");
  assert.equal((webgl.match(/bodyEdge0: 1\.5,/g) ?? []).length, 1, "only neon-tube-solid uses bodyEdge0 1.5 solid tube");
  assert.equal((webgl.match(/bodyEdge0: 1\.15,/g) ?? []).length, 1, "only perfect uses bodyEdge0 1.15 slim crisp core");
  assert.equal((webgl.match(/bodySat: 1\.0,/g) ?? []).length, 8, "glm-bold, glm-no-outline, refined, refined-v2, neon-tube, neon-tube-solid, neon-tube-bold-curve, and neon-tube-ultra saturate the body");
  assert.equal((webgl.match(/bodyEdge0: 1\.25,/g) ?? []).length, 3, "none/soft/glm keep bodyEdge0 1.25");
  assert.equal((webgl.match(/bodyEdge0: 1\.0,/g) ?? []).length, 3, "illuminated/reference/reference-v2 keep bodyEdge0 1.0");

  // "reference-v2-glm-no-outline": identical radiance to glm-bold; the ONLY
  // difference is the decorative SVG outline hidden via a single visibility
  // rule scoped to this mode's data attribute. Old modes keep the outline.
  assert.match(webgl, /"reference-v2-glm-no-outline": \{/);
  assert.match(webgl, /"reference-v2-glm-no-outline-refined": \{/);
  assert.match(webgl, /"reference-v2-glm-no-outline-refined-v2": \{/);
  assert.match(webgl, /"reference-v2-glm-no-outline-neon-tube": \{/);
  assert.match(webgl, /"reference-v2-glm-no-outline-perfect": \{/);
  assert.match(webgl, /"reference-v2-glm-no-outline-neon-tube-solid": \{/);
  assert.match(webgl, /"reference-v2-glm-no-outline-neon-tube-bold-curve": \{/);
  assert.match(webgl, /"reference-v2-glm-no-outline-neon-tube-ultra": \{/);
  assert.match(css, /\[data-perimeter-led-glow="reference-v2-glm-no-outline"\] \.borderTrace,\s*\[data-perimeter-led-glow="reference-v2-glm-no-outline-refined"\] \.borderTrace,\s*\[data-perimeter-led-glow="reference-v2-glm-no-outline-refined-v2"\] \.borderTrace,\s*\[data-perimeter-led-glow="reference-v2-glm-no-outline-neon-tube"\] \.borderTrace,\s*\[data-perimeter-led-glow="reference-v2-glm-no-outline-perfect"\] \.borderTrace,\s*\[data-perimeter-led-glow="reference-v2-glm-no-outline-neon-tube-solid"\] \.borderTrace,\s*\[data-perimeter-led-glow="reference-v2-glm-no-outline-neon-tube-bold-curve"\] \.borderTrace,\s*\[data-perimeter-led-glow="reference-v2-glm-no-outline-neon-tube-ultra"\] \.borderTrace \{\s*visibility: hidden;\s*\}/);
  assert.equal((css.match(/visibility: hidden;/g) ?? []).length, 1, "exactly ONE outline-hiding rule may exist");
  assert.match(tsx, /data-perimeter-led-glow=\{perimeterLedGlow\}/);

  // Glow modes are selected via query param plumbing into the u_glow uniforms.
  assert.match(webgl, /uniform float u_glow;/);
  assert.match(tsx, /perimeterLedGlow/);
  assert.match(tsx, /requestedGlow === "soft" \|\| requestedGlow === "premium" \|\| requestedGlow === "neon" \|\| requestedGlow === "illuminated" \|\| requestedGlow === "reference" \|\| requestedGlow === "reference-v2" \|\| requestedGlow === "reference-v2-thick" \|\| requestedGlow === "reference-v2-glm" \|\| requestedGlow === "reference-v2-glm-bold" \|\| requestedGlow === "reference-v2-glm-no-outline" \|\| requestedGlow === "reference-v2-glm-no-outline-refined" \|\| requestedGlow === "reference-v2-glm-no-outline-refined-v2" \|\| requestedGlow === "reference-v2-glm-no-outline-neon-tube" \|\| requestedGlow === "reference-v2-glm-no-outline-perfect" \|\| requestedGlow === "reference-v2-glm-no-outline-neon-tube-solid" \|\| requestedGlow === "reference-v2-glm-no-outline-neon-tube-bold-curve" \|\| requestedGlow === "reference-v2-glm-no-outline-neon-tube-ultra"/);
});
