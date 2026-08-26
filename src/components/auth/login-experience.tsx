"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { HangingLamp, type LampPhase } from "./hanging-lamp";
import {
  persistDeviceActivation,
  readDeviceActivated
} from "./device-activation";
import { LandingThemeToggle } from "@/components/landing/landing-theme-toggle";
import styles from "./login-experience.module.css";
import { WebglPerimeterLed } from "./webgl-perimeter-led";

/** Runs before the browser paints on the client (no-op pass on the server). */
const useBeforePaintEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Choreography phases — the room "waking up":
 *
 * 0. dark          — sleeping state: room is dim, lamp visible but unlit,
 *                    card hidden (opacity 0, pointer-events none, aria-hidden),
 *                    brand dimmed to 30% opacity.
 * 1. igniting      — bulb flash + warm ignition (triggered by lamp pull)
 * 2. spotlight     — spotlight expands downward, brand identity is revealed
 * 3. frame-tracing — thin line traces clockwise around the card (one pass, then stops)
 * 4. surface       — card materialises
 * 5. content       — card contents stagger in
 * 6. ambient       — lamp recedes, card is the visual destination
 *
 * The lamp does NOT auto-illuminate. The sleeping state persists until the
 * user pulls the lamp cord. This makes the lamp the narrative anchor —
 * the user must discover and interact with it to wake the room.
 */
type RevealPhase =
  | "dark"
  | "igniting"
  | "spotlight"
  | "frame-tracing"
  | "surface"
  | "content"
  | "ambient";

type LoginExperienceProps = {
  /** Small brand mark (icon/monogram), displayed beside the brand name. */
  brandMark: React.ReactNode;
  /** The brand name to display (e.g. "Amanah Cash"). */
  brandName: string;
  /** Tagline text displayed below the brand name. */
  tagline: string;
  children: React.ReactNode;
};

type PerimeterLedRenderer = "svg" | "svg-concrete" | "svg-simple-glow" | "transform" | "webgl";

const PERIMETER_LED_COUNT = 4;
const PERIMETER_LED_SLICES = 12;
const PERIMETER_LED_DURATION_MS = 8_000;
const PERIMETER_LED_LENGTH_RATIO = 0.18;
const PERIMETER_LED_TRAJECTORY_SAMPLES = 72;

/** Rounded-rect path starting at top-center (under the lamp), travelling CLOCKWISE. */
function buildBorderPath(w: number, h: number, r: number): string {
  const safeR = Math.max(1, Math.min(r, w / 2, h / 2));
  const mid = w / 2;
  return [
    `M ${mid} 0`,
    `L ${w - safeR} 0`,
    `A ${safeR} ${safeR} 0 0 1 ${w} ${safeR}`,
    `L ${w} ${h - safeR}`,
    `A ${safeR} ${safeR} 0 0 1 ${w - safeR} ${h}`,
    `L ${safeR} ${h}`,
    `A ${safeR} ${safeR} 0 0 1 0 ${h - safeR}`,
    `L 0 ${safeR}`,
    `A ${safeR} ${safeR} 0 0 1 ${safeR} 0`,
    `L ${mid} 0`,
  ].join(" ");
}

/**
 * A point and tangent on the same rounded rectangle used by the SVG border.
 * `distance` is deliberately arc-length, not a keyframe index: equal sampled
 * distances produce equal perimeter velocity through straights and corners.
 */
