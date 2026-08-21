"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

import { THEME_CHANGE_EVENT, type ThemePreference, resolveTheme } from "@/settings/theme";
import styles from "./soft-aurora.module.css";

const VERTEX_SHADER = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uAlpha;
  uniform float uSpeed;
  uniform float uBandHeight;
  uniform float uBandSpread;
  uniform float uNoiseFrequency;
  uniform float uNoiseAmplitude;
  uniform vec2 uMouse;
  uniform float uMouseInfluence;
  uniform float uEnableMouse;

  varying vec2 vUv;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,
                        0.366025403784439,
                       -0.577350269189626,
                        0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
          + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * uSpeed;

    // Organic subtle mouse displacement and localized undulation
    vec2 mouseDelta = uv - uMouse;
    float mouseDist = length(mouseDelta);
    float mouseFalloff = exp(-mouseDist * 3.0); // Smooth organic exponential falloff
    float mouseRipple = sin(mouseDist * 8.5 - t * 2.0) * 0.5 + 0.5;
    vec2 mouseOffset = (uMouse - vec2(0.5)) * uMouseInfluence * uEnableMouse;

    // Dynamic UV warping with responsive gravitational lens
    vec2 warpedUv = uv + (mouseOffset * 0.65 + mouseDelta * mouseFalloff * uMouseInfluence * 0.95) * uEnableMouse;

    // Multi-octave wave coordinates
    float n1 = snoise(vec2(warpedUv.x * uNoiseFrequency + t * 0.15, warpedUv.y * uNoiseFrequency * 0.5 + t * 0.1));
    float n2 = snoise(vec2(warpedUv.x * uNoiseFrequency * 1.4 - t * 0.12, warpedUv.y * uNoiseFrequency * 0.8 + t * 0.18 + n1 * uNoiseAmplitude));

    // Primary undulating aurora ribbon with dynamic curvature and magnetic deflection
    float bandCenter = uBandHeight + sin(warpedUv.x * 3.14159 * 0.75 + t * 0.22) * 0.12 
                       + n2 * 0.14 + (mouseOffset.y * 0.45 - mouseDelta.y * mouseFalloff * 0.35 + mouseRipple * mouseFalloff * 0.08) * uEnableMouse;
    float dist = abs(uv.y - bandCenter);
    float band = smoothstep(uBandSpread, 0.0, dist);

    // Soft atmospheric background wash with tactile cursor glow
    float wash = smoothstep(0.75, 0.0, abs(uv.y - 0.48)) * 0.30;
    float cursorGlow = mouseFalloff * 0.28 * uEnableMouse;
    float intensity = clamp(band * 1.1 + wash * 0.5 + n1 * 0.12 + cursorGlow, 0.0, 1.0);

    // Smooth Amanah Cash color stop mixing
    float colorMix1 = smoothstep(0.05, 0.58, warpedUv.x + n1 * 0.18);
    float colorMix2 = smoothstep(0.38, 0.92, warpedUv.x + n2 * 0.22);

    vec3 col = mix(uColor1, uColor2, colorMix1);
    col = mix(col, uColor3, colorMix2);

    // Vignette edge falloff for seamless background integration
    float edgeMask = smoothstep(0.0, 0.15, uv.x) * smoothstep(1.0, 0.85, uv.x) *
                     smoothstep(0.0, 0.15, uv.y) * smoothstep(1.0, 0.85, uv.y);

    float finalAlpha = intensity * uAlpha * edgeMask;

    gl_FragColor = vec4(col * finalAlpha, finalAlpha);
  }
