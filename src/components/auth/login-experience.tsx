"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HangingLamp, type LampPhase } from "./hanging-lamp";
import styles from "./login-experience.module.css";

/**
 * Choreography phases — the room "waking up":
 *
 * 0. dark          — room is dark, lamp visible but unlit
 * 1. igniting      — bulb flash + warm ignition (auto-triggered after 800ms)
 * 2. spotlight     — spotlight expands downward, brand identity is revealed
 * 3. frame-tracing — thin line traces clockwise around the card (one pass, then stops)
 * 4. surface       — card materialises
 * 5. content       — card contents stagger in
 * 6. ambient       — lamp recedes, card is the visual destination
 *
 * The lamp auto-illuminates on page load. Users can still toggle it via the
 * pull-cord, but the interaction gate is removed.
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

export function LoginExperience({ brandMark, brandName, tagline, children }: LoginExperienceProps) {
  const [phase, setPhase] = useState<RevealPhase>("dark");
  const [staggerCount, setStaggerCount] = useState(0);
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameDims, setFrameDims] = useState({ w: 416, h: 480, r: 16 });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const autoIlluminateRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const phaseRef = useRef<RevealPhase>(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const after = useCallback((ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  useEffect(() => {
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
    return clearTimers;
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
      const current = phaseRef.current;
      if (lampPhase === "illuminated") {
        if (current === "dark") revealForward();
      } else if (lampPhase === "dark") {
        if (current !== "dark") teardownReverse();
      }
    },
    [revealForward, teardownReverse]
  );

  /* Auto-illuminate: after a brief 800ms pause the lamp triggers automatically.
     This preserves the pull-cord for curious users, but removes the interaction
     gate that previously blocked access to the login form. */
  useEffect(() => {
    autoIlluminateRef.current = setTimeout(() => {
      if (phaseRef.current === "dark") {
        revealForward();
      }
    }, 800);
    return () => {
      if (autoIlluminateRef.current) clearTimeout(autoIlluminateRef.current);
    };
  }, [revealForward]);

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

  const borderPath = buildBorderPath(frameDims.w, frameDims.h, frameDims.r);

  return (
    <div className={styles.viewport}>
      <div className={[styles.roomDim, isLit ? styles.roomDimLit : ""].filter(Boolean).join(" ")} />
      <div className={[styles.ambientLight, isLit ? styles.ambientLightOn : ""].filter(Boolean).join(" ")} />

      {/* Lamp scaler — lets small viewports shrink the whole lamp + cone unit
          in lockstep with the protected logo zone. */}
      <div className={styles.lampScaler}>
        <HangingLamp onPhaseChange={handleLampPhase} quiet={isLampQuiet} />
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

      {/* Login card — born from the light, the visual destination */}
      <div
        ref={frameRef}
        className={[styles.cardFrame, isFrameTraced ? styles.cardFrameRevealed : ""].filter(Boolean).join(" ")}
      >
        <svg className={styles.borderTrace} viewBox={`0 0 ${frameDims.w} ${frameDims.h}`} preserveAspectRatio="none" aria-hidden="true">
          {/* Light traces from top-centre clockwise once, then becomes a quiet border. */}
          <path
            d={borderPath}
            pathLength={1000}
            fill="none"
            stroke="var(--auth-border-trace)"
            strokeWidth={1.5}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className={[styles.borderTracePath, isFrameTraced ? styles.borderTraceDrawn : ""].filter(Boolean).join(" ")}
          />
        </svg>

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
