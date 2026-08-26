"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./login-experience.module.css";

type WebglPerimeterLedProps = {
  path: string;
  width: number;
  height: number;
  /** Corner radius of the same rounded rectangle the SVG border uses. */
  radius: number;
  /** Visual glow mode: "none" (baseline), "soft" (proven golden baseline),
   * "premium" (wide luminous halo), "neon" (crisp hot core), "illuminated"
   * (experimental — the border itself appears to light up: a very thin base
   * hugging the centreline, a dominant near-white hot line peeking around
   * the solid SVG outline, and a halo SMALLER than neon), "reference"
   * (V1 baseline), "reference-v2" (V2 — continuous longitudinal envelope
   * without plateau, incandescent centerline, thin colored glow, subtle halo),
   * or "reference-v2-thick" (V2 thick — same longitudinal envelope as V2,
   * with a thicker hot core and fuller colored body), or "reference-v2-glm"
   * (V2 GLM — V2 envelope with a volumetric radial profile: plateau hot
   * capsule, saturated colored body, subtle halo). */
  glow?: "none" | "soft" | "premium" | "neon" | "illuminated" | "reference" | "reference-v2" | "reference-v2-thick" | "reference-v2-glm" | "reference-v2-glm-bold" | "reference-v2-glm-no-outline" | "reference-v2-glm-no-outline-refined" | "reference-v2-glm-no-outline-refined-v2" | "reference-v2-glm-no-outline-neon-tube" | "reference-v2-glm-no-outline-perfect" | "reference-v2-glm-no-outline-neon-tube-solid" | "reference-v2-glm-no-outline-neon-tube-bold-curve" | "reference-v2-glm-no-outline-neon-tube-ultra";
};

/**
 * Glow tuning per mode. Every entry feeds uniforms that replace the shader's
 * former hard-coded constants, so "none"/"soft" keep the EXACT historical
 * numbers (byte-identical rendering). "premium" is a wide-halo step.
 * "neon" targets the reference aesthetic: a crisp, slightly-thick solid
 * core with a near-white hot centre line riding the outline, a SMALL halo
 * (core definition over halo size), and saturated-but-controlled tones —
 * the LED reads as lighting the outline up, not floating above it.
 * Only radiance constants differ — geometry, arc-length, ribbon
 * length/spacing, and the single-pass one-draw-call architecture are
 * untouched. `hot` terms are zeroed for every pre-existing mode.
 */
