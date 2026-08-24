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

  // Fragment shader arc-length and 4 ribbons (2 warm + 2 teal)
  assert.match(webgl, /const DURATION_MS = 8_000;/);
  assert.match(webgl, /for \(int i = 0; i < 4; i\+\+\)/);
  assert.match(webgl, /vec3\(1\.0, 0\.78, 0\.25\)/); // Warm tone
  assert.match(webgl, /vec3\(0\.22, 0\.92, 0\.82\)/); // Teal tone
  assert.match(webgl, /float halfRibbon = perimeter \* 0\.09;/);
  assert.match(webgl, /float perimeter = horizontal \* 2\.0 \+ vertical \* 2\.0 \+ corner \* 4\.0;/);
  assert.match(webgl, /float line = 1\.0 - smoothstep\(1\.25, 2\.15, borderDistance\);/);
});