function getPerimeterPose(w: number, h: number, r: number, distance: number) {
  const safeR = Math.max(1, Math.min(r, w / 2, h / 2));
  const topHalf = w / 2 - safeR;
  const vertical = h - 2 * safeR;
  const horizontal = w - 2 * safeR;
  const corner = Math.PI * safeR / 2;
  /* Top (both halves) + bottom = 2 * horizontal — do not also add topHalf * 2
     or the top edge is double-counted and the orbit mis-spaces the LEDs. */
  const total = horizontal * 2 + vertical * 2 + corner * 4;
  const turns = Math.floor(distance / total);
  let s = ((distance % total) + total) % total;
  const withTurn = (angle: number) => angle + turns * 360;

  if (s <= topHalf) return { x: w / 2 + s, y: 0, angle: withTurn(0), total };
  s -= topHalf;
  if (s <= corner) {
    const theta = -Math.PI / 2 + s / safeR;
    return {
      x: w - safeR + safeR * Math.cos(theta),
      y: safeR + safeR * Math.sin(theta),
      angle: withTurn((theta + Math.PI / 2) * 180 / Math.PI),
      total,
    };
  }
  s -= corner;
  if (s <= vertical) return { x: w, y: safeR + s, angle: withTurn(90), total };
  s -= vertical;
  if (s <= corner) {
    const theta = s / safeR;
    return {
      x: w - safeR + safeR * Math.cos(theta),
      y: h - safeR + safeR * Math.sin(theta),
      angle: withTurn((theta + Math.PI / 2) * 180 / Math.PI),
      total,
    };
  }
  s -= corner;
  if (s <= horizontal) return { x: w - safeR - s, y: h, angle: withTurn(180), total };
  s -= horizontal;
  if (s <= corner) {
    const theta = Math.PI / 2 + s / safeR;
    return {
      x: safeR + safeR * Math.cos(theta),
      y: h - safeR + safeR * Math.sin(theta),
      angle: withTurn((theta + Math.PI / 2) * 180 / Math.PI),
      total,
    };
  }
  s -= corner;
  if (s <= vertical) return { x: 0, y: h - safeR - s, angle: withTurn(270), total };
  s -= vertical;
  if (s <= corner) {
    const theta = Math.PI + s / safeR;
    return {
      x: safeR + safeR * Math.cos(theta),
      y: safeR + safeR * Math.sin(theta),
      angle: withTurn((theta + Math.PI / 2) * 180 / Math.PI),
      total,
    };
  }
  s -= corner;
  return { x: safeR + s, y: 0, angle: withTurn(360), total };
}