const GLOW_TUNING = {
  none: {
    uGlow: 0.0,
    coreEdge0: 1.25,
    bodyEdge0: 1.25,
    coreEdge1: 2.15,
    haloEdge1: 6.5,
    haloPeak: 0.45,
    white: 0.35,
    bodySat: 0.0,
    sat: 0.0,
    hotEdge: 1.0,
    hotEdge0: 0.0,
    hot: 0.0,
    shape: 0.0,
    coreFrac: 0.7,
    coreCap: 12.0,
  },
  soft: {
    uGlow: 1.0,
    coreEdge0: 1.25,
    bodyEdge0: 1.25,
    coreEdge1: 2.15,
    haloEdge1: 6.5,
    haloPeak: 0.45,
    white: 0.35,
    bodySat: 0.0,
    sat: 0.0,
    hotEdge: 1.0,
    hotEdge0: 0.0,
    hot: 0.0,
    shape: 0.0,
    coreFrac: 0.7,
    coreCap: 12.0,
  },
  premium: {
    uGlow: 1.0,
    coreEdge0: 1.45,
    bodyEdge0: 1.45,
    coreEdge1: 2.7,
    haloEdge1: 10.5,
    haloPeak: 0.52,
    white: 0.5,
    bodySat: 0.0,
    sat: 1.0,
    hotEdge: 1.0,
    hotEdge0: 0.0,
    hot: 0.0,
    shape: 0.0,
    coreFrac: 0.7,
    coreCap: 12.0,
  },
  neon: {
    uGlow: 1.0,
    coreEdge0: 1.3,
    bodyEdge0: 1.3,
    coreEdge1: 2.45,
    haloEdge1: 5.0,
    haloPeak: 0.3,
    white: 0.55,
    bodySat: 0.0,
    sat: 1.0,
    hotEdge: 0.9,
    hotEdge0: 0.0,
    hot: 0.85,
    shape: 0.0,
    coreFrac: 0.7,
    coreCap: 12.0,
  },
  /* "Illuminated" inverts the visual mass distribution: premium/neon still
     carry a wide SATURATED band that reads as a tube floating above the
     border. Here the base is THINNER than even the "soft" baseline and hugs
     the centreline, the near-white hot line is the dominant element (it
     peeks immediately around the solid SVG outline, so the outline itself
     reads as incandescent while staying fully opaque on top), and the halo
     is smaller than neon's. Same shader, same instruction count — tuning
     values only, so fragment cost is bit-for-bit identical. */
  illuminated: {
    uGlow: 1.0,
    coreEdge0: 1.0,
    bodyEdge0: 1.0,
    coreEdge1: 2.0,
    haloEdge1: 4.0,
    haloPeak: 0.2,
    white: 0.65,
    bodySat: 0.0,
    sat: 1.0,
    hotEdge: 0.8,
    hotEdge0: 0.0,
    hot: 1.0,
    shape: 0.0,
    coreFrac: 0.7,
    coreCap: 12.0,
  },
  /* "reference" V1 baseline: radiance tuning with baseline shape = 0.0. */
  reference: {
    uGlow: 1.0,
    coreEdge0: 1.0,
    bodyEdge0: 1.0,
    coreEdge1: 2.0,
    haloEdge1: 4.0,
    haloPeak: 0.2,
    white: 0.65,
    bodySat: 0.0,
    sat: 1.0,
    hotEdge: 0.8,
    hotEdge0: 0.0,
    hot: 1.0,
    shape: 0.0,
    coreFrac: 0.7,
    coreCap: 12.0,
  },
  /* "reference-v2" isolated experiment: continuous longitudinal envelope
     without plateau. The body/halo rolls off gently toward both ends of the
     18% ribbon, while the hot core is concentrated in the central 60% with
     incandescent white dominance along the outline centerline. */
  "reference-v2": {
    uGlow: 1.0,
    coreEdge0: 1.0,
    bodyEdge0: 1.0,
    coreEdge1: 2.0,
    haloEdge1: 3.8,
    haloPeak: 0.18,
    white: 0.7,
    bodySat: 0.0,
    sat: 1.0,
    hotEdge: 0.75,
    hotEdge0: 0.0,
    hot: 1.0,
    shape: 1.0,
    coreFrac: 0.6,
    coreCap: 0.0,
  },
  /* "reference-v2-thick" isolated experiment: thicker core and fuller colored
     body, keeping the exact same continuous longitudinal envelope V2. */
  "reference-v2-thick": {
    uGlow: 1.0,
    coreEdge0: 1.35,
    bodyEdge0: 1.35,
    coreEdge1: 3.0,
    haloEdge1: 5.2,
    haloPeak: 0.22,
    white: 0.72,
    bodySat: 0.0,
    sat: 1.0,
    hotEdge: 1.25,
    hotEdge0: 0.0,
    hot: 1.0,
    shape: 1.0,
    coreFrac: 0.6,
    coreCap: 0.0,
  },
  /* "reference-v2-glm" isolated experiment: SAME V2 longitudinal envelope,
     geometry, and motion — only the RADIAL profile gains volume:
     - hot centre gets a real radial plateau (u_hotEdge0 = 0.5), so the
       incandescent capsule has extent instead of a hairline peak;
     - the colored body is wider (1.25 → 3.1) and far less whitened
       (white 0.48), so amber/teal reads as luminous volume, not a pale line;
     - halo stays subtle (4.2px × 0.20) — never the source of thickness.
     The only formula change is the u_hotEdge0 substitution inside the boost
     smoothstep (zero extra ALU); every pre-existing mode keeps
     hotEdge0 = 0.0 → bit-identical rendering. */
  "reference-v2-glm": {
    uGlow: 1.0,
    coreEdge0: 1.25,
    bodyEdge0: 1.25,
    coreEdge1: 3.1,
    haloEdge1: 4.2,
    haloPeak: 0.2,
    white: 0.48,
    bodySat: 0.0,
    sat: 1.0,
    hotEdge: 1.6,
    hotEdge0: 0.5,
    hot: 1.0,
    shape: 1.0,
    coreFrac: 0.65,
    coreCap: 0.0,
  },
  /* "reference-v2-glm-bold" isolated experiment: BOLD radial redesign on the
     SAME V2 longitudinal envelope. The visual analysis showed glm still reads
     as a thin flat line (~7-11px, whitish, no zones), while the reference is
     a dome (~22-29px, color-dominant, three zones). Two gated changes:
     - u_bodyEdge0 = 0 turns the body band into a DOME that starts falling
       right at the centreline (real volume), widened to 5.6px;
     - u_bodySat = 1 makes the body FULLY saturated (bodyTone), while the hot
       capsule stays near-white via coreTone (white 0.75) — three clear zones:
       incandescent centre, thick colored luminous body, subtle aura.
     Cost: +1 mix, +0 smoothstep. Every pre-existing mode keeps
     bodyEdge0 == coreEdge0 and bodySat = 0 → bit-identical rendering. */
  "reference-v2-glm-bold": {
    uGlow: 1.0,
    coreEdge0: 1.25,
    bodyEdge0: 0.0,
    coreEdge1: 5.6,
    haloEdge1: 6.5,
    haloPeak: 0.24,
    white: 0.75,
    bodySat: 1.0,
    sat: 1.0,
    hotEdge: 2.0,
    hotEdge0: 0.6,
    hot: 1.0,
    shape: 1.0,
    coreFrac: 0.65,
    coreCap: 0.0,
  },
  /* "reference-v2-glm-no-outline": IDENTICAL radiance to glm-bold — the only
     difference is presentation-level: the decorative SVG outline layer is
     hidden for this mode (see the visibility rule scoped to
     [data-perimeter-led-glow="reference-v2-glm-no-outline"] in
     login-experience.module.css), so the perimeter reads as one light source
     instead of glow + a separate line. The SVG element stays in the DOM;
     every other mode keeps the outline exactly as before. */
  "reference-v2-glm-no-outline": {
    uGlow: 1.0,
    coreEdge0: 1.25,
    bodyEdge0: 0.0,
    coreEdge1: 5.6,
    haloEdge1: 6.5,
    haloPeak: 0.24,
    white: 0.75,
    bodySat: 1.0,
    sat: 1.0,
    hotEdge: 2.0,
    hotEdge0: 0.6,
    hot: 1.0,
    shape: 1.0,
    coreFrac: 0.65,
    coreCap: 0.0,
  },
  /* "reference-v2-glm-no-outline-refined": refined isolated experiment with
     asymmetric signed-distance longitudinal envelope (soft-cap leading edge,
     tapered trailing tail, ~22% perimeter coverage), rich amber/teal saturation,
     dome radial body (5.6px radius), controlled white core mix (0.58),
     and hidden decorative SVG outline. */
  "reference-v2-glm-no-outline-refined": {
    uGlow: 1.0,
    coreEdge0: 1.25,
    bodyEdge0: 0.0,
    coreEdge1: 5.6,
    haloEdge1: 6.0,
    haloPeak: 0.2,
    white: 0.58,
    bodySat: 1.0,
    sat: 1.0,
    hotEdge: 1.8,
    hotEdge0: 0.5,
    hot: 0.85,
    shape: 2.0,
    coreFrac: 0.65,
    coreCap: 0.0,
  },
  /* "reference-v2-glm-no-outline-refined-v2": refined V2 experiment with
     naturally rounded leading head envelope (shape 3.0), restrained outer halo
     (peak 0.16, edge 5.4) to narrow outer glare and reduce corner contrast,
     balanced peak hot core (hot 0.75, white 0.52), solid dome body (5.6px radius),
     and hidden decorative SVG outline. */
  "reference-v2-glm-no-outline-refined-v2": {
    uGlow: 1.0,
    coreEdge0: 1.25,
    bodyEdge0: 0.0,
    coreEdge1: 5.6,
    haloEdge1: 5.4,
    haloPeak: 0.16,
    white: 0.52,
    bodySat: 1.0,
    sat: 1.0,
    hotEdge: 1.7,
    hotEdge0: 0.45,
    hot: 0.75,
    shape: 3.0,
    coreFrac: 0.65,
    coreCap: 0.0,
  },
  /* "reference-v2-glm-no-outline-neon-tube": physical neon tube experiment matching
     the crisp reference geometry: uniform solid cylindrical tube body (bodyEdge0 = 1.6,
     coreEdge1 = 2.8), tight subtle surrounding glow (haloEdge1 = 5.0, haloPeak = 0.20),
     extended longitudinal coverage (~23.5% perimeter), uniform body thickness with
     rounded front cap & tapered tail (shape 4.0), and hidden decorative SVG outline. */
  "reference-v2-glm-no-outline-neon-tube": {
    uGlow: 1.0,
    coreEdge0: 1.6,
    bodyEdge0: 1.6,
    coreEdge1: 2.8,
    haloEdge1: 5.0,
    haloPeak: 0.2,
    white: 0.48,
    bodySat: 1.0,
    sat: 1.0,
    hotEdge: 1.4,
    hotEdge0: 0.5,
    hot: 0.75,
    shape: 4.0,
    coreFrac: 0.65,
    coreCap: 0.0,
  },
  /* "reference-v2-glm-no-outline-perfect": combines the slim, crisp luminous
     stroke thickness from the golden mobile baseline (~2.35px crisp core, tight
     4.5px halo, vivid incandescent saturation) with the refined asymmetric
     envelope (rounded soft-cap leading edge, smooth tapered fade-out tail,
     ~22.5% perimeter coverage), and hidden decorative SVG outline. */
  "reference-v2-glm-no-outline-perfect": {
    uGlow: 1.0,
    coreEdge0: 1.15,
    bodyEdge0: 1.15,
    coreEdge1: 2.35,
    haloEdge1: 4.5,
    haloPeak: 0.22,
    white: 0.6,
    bodySat: 0.5,
    sat: 1.0,
    hotEdge: 0.95,
    hotEdge0: 0.35,
    hot: 0.9,
    shape: 5.0,
    coreFrac: 0.65,
    coreCap: 0.0,
  },
  /* "reference-v2-glm-no-outline-neon-tube-solid": physical solid neon tube with
     laser-crisp corner tracking (bodyEdge0 = 1.5, coreEdge1 = 2.4, haloEdge1 = 3.8,
     haloPeak = 0.14), 100% full-thickness solid blunt rounded head cap without
     front fade/taper, tapered tail fade-out (shape 6.0), and hidden decorative SVG outline. */
  "reference-v2-glm-no-outline-neon-tube-solid": {
    uGlow: 1.0,
    coreEdge0: 1.5,
    bodyEdge0: 1.5,
    coreEdge1: 2.4,
    haloEdge1: 3.8,
    haloPeak: 0.14,
    white: 0.45,
    bodySat: 1.0,
    sat: 1.0,
    hotEdge: 1.2,
    hotEdge0: 0.5,
    hot: 0.8,
    shape: 6.0,
    coreFrac: 0.65,
    coreCap: 0.0,
  },
  /* "reference-v2-glm-no-outline-neon-tube-bold-curve": bold physical solid neon tube with
     substantial body thickness (bodyEdge0 = 1.85, coreEdge1 = 3.2, haloEdge1 = 4.5, haloPeak = 0.16),
     100% full-thickness solid blunt rounded head cap without front fade/taper, tapered tail fade-out
     (shape 6.0), calibrated for sweeping rounded corner curves (30px radius), and hidden decorative SVG outline. */
  "reference-v2-glm-no-outline-neon-tube-bold-curve": {
    uGlow: 1.0,
    coreEdge0: 1.85,
    bodyEdge0: 1.85,
    coreEdge1: 3.2,
    haloEdge1: 4.5,
    haloPeak: 0.16,
    white: 0.48,
    bodySat: 1.0,
    sat: 1.0,
    hotEdge: 1.6,
    hotEdge0: 0.6,
    hot: 0.82,
    shape: 6.0,
    coreFrac: 0.65,
    coreCap: 0.0,
  },
  /* "reference-v2-glm-no-outline-neon-tube-ultra": ultra-bold physical solid neon tube with
     prominent 5.0px solid body diameter (bodyEdge0 = 2.4, coreEdge1 = 4.2, haloEdge1 = 5.5, haloPeak = 0.16),
     centered incandescent core (hotEdge0 = 0.8, hotEdge = 2.0, hot = 0.85), same exact standard length,
     100% full-thickness solid blunt rounded head cap without front fade/taper, tapered tail fade-out
     (shape 6.0), calibrated for sweeping rounded corner curves (30px radius), and hidden decorative SVG outline. */
  "reference-v2-glm-no-outline-neon-tube-ultra": {
    uGlow: 1.0,
    coreEdge0: 2.4,
    bodyEdge0: 2.4,
    coreEdge1: 4.2,
    haloEdge1: 5.5,
    haloPeak: 0.16,
    white: 0.48,
    bodySat: 1.0,
    sat: 1.0,
    hotEdge: 2.0,
    hotEdge0: 0.8,
    hot: 0.85,
    shape: 6.0,
    coreFrac: 0.65,
    coreCap: 0.0,
  },
} as const;

