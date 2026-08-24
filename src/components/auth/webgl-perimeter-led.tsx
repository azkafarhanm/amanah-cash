"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./login-experience.module.css";

type WebglPerimeterLedProps = {
  path: string;
  width: number;
  height: number;
  /** Corner radius of the same rounded rectangle the SVG border uses. */
  radius: number;
};

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
  float line = 1.0 - smoothstep(1.25, 2.15, borderDistance);
  float phase = mod(u_time * perimeter / ${DURATION_MS.toFixed(1)}, perimeter);
  vec3 colour = vec3(0.0);
  float ribbon = 0.0;

  for (int i = 0; i < 4; i++) {
    float centre = mod(phase + float(i) * perimeter * 0.25, perimeter);
    float halfRibbon = perimeter * 0.09;
    float within = 1.0 - smoothstep(halfRibbon, halfRibbon + 2.0, cyclicDistance(s, centre, perimeter));
    vec3 tone = mod(float(i), 2.0) < 0.5
      ? vec3(1.0, 0.78, 0.25)
      : vec3(0.22, 0.92, 0.82);
    colour += tone * within;
    ribbon = max(ribbon, within);
  }

  gl_FragColor = vec4(colour * line, ribbon * line);
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

export function WebglPerimeterLed({ path, width, height, radius }: WebglPerimeterLedProps) {
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
  }, [radius]);

  return fallback
    ? <StaticPerimeterFallback path={path} width={width} height={height} radius={radius} />
    : <canvas ref={canvasRef} className={styles.perimeterWebglCanvas} aria-hidden="true" />;
}