export function LoginExperience({ brandMark, brandName, tagline, children }: LoginExperienceProps) {
  const [phase, setPhase] = useState<RevealPhase>("dark");
  const [staggerCount, setStaggerCount] = useState(0);
  /** Set for returning devices (activation already persisted) so the lamp
   * itself — not just the card — is rendered in its illuminated state. */
  const [isReturningDevice, setIsReturningDevice] = useState(false);
  const [perimeterLedRenderer, setPerimeterLedRenderer] = useState<PerimeterLedRenderer>("svg");
  const [perimeterLedGlow, setPerimeterLedGlow] = useState<"none" | "soft" | "premium" | "neon" | "illuminated" | "reference" | "reference-v2" | "reference-v2-thick" | "reference-v2-glm" | "reference-v2-glm-bold" | "reference-v2-glm-no-outline" | "reference-v2-glm-no-outline-refined" | "reference-v2-glm-no-outline-refined-v2" | "reference-v2-glm-no-outline-neon-tube" | "reference-v2-glm-no-outline-perfect" | "reference-v2-glm-no-outline-neon-tube-solid" | "reference-v2-glm-no-outline-neon-tube-bold-curve" | "reference-v2-glm-no-outline-neon-tube-ultra">("none");
  const frameRef = useRef<HTMLDivElement>(null);
  const borderPathRef = useRef<SVGPathElement>(null);
  const transformLedRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [frameDims, setFrameDims] = useState({ w: 416, h: 480, r: 16 });
  const [actualPerimeterLength, setActualPerimeterLength] = useState<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const phaseRef = useRef<RevealPhase>(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  /**
   * Last phase reported by the lamp. Teardown must only run on a genuine
   * illuminated → dark transition (a real cord pull); the lamp's initial
   * mount echo of "dark" must never send a returning device's lit room back
   * to sleep.
   */
  const lastLampPhaseRef = useRef<LampPhase | null>(null);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const after = useCallback((ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    const updateDims = () => {
      if (frameRef.current) {
        const rect = frameRef.current.getBoundingClientRect();
        const computedRadius = parseFloat(
          getComputedStyle(frameRef.current).borderRadius || "16"
        );
        setFrameDims({
          w: Math.round(rect.width),
          h: Math.round(rect.height),
          r: Number.isFinite(computedRadius) ? computedRadius : 16,
        });
      }
    };

    updateDims();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && frameRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateDims();
      });
      resizeObserver.observe(frameRef.current);
    }

    window.addEventListener("resize", updateDims);
    return () => {
      window.removeEventListener("resize", updateDims);
      resizeObserver?.disconnect();
      clearTimers();
    };
  }, [clearTimers]);

  /** Forward — the room wakes up. */
  const revealForward = useCallback(() => {
    clearTimers();
    setPhase("igniting");
    after(500, () => setPhase("spotlight"));       // brand identity fades in
    after(1200, () => setPhase("frame-tracing"));  // border traces clockwise (one pass)
    after(2000, () => setPhase("surface"));        // card materialises
    after(2400, () => setPhase("content"));        // contents stagger in
    after(3200, () => setPhase("ambient"));        // lamp recedes, card is destination
  }, [clearTimers, after]);

  /** Reverse — the room goes back to sleep. */
  const teardownReverse = useCallback(() => {
    clearTimers();
    setStaggerCount(0);
    setPhase("frame-tracing");                     // card surface fades, border stays
    after(500, () => setPhase("spotlight"));        // border un-draws, brand dims
    after(1200, () => setPhase("dark"));           // spotlight contracts, room dark
  }, [clearTimers, after]);

  const handleLampPhase = useCallback(
    (lampPhase: LampPhase) => {
      const previousLampPhase = lastLampPhaseRef.current;
      lastLampPhaseRef.current = lampPhase;
      if (lampPhase === "illuminated") {
        // The lamp pull is a one-time per-device onboarding: remember this
        // browser so future visits skip the dark ritual and show the login
        // card immediately. Purely presentational — unrelated to the
        // authentication session, which may still expire or be signed out.
        persistDeviceActivation();
        if (phaseRef.current === "dark") revealForward();
      } else if (lampPhase === "dark" && previousLampPhase === "illuminated") {
        if (phaseRef.current !== "dark") teardownReverse();
      }
    },
    [revealForward, teardownReverse]
  );

  /* Returning devices: the activation ritual already happened here, so skip
     straight to the lit "ambient" state before first paint (no dark flash,
     no repeated lamp pull). First-time devices keep the sleeping room. The
     lamp is told to adopt its illuminated state in the same pre-paint pass,
     and phaseRef is updated synchronously so the lamp's mount callback cannot
     restart the reveal choreography. */
  useBeforePaintEffect(() => {
    if (phaseRef.current === "dark" && readDeviceActivated()) {
      clearTimers();
      setStaggerCount(Number.MAX_SAFE_INTEGER);
      phaseRef.current = "ambient";
      setPhase("ambient");
      setIsReturningDevice(true);
    }
  }, []);

  /* Runtime comparison switch only. Production remains on the existing SVG
     renderer unless an explicit experiment is requested. */
  useBeforePaintEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("perimeterLedRenderer");
    if (requested === "transform" || requested === "svg-concrete" || requested === "svg-simple-glow" || requested === "webgl") {
      setPerimeterLedRenderer(requested);
    }
    const requestedGlow = params.get("perimeterLedGlow");
    if (requestedGlow === "soft" || requestedGlow === "premium" || requestedGlow === "neon" || requestedGlow === "illuminated" || requestedGlow === "reference" || requestedGlow === "reference-v2" || requestedGlow === "reference-v2-thick" || requestedGlow === "reference-v2-glm" || requestedGlow === "reference-v2-glm-bold" || requestedGlow === "reference-v2-glm-no-outline" || requestedGlow === "reference-v2-glm-no-outline-refined" || requestedGlow === "reference-v2-glm-no-outline-refined-v2" || requestedGlow === "reference-v2-glm-no-outline-neon-tube" || requestedGlow === "reference-v2-glm-no-outline-perfect" || requestedGlow === "reference-v2-glm-no-outline-neon-tube-solid" || requestedGlow === "reference-v2-glm-no-outline-neon-tube-bold-curve" || requestedGlow === "reference-v2-glm-no-outline-neon-tube-ultra") {
      setPerimeterLedGlow(requestedGlow);
    }
  }, []);

  /* Auto-illuminate: DISABLED for Batch 1.
     The lamp does NOT auto-ignite. The sleeping state persists until the
     user pulls the lamp cord. This makes the lamp the narrative anchor.
     Auto-illuminate will be reintroduced for returning users in a future batch. */
  // useEffect(() => {
  //   autoIlluminateRef.current = setTimeout(() => {
  //     if (phaseRef.current === "dark") {
  //       revealForward();
  //     }
  //   }, 800);
  //   return () => {
  //     if (autoIlluminateRef.current) clearTimeout(autoIlluminateRef.current);
  //   };
  // }, [revealForward]);

  useEffect(() => {
    if (phase !== "content") return;
    const total = frameRef.current?.querySelectorAll("[data-stagger]").length ?? 0;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setStaggerCount(i);
      if (i >= total) clearInterval(interval);
    }, 60);
    return () => clearInterval(interval);
  }, [phase]);

  const isLit = phase !== "dark";
  const isLampQuiet = phase === "ambient";
  const isBrandVisible =
    phase === "spotlight" ||
    phase === "frame-tracing" ||
    phase === "surface" ||
    phase === "content" ||
    phase === "ambient";
  const isFrameTraced =
    phase === "frame-tracing" ||
    phase === "surface" ||
    phase === "content" ||
    phase === "ambient";
  const isSurfaceVisible = phase === "surface" || phase === "content" || phase === "ambient";
  const isTransformPrototype = perimeterLedRenderer === "transform";
  const isWebglPrototype = perimeterLedRenderer === "webgl";
  const isConcreteSvgExperiment = perimeterLedRenderer === "svg-concrete" || perimeterLedRenderer === "svg-simple-glow";
  const isSimplifiedGlowExperiment = perimeterLedRenderer === "svg-simple-glow";

  /* B/C measure the browser's own path implementation once per card geometry.
     Runtime animation then consumes concrete user-unit values, avoiding the
     pathLength + CSS px + calc interaction used by the baseline. */
  useEffect(() => {
    if (!isConcreteSvgExperiment || !borderPathRef.current) return;
    const length = borderPathRef.current.getTotalLength();
    setActualPerimeterLength(Number.isFinite(length) && length > 0 ? length : null);
  }, [frameDims, isConcreteSvgExperiment]);

  /*
   * Prototype B: a long LED is made from short, overlapping static glow
   * slices. The group is visually one long segment, but the slices let it bend
   * through rounded corners without animating SVG geometry. This work runs
   * only when dimensions/renderer change; the animation itself is transform
   * only and is sampled by WAAPI/the compositor.
   */
  useEffect(() => {
    if (!isTransformPrototype || !isSurfaceVisible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const { w, h, r } = frameDims;
    const { total } = getPerimeterPose(w, h, r, 0);
    const ledLength = total * PERIMETER_LED_LENGTH_RATIO;
    const sliceSpacing = ledLength / PERIMETER_LED_SLICES;
    const animations: Animation[] = [];

    transformLedRefs.current.forEach((element, index) => {
      if (!element) return;
      const ledIndex = Math.floor(index / PERIMETER_LED_SLICES);
      const sliceIndex = index % PERIMETER_LED_SLICES;
      const centreOffset = (sliceIndex - (PERIMETER_LED_SLICES - 1) / 2) * sliceSpacing;
      const start = ledIndex * total / PERIMETER_LED_COUNT + centreOffset;
      const keyframes = Array.from(
        { length: PERIMETER_LED_TRAJECTORY_SAMPLES + 1 },
        (_, sampleIndex) => {
          const pose = getPerimeterPose(
            w,
            h,
            r,
            start + total * sampleIndex / PERIMETER_LED_TRAJECTORY_SAMPLES,
          );
          return {
            offset: sampleIndex / PERIMETER_LED_TRAJECTORY_SAMPLES,
            transform: `translate3d(${pose.x}px, ${pose.y}px, 0) rotate(${pose.angle}deg)`,
          };
        },
      );
      animations.push(element.animate(keyframes, {
        duration: PERIMETER_LED_DURATION_MS,
        iterations: Infinity,
        easing: "linear",
      }));
    });

    return () => animations.forEach((animation) => animation.cancel());
  }, [frameDims, isSurfaceVisible, isTransformPrototype]);

  const borderPath = buildBorderPath(frameDims.w, frameDims.h, frameDims.r);
  const concretePerimeterLength = actualPerimeterLength ?? 1000;
  const concreteLedLength = concretePerimeterLength * PERIMETER_LED_LENGTH_RATIO;
  const concreteDashGap = concretePerimeterLength / 2 - concreteLedLength;
  const concreteSvgStyle = isConcreteSvgExperiment
    ? {
        "--plm-concrete-dasharray": `${concreteLedLength} ${concreteDashGap}`,
        "--plm-concrete-start": `${concreteLedLength / 2}`,
        "--plm-concrete-end": `${concreteLedLength / 2 - concretePerimeterLength}`,
      } as React.CSSProperties
    : undefined;
  const prototypeSliceLength = Math.max(
    8,
    getPerimeterPose(frameDims.w, frameDims.h, frameDims.r, 0).total
      * PERIMETER_LED_LENGTH_RATIO / PERIMETER_LED_SLICES * 1.24,
  );
  const prototypePerimeter = getPerimeterPose(frameDims.w, frameDims.h, frameDims.r, 0).total;

  return (
    <div className={styles.viewport}>
      {/* Top floating controls: Theme toggle (top-left) & Back to Landing (top-right) */}
      <div className={styles.themeToggleWrapper}>
        <LandingThemeToggle />
      </div>

      <Link href="/" className={styles.backLink} aria-label="Kembali ke Landing Page">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={styles.backArrow}
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        <span className={styles.backTextFull}>Kembali ke Landing Page</span>
        <span className={styles.backTextShort}>Kembali</span>
      </Link>

      <div className={[styles.roomDim, isLit ? styles.roomDimLit : ""].filter(Boolean).join(" ")} />
      <div className={[styles.ambientLight, isLit ? styles.ambientLightOn : ""].filter(Boolean).join(" ")} />

      {/* Lamp scaler — lets small viewports shrink the whole lamp + cone unit
          in lockstep with the protected logo zone. */}
      <div className={styles.lampScaler}>
        <HangingLamp
          onPhaseChange={handleLampPhase}
          quiet={isLampQuiet}
          initiallyIlluminated={isReturningDevice}
        />
      </div>

      {/* Spotlight zone — brand identity lives inside the brightest area of the light.
          Horizontal lockup: Mark | Wordmark + Tagline */}
      <div className={[styles.spotlightZone, isLit ? styles.spotlightZoneOn : ""].filter(Boolean).join(" ")}>
        <div className={[styles.brandStage, isBrandVisible ? styles.brandStageVisible : ""].filter(Boolean).join(" ")}>
          <div className={styles.brandMark}>
            {brandMark}
          </div>
          <div className={styles.brandText}>
            <h2 className={styles.brandName}>
              {brandName === "Amanah Cash" ? (
                <>
                  <span>Amanah </span>
                  <span className={styles.brandAccent}>Cash</span>
                </>
              ) : (
                brandName
              )}
            </h2>
            <p className={styles.brandTagline}>{tagline}</p>
          </div>
        </div>
      </div>

      {/* Login card — born from the light, the visual destination.
          In the sleeping state (phase === "dark"), the card is in the DOM but
          invisible and non-interactive. aria-hidden removes it from the
          accessibility tree. pointer-events:none prevents accidental clicks.
          This avoids layout shift when the card is later revealed. */}
      <div
        ref={frameRef}
        className={[
          styles.cardFrame,
          isFrameTraced ? styles.cardFrameRevealed : "",
          isTransformPrototype ? styles.cardFrameTransformPrototype : "",
          isWebglPrototype ? styles.cardFrameWebglPrototype : "",
        ].filter(Boolean).join(" ")}
        data-perimeter-led-renderer={perimeterLedRenderer}
        data-perimeter-led-glow={perimeterLedGlow}
        aria-hidden={phase === "dark"}
        style={phase === "dark" ? { pointerEvents: "none" } : undefined}
      >
        <svg className={styles.borderTrace} viewBox={`0 0 ${frameDims.w} ${frameDims.h}`} preserveAspectRatio="none" overflow="visible" aria-hidden="true">
          {/* Light traces from top-centre clockwise once, then becomes a quiet border. */}
          <path
            ref={borderPathRef}
            d={borderPath}
            pathLength={isConcreteSvgExperiment || isWebglPrototype ? undefined : 1000}
            fill="none"
            stroke="var(--auth-border-trace)"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className={[styles.borderTracePath, isFrameTraced ? styles.borderTraceDrawn : ""].filter(Boolean).join(" ")}
          />
          {/* Perimeter traveling lights — pure CSS stroke-dash animation on static
              border paths (no rAF geometry, no SVG mask, no wall-clock modulo).
              pathLength=1000 normalises dash math: dasharray "180 320" yields two
              18%-perimeter windows at opposite points; animating dashoffset
              90 → -910 (one full 1000-unit lap, 8s linear infinite) orbits them
              clockwise. Teal paths get a -2s animation-delay for the 25% phase
              offset, giving 4 lights at 0/25/50/75%. */}
          {/* Warm LED Strip: Outer Neon Tube (3.5px) + Inner Hot Core (1.5px) */}
          <path
            d={borderPath}
            pathLength={isConcreteSvgExperiment ? undefined : 1000}
            fill="none"
            stroke="var(--auth-plm-warm-bloom)"
            strokeWidth={3.5}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className={[styles.perimeterLightPath, isConcreteSvgExperiment ? styles.perimeterLightPathConcrete : "", isSimplifiedGlowExperiment ? styles.perimeterGlowWarmSimple : styles.perimeterGlowWarmBloom, isSurfaceVisible ? styles.perimeterLightPathOn : ""].filter(Boolean).join(" ")}
            style={concreteSvgStyle}
          />
          <path
            d={borderPath}
            pathLength={isConcreteSvgExperiment ? undefined : 1000}
            fill="none"
            stroke="var(--auth-plm-warm-core)"
            strokeWidth={1.5}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className={[styles.perimeterLightPath, isConcreteSvgExperiment ? styles.perimeterLightPathConcrete : "", isSimplifiedGlowExperiment ? styles.perimeterGlowWarmCoreSimple : styles.perimeterGlowWarmCore, isSurfaceVisible ? styles.perimeterLightPathOn : ""].filter(Boolean).join(" ")}
            style={concreteSvgStyle}
          />
          {/* Teal LED Strip: Outer Neon Tube (3.5px) + Inner Hot Core (1.5px) */}
          <path
            d={borderPath}
            pathLength={isConcreteSvgExperiment ? undefined : 1000}
            fill="none"
            stroke="var(--auth-plm-teal-bloom)"
            strokeWidth={3.5}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className={[styles.perimeterLightPath, isConcreteSvgExperiment ? styles.perimeterLightPathConcrete : "", isSimplifiedGlowExperiment ? styles.perimeterGlowTealSimple : styles.perimeterGlowTealBloom, isSurfaceVisible ? styles.perimeterLightPathOn : ""].filter(Boolean).join(" ")}
            style={concreteSvgStyle}
          />
          <path
            d={borderPath}
            pathLength={isConcreteSvgExperiment ? undefined : 1000}
            fill="none"
            stroke="var(--auth-plm-teal-core)"
            strokeWidth={1.5}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className={[styles.perimeterLightPath, isConcreteSvgExperiment ? styles.perimeterLightPathConcrete : "", isSimplifiedGlowExperiment ? styles.perimeterGlowTealCoreSimple : styles.perimeterGlowTealCore, isSurfaceVisible ? styles.perimeterLightPathOn : ""].filter(Boolean).join(" ")}
            style={concreteSvgStyle}
          />
        </svg>

        {isWebglPrototype && isSurfaceVisible ? (
          <WebglPerimeterLed path={borderPath} width={frameDims.w} height={frameDims.h} radius={frameDims.r} glow={perimeterLedGlow} />
        ) : null}

        {isTransformPrototype && isSurfaceVisible ? (
          <div className={styles.perimeterTransformLedLayer} aria-hidden="true">
            {Array.from({ length: PERIMETER_LED_COUNT * PERIMETER_LED_SLICES }, (_, index) => {
              const ledIndex = Math.floor(index / PERIMETER_LED_SLICES);
              const sliceIndex = index % PERIMETER_LED_SLICES;
              const tone = ledIndex % 2 === 0 ? styles.perimeterTransformLedWarm : styles.perimeterTransformLedTeal;
              const initialDistance = ledIndex * prototypePerimeter / PERIMETER_LED_COUNT
                + (sliceIndex - (PERIMETER_LED_SLICES - 1) / 2)
                  * (prototypePerimeter * PERIMETER_LED_LENGTH_RATIO / PERIMETER_LED_SLICES);
              const initialPose = getPerimeterPose(frameDims.w, frameDims.h, frameDims.r, initialDistance);
              return (
                <div
                  key={index}
                  ref={(element) => { transformLedRefs.current[index] = element; }}
                  className={[styles.perimeterTransformLedCarrier, tone].join(" ")}
                  data-perimeter-led-prototype-carrier
                  style={{ transform: `translate3d(${initialPose.x}px, ${initialPose.y}px, 0) rotate(${initialPose.angle}deg)` }}
                >
                  <div
                    className={styles.perimeterTransformLedSlice}
                    style={{ width: `${prototypeSliceLength}px` }}
                  />
                </div>
              );
            })}
          </div>
        ) : null}

        <div
          className={[styles.cardSurface, isSurfaceVisible ? styles.cardSurfaceVisible : ""].filter(Boolean).join(" ")}
          role="region"
          aria-labelledby="login-title"
        >
          {Array.isArray(children)
            ? children.map((child, i) => (
                <div
                  key={i}
                  data-stagger
                  data-stagger-index={i}
                  className={[styles.staggerItem, staggerCount > i ? styles.staggerItemVisible : ""].filter(Boolean).join(" ")}
                >
                  {child}
                </div>
              ))
            : (
                <div
                  data-stagger
                  data-stagger-index={0}
                  className={[styles.staggerItem, staggerCount > 0 ? styles.staggerItemVisible : ""].filter(Boolean).join(" ")}
                >
                  {children}
                </div>
              )}
        </div>
      </div>
    </div>
  );
}