const DURATION_MS = 8_000;
const MAX_DPR = 2;
/** Never advance the orbit by more than this per frame, so a stalled tab or a
 * long main-thread hitch resumes in place instead of jumping phase. */
const MAX_FRAME_DELTA_MS = 100;

const vertexSource = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

/* Phase 1: correctness before bloom. Every fragment first resolves its closest
   rounded-rectangle perimeter coordinate, expressed in actual arc length.
   Four equally spaced windows then select the warm/teal ribbon colour.

   The rounded rectangle mirrors the SVG border exactly: same width/height in
   CSS pixels, same corner radius, stroke centred on the path (no inset), so
   the GPU ribbons ride the same border the SVG trace draws. */
const fragmentSource = `
precision highp float;

uniform vec2 u_size;
uniform float u_dpr;
uniform float u_time;
uniform float u_radius;
uniform float u_glow;
uniform float u_coreEdge0;
uniform float u_coreEdge1;
uniform float u_haloEdge1;
uniform float u_haloPeak;
uniform float u_white;
uniform float u_sat;
uniform float u_hotEdge0;
uniform float u_hotEdge;
uniform float u_hot;
uniform float u_bodyEdge0;
uniform float u_bodySat;
uniform float u_shape;
uniform float u_coreFrac;
uniform float u_coreCap;

const float PI = 3.141592653589793;

float cyclicDistance(float a, float b, float perimeter) {
  return abs(mod(a - b + perimeter * 0.5, perimeter) - perimeter * 0.5);
}

void main() {
  vec2 q = vec2(gl_FragCoord.x / u_dpr, u_size.y - gl_FragCoord.y / u_dpr);
  float w = max(1.0, u_size.x);
  float h = max(1.0, u_size.y);
  float r = clamp(u_radius, 1.0, min(w, h) * 0.5);
  float topHalf = w * 0.5 - r;
  float vertical = h - 2.0 * r;
  float horizontal = w - 2.0 * r;
  float corner = PI * r * 0.5;
  /* Top edge (both halves) + bottom edge = 2 * horizontal; left + right =
     2 * vertical; four quarter-circle corners = 2 * PI * r. Do NOT add
     topHalf * 2 on top of horizontal * 2 — that double-counts the top edge
     and breaks spacing, speed, and loop seamlessness. */
  float perimeter = horizontal * 2.0 + vertical * 2.0 + corner * 4.0;
  vec2 closest;
  float s;

  if (q.y <= r && q.x >= r && q.x <= w - r) {
    closest = vec2(q.x, 0.0);
    s = q.x - w * 0.5;
    if (s < 0.0) s += perimeter;
  } else if (q.x >= w - r && q.y <= r) {
    vec2 c = vec2(w - r, r);
    float theta = clamp(atan(q.y - c.y, q.x - c.x), -PI * 0.5, 0.0);
    closest = c + r * vec2(cos(theta), sin(theta));
    s = topHalf + (theta + PI * 0.5) * r;
  } else if (q.x >= w - r && q.y < h - r) {
    closest = vec2(w, clamp(q.y, r, h - r));
    s = topHalf + corner + closest.y - r;
  } else if (q.x >= w - r && q.y >= h - r) {
    vec2 c = vec2(w - r, h - r);
    float theta = clamp(atan(q.y - c.y, q.x - c.x), 0.0, PI * 0.5);
    closest = c + r * vec2(cos(theta), sin(theta));
    s = topHalf + corner + vertical + theta * r;
  } else if (q.y >= h - r && q.x > r) {
    closest = vec2(clamp(q.x, r, w - r), h);
    s = topHalf + corner + vertical + corner + w - r - closest.x;
  } else if (q.x <= r && q.y >= h - r) {
    vec2 c = vec2(r, h - r);
    float theta = clamp(atan(q.y - c.y, q.x - c.x), PI * 0.5, PI);
    closest = c + r * vec2(cos(theta), sin(theta));
    s = topHalf + corner + vertical + corner + horizontal + (theta - PI * 0.5) * r;
  } else if (q.x <= r && q.y > r) {
    closest = vec2(0.0, clamp(q.y, r, h - r));
    s = topHalf + corner + vertical + corner + horizontal + corner + h - r - closest.y;
  } else {
    vec2 c = vec2(r, r);
    float theta = clamp(atan(q.y - c.y, q.x - c.x), -PI, -PI * 0.5);
    closest = c + r * vec2(cos(theta), sin(theta));
    s = topHalf + corner + vertical + corner + horizontal + corner + vertical + (theta + PI) * r;
  }

  float borderDistance = length(q - closest);
  float line = 1.0 - smoothstep(u_bodyEdge0, u_coreEdge1, borderDistance);
  float halo = (1.0 - smoothstep(1.5, u_haloEdge1, borderDistance)) * u_haloPeak;
  float phase = mod(u_time * perimeter / ${DURATION_MS.toFixed(1)}, perimeter);
  vec3 colour = vec3(0.0);
  float ribbon = 0.0;
  float coreMask = 0.0;

  for (int i = 0; i < 4; i++) {
    float centre = mod(phase + float(i) * perimeter * 0.25, perimeter);
    float halfRibbon = perimeter * 0.09;
    float dS = cyclicDistance(s, centre, perimeter);
    float withinOld = 1.0 - smoothstep(halfRibbon, halfRibbon + 2.0, dS);
    /* Reference V2: continuous longitudinal envelopes along the same arc-length space.
       Body/halo envelope smoothly tapers over the 18% segment (crest in central 25%,
       smooth roll-off to 0 at halfRibbon). Hot core envelope is concentrated in the
       central 60% of halfRibbon. */
    float withinBodyV2 = 1.0 - smoothstep(halfRibbon * 0.25, halfRibbon, dS);
    float withinCoreV2 = 1.0 - smoothstep(0.0, halfRibbon * u_coreFrac, dS);

    /* Refined asymmetric signed-distance envelope:
       s moves clockwise, centre moves with phase (clockwise), so delta > 0 is leading edge (front)
       and delta < 0 is trailing edge (tail).
       - Shape 2 (refined): soft flat cap on leading head.
       - Shape 3 (refined-v2): naturally rounded pill dome on leading head.
       Both retain long tapered fade-out on trailing tail. */
    float delta = mod(s - centre + perimeter * 0.5, perimeter) - perimeter * 0.5;
    float headSpan = perimeter * 0.075;
    float tailSpan = perimeter * 0.145;
    float bodyHead = 1.0 - smoothstep(headSpan * 0.65, headSpan, max(0.0, delta));
    float bodyHeadV2 = 1.0 - smoothstep(headSpan * 0.25, headSpan, max(0.0, delta));
    float bodyTail = 1.0 - smoothstep(tailSpan * 0.20, tailSpan, max(0.0, -delta));
    float withinBodyRefined = (delta >= 0.0 ? bodyHead : bodyTail) * step(delta, headSpan) * step(-delta, tailSpan);
    float withinBodyRefinedV2 = (delta >= 0.0 ? bodyHeadV2 : bodyTail) * step(delta, headSpan) * step(-delta, tailSpan);

    float coreHead = 1.0 - smoothstep(headSpan * 0.45, headSpan * 0.85, max(0.0, delta));
    float coreHeadV2 = 1.0 - smoothstep(headSpan * 0.15, headSpan * 0.75, max(0.0, delta));
    float coreTail = 1.0 - smoothstep(0.0, tailSpan * 0.65, max(0.0, -delta));
    float withinCoreRefined = (delta >= 0.0 ? coreHead : coreTail) * step(delta, headSpan * 0.85) * step(-delta, tailSpan * 0.65);
    float withinCoreRefinedV2 = (delta >= 0.0 ? coreHeadV2 : coreTail) * step(delta, headSpan * 0.75) * step(-delta, tailSpan * 0.65);

    float headSpanTube = perimeter * 0.085;
    float tailSpanTube = perimeter * 0.150;
    float bodyHeadTube = 1.0 - smoothstep(headSpanTube * 0.75, headSpanTube, max(0.0, delta));
    float bodyTailTube = 1.0 - smoothstep(tailSpanTube * 0.35, tailSpanTube, max(0.0, -delta));
    float withinBodyTube = (delta >= 0.0 ? bodyHeadTube : bodyTailTube) * step(delta, headSpanTube) * step(-delta, tailSpanTube);

    float coreHeadTube = 1.0 - smoothstep(headSpanTube * 0.50, headSpanTube * 0.85, max(0.0, delta));
    float coreTailTube = 1.0 - smoothstep(0.0, tailSpanTube * 0.70, max(0.0, -delta));
    float withinCoreTube = (delta >= 0.0 ? coreHeadTube : coreTailTube) * step(delta, headSpanTube * 0.85) * step(-delta, tailSpanTube * 0.70);

    float headSpanPerfect = perimeter * 0.080;
    float tailSpanPerfect = perimeter * 0.145;
    float bodyHeadPerfect = 1.0 - smoothstep(headSpanPerfect * 0.35, headSpanPerfect, max(0.0, delta));
    float bodyTailPerfect = 1.0 - smoothstep(tailSpanPerfect * 0.20, tailSpanPerfect, max(0.0, -delta));
    float withinBodyPerfect = (delta >= 0.0 ? bodyHeadPerfect : bodyTailPerfect) * step(delta, headSpanPerfect) * step(-delta, tailSpanPerfect);

    float coreHeadPerfect = 1.0 - smoothstep(headSpanPerfect * 0.20, headSpanPerfect * 0.80, max(0.0, delta));
    float coreTailPerfect = 1.0 - smoothstep(0.0, tailSpanPerfect * 0.65, max(0.0, -delta));
    float withinCorePerfect = (delta >= 0.0 ? coreHeadPerfect : coreTailPerfect) * step(delta, headSpanPerfect * 0.80) * step(-delta, tailSpanPerfect * 0.65);

    float headSpanSolid = perimeter * 0.085;
    float tailSpanSolid = perimeter * 0.150;
    /* Solid front head cap: 100% full thickness right up to the front, with 1.5px subpixel anti-aliasing */
    float bodyHeadSolid = 1.0 - smoothstep(headSpanSolid - 1.5, headSpanSolid + 0.5, delta);
    float bodyTailSolid = 1.0 - smoothstep(tailSpanSolid * 0.30, tailSpanSolid, max(0.0, -delta));
    float withinBodySolid = (delta >= 0.0 ? bodyHeadSolid : bodyTailSolid) * step(delta, headSpanSolid + 0.5) * step(-delta, tailSpanSolid);

    float coreHeadSolid = 1.0 - smoothstep(headSpanSolid - 1.5, headSpanSolid + 0.5, delta);
    float coreTailSolid = 1.0 - smoothstep(0.0, tailSpanSolid * 0.70, max(0.0, -delta));
    float withinCoreSolid = (delta >= 0.0 ? coreHeadSolid : coreTailSolid) * step(delta, headSpanSolid + 0.5) * step(-delta, tailSpanSolid * 0.70);

    /* Explicit envelope mode selection:
       shape 0 = legacy (shape <= 0.5)
       shape 1 = reference-v2 (0.5 < shape <= 1.5)
       shape 2 = refined (1.5 < shape <= 2.5)
       shape 3 = refined-v2 (2.5 < shape <= 3.5)
       shape 4 = neon-tube (3.5 < shape <= 4.5)
       shape 5 = perfect (4.5 < shape <= 5.5)
       shape 6 = neon-tube-solid (shape > 5.5) */
    float within;
    float withinCore;
    if (u_shape > 5.5) {
      within = withinBodySolid;
      withinCore = withinCoreSolid;
    } else if (u_shape > 4.5) {
      within = withinBodyPerfect;
      withinCore = withinCorePerfect;
    } else if (u_shape > 3.5) {
      within = withinBodyTube;
      withinCore = withinCoreTube;
    } else if (u_shape > 2.5) {
      within = withinBodyRefinedV2;
      withinCore = withinCoreRefinedV2;
    } else if (u_shape > 1.5) {
      within = withinBodyRefined;
      withinCore = withinCoreRefined;
    } else if (u_shape > 0.5) {
      within = withinBodyV2;
      withinCore = withinCoreV2;
    } else {
      within = withinOld;
      withinCore = withinOld;
    }

    vec3 tone = mod(float(i), 2.0) < 0.5
      ? mix(vec3(1.0, 0.78, 0.25), vec3(1.0, 0.66, 0.12), u_sat)
      : mix(vec3(0.22, 0.92, 0.82), vec3(0.08, 0.98, 0.88), u_sat);
    colour += tone * within;
    ribbon = max(ribbon, within);
    coreMask = max(coreMask, withinCore);
  }

  /* Neon radiance: "boost" is a near-white hot centre line hugging the very
     middle of the border path. It rides UNDER the solid SVG outline (z-order
     fix), so the outline stays fully opaque while its surroundings ignite —
     the LED reads as lighting the outline up instead of covering it.
     Zero for every pre-existing mode (u_hot = 0, bit-identical output). */
  vec3 coreTone = mix(colour, vec3(1.0), u_white * u_glow);
  /* u_hotEdge0 gives the hot centre a radial plateau (a real incandescent
     capsule instead of a hairline peak). 0.0 on every pre-existing mode
     reproduces the former smoothstep(0.0, ...) exactly — bit-identical. */
  float boost = (1.0 - smoothstep(u_hotEdge0, u_hotEdge, borderDistance)) * u_hot;
  /* Reference V2 / Refined: hot centre uses coreMask, body/halo uses ribbon envelope.
     Explicit selection between old and new radiance paths avoids mix extrapolation. */
  float hotMask = u_shape > 0.5 ? coreMask : ribbon;
  vec3 finalRgbOld = (coreTone * (line + boost) + colour * (halo * u_glow)) * ribbon;
  vec3 bodyTone = mix(coreTone, colour, u_bodySat);
  vec3 finalRgbNew = bodyTone * (line * ribbon) + coreTone * (boost * hotMask) + colour * (halo * u_glow);
  vec3 finalRgb = u_shape > 0.5 ? finalRgbNew : finalRgbOld;
  float finalAlpha = ribbon * min(1.0, line + boost + halo * u_glow);
  gl_FragColor = vec4(finalRgb, finalAlpha);
}`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to allocate WebGL shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "Unknown shader error.";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