`;

// Theme-specific color palettes mapped directly to Amanah Cash brand tokens
interface AuroraThemePalette {
  color1: [number, number, number];
  color2: [number, number, number];
  color3: [number, number, number];
  alpha: number;
  speed: number;
}

const THEME_PALETTES: Record<"light" | "dark", AuroraThemePalette> = {
  light: {
    // #00A896 (Teal) / #315E7D (Slate Blue) / #F59E0B (Warm Amber accent)
    color1: [0.0, 0.658, 0.588],
    color2: [0.192, 0.368, 0.490],
    color3: [0.960, 0.620, 0.043],
    alpha: 0.24,
    speed: 0.55,
  },
  dark: {
    // #00C4B4 (Luminous Teal) / #0284C7 (Sky Sapphire) / #1E293B (Deep Slate)
    color1: [0.0, 0.768, 0.705],
    color2: [0.007, 0.517, 0.780],
    color3: [0.117, 0.160, 0.231],
    alpha: 0.42,
    speed: 0.65,
  },
};

function getActiveTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  const docTheme = document.documentElement.dataset.theme;
  if (docTheme === "dark" || docTheme === "light") return docTheme;
  const stored = window.localStorage?.getItem("amanah-cash-theme") as ThemePreference | null;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return resolveTheme(stored || "DARK", prefersDark);
}

export function SoftAurora() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: Renderer | null = null;
    let animationFrameId: number | null = null;
    let isVisible = true;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    try {
      const isMobile = window.innerWidth < 768;
      const dpr = isMobile
        ? Math.min(window.devicePixelRatio || 1, 1.0)
        : Math.min(window.devicePixelRatio || 1, 1.5);

      renderer = new Renderer({
        dpr,
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        powerPreference: "low-power",
      });

      const gl = renderer.gl;
      if (!gl) return;

      gl.canvas.className = styles.canvas;
      container.appendChild(gl.canvas);

      const geometry = new Triangle(gl);
      const initialTheme = getActiveTheme();
      const initialPalette = THEME_PALETTES[initialTheme];

      // Interpolation targets for smooth color transitions during theme switches
      let targetColor1 = [...initialPalette.color1];
      let targetColor2 = [...initialPalette.color2];
      let targetColor3 = [...initialPalette.color3];
      let targetAlpha = initialPalette.alpha;
      let targetSpeed = initialPalette.speed;

      const currentColor1 = [...targetColor1];
      const currentColor2 = [...targetColor2];
      const currentColor3 = [...targetColor3];
      let currentAlpha = targetAlpha;
      let currentSpeed = targetSpeed;

      // Calibrated mouse interaction coordinates & smooth lerp targets
      const targetMouse: [number, number] = [0.5, 0.5];
      const currentMouse: [number, number] = [0.5, 0.5];
      const mouseInfluence = 0.38;
      const enableMouse = isMobile ? 0.0 : 1.0;

      const program = new Program(gl, {
        vertex: VERTEX_SHADER,
        fragment: FRAGMENT_SHADER,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: [container.clientWidth, container.clientHeight] },
          uColor1: { value: currentColor1 },
          uColor2: { value: currentColor2 },
          uColor3: { value: currentColor3 },
          uAlpha: { value: currentAlpha },
          uSpeed: { value: currentSpeed },
          uBandHeight: { value: isMobile ? 0.42 : 0.48 },
          uBandSpread: { value: isMobile ? 0.32 : 0.38 },
          uNoiseFrequency: { value: isMobile ? 1.8 : 1.5 },
          uNoiseAmplitude: { value: isMobile ? 0.45 : 0.6 },
          uMouse: { value: currentMouse },
          uMouseInfluence: { value: mouseInfluence },
          uEnableMouse: { value: enableMouse },
        },
      });

      const mesh = new Mesh(gl, { geometry, program });

      const handleResize = () => {
        if (!container || !renderer) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width === 0 || height === 0) return;

        renderer.setSize(width, height);
        program.uniforms.uResolution.value = [width, height];
      };

      handleResize();
      window.addEventListener("resize", handleResize, { passive: true });

      // Pointer event listeners with boundary decay for desktop mouse interaction
      const handlePointerMove = (e: PointerEvent) => {
        if (isMobile) return;
        const rect = container.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;

        const insideX = e.clientX >= rect.left && e.clientX <= rect.right;
        const insideY = e.clientY >= rect.top && e.clientY <= rect.bottom;

        if (insideX && insideY) {
          const rawX = (e.clientX - rect.left) / rect.width;
          const rawY = 1.0 - (e.clientY - rect.top) / rect.height; // Invert Y for WebGL coordinates
          targetMouse[0] = Math.max(0.0, Math.min(1.0, rawX));
          targetMouse[1] = Math.max(0.0, Math.min(1.0, rawY));
        } else {
          // Gracefully decay back to center rest position when cursor leaves the Hero bounds
          targetMouse[0] = 0.5;
          targetMouse[1] = 0.5;
        }
      };

      const handlePointerLeave = () => {
        if (isMobile) return;
        // Smoothly return to center rest position
        targetMouse[0] = 0.5;
        targetMouse[1] = 0.5;
      };

      if (!isMobile) {
        window.addEventListener("pointermove", handlePointerMove, { passive: true });
        window.addEventListener("pointerleave", handlePointerLeave, { passive: true });
      }

      // Theme change handler
      const handleThemeChange = () => {
        const nextTheme = getActiveTheme();
        const nextPalette = THEME_PALETTES[nextTheme];
        targetColor1 = [...nextPalette.color1];
        targetColor2 = [...nextPalette.color2];
        targetColor3 = [...nextPalette.color3];
        targetAlpha = nextPalette.alpha;
        targetSpeed = nextPalette.speed;
      };

      window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);

      // Mutation observer on data-theme attribute
      const themeObserver = new MutationObserver(() => {
        handleThemeChange();
      });
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme", "data-theme-preference"],
      });

      container.classList.add(styles.containerReady);

      // Performance Optimization: IntersectionObserver to stop RAF when Hero is out of viewport
      let intersectionObserver: IntersectionObserver | null = null;
      if (typeof IntersectionObserver !== "undefined") {
        intersectionObserver = new IntersectionObserver(
          (entries) => {
            const entry = entries[0];
            isVisible = Boolean(entry && entry.isIntersecting);
            if (isVisible && !animationFrameId && !prefersReducedMotion) {
              lastTime = performance.now();
              animationFrameId = requestAnimationFrame(renderLoop);
            }
          },
          { threshold: 0.05 }
        );
        intersectionObserver.observe(container);
      }

      let lastTime = performance.now();
      let elapsedTime = 0;

      const renderLoop = (now: number) => {
        if (!isVisible || !renderer) {
          animationFrameId = null;
          return;
        }

        const delta = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;
        elapsedTime += delta;

        // Smoothly interpolate color uniforms toward target
        const lerpFactor = Math.min(delta * 4, 1.0);
        for (let i = 0; i < 3; i++) {
          currentColor1[i] += (targetColor1[i] - currentColor1[i]) * lerpFactor;
          currentColor2[i] += (targetColor2[i] - currentColor2[i]) * lerpFactor;
          currentColor3[i] += (targetColor3[i] - currentColor3[i]) * lerpFactor;
        }
        currentAlpha += (targetAlpha - currentAlpha) * lerpFactor;
        currentSpeed += (targetSpeed - currentSpeed) * lerpFactor;

        // Smoothly damp mouse coordinates toward target with fluid responsiveness
        if (!isMobile) {
          const mouseLerp = Math.min(delta * 6.5, 0.24);
          currentMouse[0] += (targetMouse[0] - currentMouse[0]) * mouseLerp;
          currentMouse[1] += (targetMouse[1] - currentMouse[1]) * mouseLerp;
          program.uniforms.uMouse.value = currentMouse;
        }

        program.uniforms.uTime.value = elapsedTime;
        program.uniforms.uColor1.value = currentColor1;
        program.uniforms.uColor2.value = currentColor2;
        program.uniforms.uColor3.value = currentColor3;
        program.uniforms.uAlpha.value = currentAlpha;
        program.uniforms.uSpeed.value = currentSpeed;

        renderer.render({ scene: mesh });

        if (!prefersReducedMotion) {
          animationFrameId = requestAnimationFrame(renderLoop);
        } else {
          animationFrameId = null;
        }
      };

      // Initial single frame render
      renderLoop(performance.now());

      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerleave", handlePointerLeave);
        window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
        themeObserver.disconnect();
        intersectionObserver?.disconnect();

        if (renderer && gl) {
          gl.getExtension("WEBGL_lose_context")?.loseContext();
          if (gl.canvas && gl.canvas.parentElement) {
            gl.canvas.parentElement.removeChild(gl.canvas);
          }
        }
      };
    } catch {
      // Graceful fallback: WebGL initialization failed, keep container hidden
    }
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={styles.container}
    />
  );
}