/** Static fallback (WebGL unavailable / context lost / reduced motion):
   four fixed ribbons at 0/25/50/75% of the perimeter — no animation. */
function StaticPerimeterFallback({ path, width, height }: WebglPerimeterLedProps) {
  const ribbons = [
    { colour: "var(--auth-plm-warm-bloom)", offset: 0 },
    { colour: "var(--auth-plm-teal-bloom)", offset: -250 },
    { colour: "var(--auth-plm-warm-bloom)", offset: -500 },
    { colour: "var(--auth-plm-teal-bloom)", offset: -750 },
  ];
  return (
    <svg className={styles.perimeterWebglFallback} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      {ribbons.map(({ colour, offset }) => (
        <path
          key={offset}
          d={path}
          pathLength={1000}
          fill="none"
          stroke={colour}
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeDasharray="180 820"
          strokeDashoffset={offset}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

export function WebglPerimeterLed({ path, width, height, radius, glow = "none" }: WebglPerimeterLedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFallback(true);
      return;
    }

    const gl = canvas.getContext("webgl", { alpha: true, antialias: true, powerPreference: "high-performance" });
    if (!gl) {
      setFallback(true);
      return;
    }

    let frameId = 0;
    let lost = false;
    let trackedWidth = 0;
    let trackedHeight = 0;
    let trackedDpr = 1;
    let sizeLocation: WebGLUniformLocation | null = null;
    let dprLocation: WebGLUniformLocation | null = null;
    let timeLocation: WebGLUniformLocation | null = null;
    let radiusLocation: WebGLUniformLocation | null = null;

    try {
      const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
      const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
      const program = gl.createProgram();
      if (!program) throw new Error("Unable to allocate WebGL program.");
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "Program link failed.");
      gl.useProgram(program);

      const buffer = gl.createBuffer();
      if (!buffer) throw new Error("Unable to allocate WebGL buffer.");
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      sizeLocation = gl.getUniformLocation(program, "u_size");
      dprLocation = gl.getUniformLocation(program, "u_dpr");
      timeLocation = gl.getUniformLocation(program, "u_time");
      radiusLocation = gl.getUniformLocation(program, "u_radius");

      /* Glow tuning is constant for the lifetime of this component — set the
         uniforms once here instead of per frame. "none"/"soft" pass the exact
         historical constants, so their rendering is unchanged. */
      const tuning = GLOW_TUNING[glow];
      gl.uniform1f(gl.getUniformLocation(program, "u_glow"), tuning.uGlow);
      gl.uniform1f(gl.getUniformLocation(program, "u_coreEdge0"), tuning.coreEdge0);
      gl.uniform1f(gl.getUniformLocation(program, "u_bodyEdge0"), tuning.bodyEdge0);
      gl.uniform1f(gl.getUniformLocation(program, "u_coreEdge1"), tuning.coreEdge1);
      gl.uniform1f(gl.getUniformLocation(program, "u_haloEdge1"), tuning.haloEdge1);
      gl.uniform1f(gl.getUniformLocation(program, "u_haloPeak"), tuning.haloPeak);
      gl.uniform1f(gl.getUniformLocation(program, "u_white"), tuning.white);
      gl.uniform1f(gl.getUniformLocation(program, "u_bodySat"), tuning.bodySat);
      gl.uniform1f(gl.getUniformLocation(program, "u_sat"), tuning.sat);
      gl.uniform1f(gl.getUniformLocation(program, "u_hotEdge0"), tuning.hotEdge0);
      gl.uniform1f(gl.getUniformLocation(program, "u_hotEdge"), tuning.hotEdge);
      gl.uniform1f(gl.getUniformLocation(program, "u_hot"), tuning.hot);
      gl.uniform1f(gl.getUniformLocation(program, "u_shape"), tuning.shape);
      gl.uniform1f(gl.getUniformLocation(program, "u_coreFrac"), tuning.coreFrac);
      gl.uniform1f(gl.getUniformLocation(program, "u_coreCap"), tuning.coreCap);
    } catch {
      setFallback(true);
      return;
    }

    /** Reallocation only when the effective size or DPR actually changes —
       same guard philosophy as the Aurora resize guard. */
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const nextDpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const nextWidth = Math.max(1, Math.round(rect.width));
      const nextHeight = Math.max(1, Math.round(rect.height));
      if (trackedWidth === nextWidth && trackedHeight === nextHeight && trackedDpr === nextDpr) return;
      trackedWidth = nextWidth;
      trackedHeight = nextHeight;
      trackedDpr = nextDpr;
      canvas.width = Math.round(trackedWidth * trackedDpr);
      canvas.height = Math.round(trackedHeight * trackedDpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    let lastTime = 0;
    let elapsed = 0;

    const render = (now: number) => {
      if (lost) return;
      if (lastTime === 0) lastTime = now;
      elapsed += Math.min(now - lastTime, MAX_FRAME_DELTA_MS);
      lastTime = now;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(sizeLocation, trackedWidth, trackedHeight);
      gl.uniform1f(dprLocation, trackedDpr);
      gl.uniform1f(timeLocation, elapsed);
      gl.uniform1f(radiusLocation, radius);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      frameId = requestAnimationFrame(render);
    };

    const onContextLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      cancelAnimationFrame(frameId);
      setFallback(true);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener("webglcontextlost", onContextLost, { once: true });
    resize();
    frameId = requestAnimationFrame(render);

    return () => {
      lost = true;
      cancelAnimationFrame(frameId);
      observer.disconnect();
      canvas.removeEventListener("webglcontextlost", onContextLost);
    };
  }, [radius, glow]);

  return fallback
    ? <StaticPerimeterFallback path={path} width={width} height={height} radius={radius} />
    : <canvas ref={canvasRef} className={styles.perimeterWebglCanvas} aria-hidden="true" />;
}
