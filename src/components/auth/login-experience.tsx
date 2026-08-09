"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { HangingLamp, type LampPhase } from "./hanging-lamp";
import styles from "./login-experience.module.css";

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

/** Returns the (x, y) coordinates for any arc-length position s in [0, totalLen] along the rounded-rect perimeter. */
function getPerimeterPoint(w: number, h: number, safeR: number, s: number): [number, number] {
  const midX = w / 2;
  const l1 = midX - safeR;
  const l2 = 0.5 * Math.PI * safeR;
  const l3 = h - 2 * safeR;
  const l4 = l2;
  const l5 = w - 2 * safeR;
  const l6 = l2;
  const l7 = l3;
  const l8 = l2;

  const s1 = l1;
  const s2 = s1 + l2;
  const s3 = s2 + l3;
  const s4 = s3 + l4;
  const s5 = s4 + l5;
  const s6 = s5 + l6;
  const s7 = s6 + l7;
  const s8 = s7 + l8;

  if (s <= s1) {
    return [midX + s, 0];
  } else if (s <= s2) {
    const u = s - s1;
    const angle = -Math.PI / 2 + u / safeR;
    return [w - safeR + safeR * Math.cos(angle), safeR + safeR * Math.sin(angle)];
  } else if (s <= s3) {
    const u = s - s2;
    return [w, safeR + u];
  } else if (s <= s4) {
    const u = s - s3;
    const angle = u / safeR;
    return [w - safeR + safeR * Math.cos(angle), h - safeR + safeR * Math.sin(angle)];
  } else if (s <= s5) {
    const u = s - s4;
    return [w - safeR - u, h];
  } else if (s <= s6) {
    const u = s - s5;
    const angle = Math.PI / 2 + u / safeR;
    return [safeR + safeR * Math.cos(angle), h - safeR + safeR * Math.sin(angle)];
  } else if (s <= s7) {
    const u = s - s6;
    return [0, h - safeR - u];
  } else if (s <= s8) {
    const u = s - s7;
    const angle = Math.PI + u / safeR;
    return [safeR + safeR * Math.cos(angle), safeR + safeR * Math.sin(angle)];
  } else {
    const u = s - s8;
    return [safeR + u, 0];
  }
}

/** Builds an SVG path string for a light window centered at sCenter with length segLen along the perimeter. */
function buildArcSubpath(
  w: number,
  h: number,
  safeR: number,
  totalLen: number,
  sCenter: number,
  segLen: number
): string {
  const half = segLen / 2;
  const sStart = (sCenter - half + totalLen) % totalLen;
  const sEnd = (sCenter + half) % totalLen;
  const N = 24;

  if (sStart < sEnd) {
    const pts: string[] = [];
    for (let i = 0; i <= N; i++) {
      const s = sStart + (i / N) * (sEnd - sStart);
      const [x, y] = getPerimeterPoint(w, h, safeR, s);
      pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(" ");
  } else {
    // Crossing top-center boundary (s=0 / totalLen): Piece 1 ends at (midX, 0) and Piece 2 seamlessly continues from (midX, 0)
    const pts: string[] = [];
    const n1 = Math.max(1, Math.round(N * ((totalLen - sStart) / segLen)));
    const n2 = Math.max(1, N - n1);

    for (let i = 0; i <= n1; i++) {
      const s = sStart + (i / n1) * (totalLen - sStart);
      const [x, y] = getPerimeterPoint(w, h, safeR, Math.min(s, totalLen));
      pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    for (let i = 1; i <= n2; i++) {
      const s = (i / n2) * sEnd;
      const [x, y] = getPerimeterPoint(w, h, safeR, s);
      pts.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(" ");
  }
}

export function LoginExperience({ brandMark, brandName, tagline, children }: LoginExperienceProps) {
  const [phase, setPhase] = useState<RevealPhase>("dark");
  const [staggerCount, setStaggerCount] = useState(0);
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameDims, setFrameDims] = useState({ w: 416, h: 480, r: 16 });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

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

  const maskWarmRef = useRef<SVGPathElement>(null);
  const maskTealRef = useRef<SVGPathElement>(null);
  const frameDimsRef = useRef(frameDims);
  useEffect(() => {
    frameDimsRef.current = frameDims;
  }, [frameDims]);

  useEffect(() => {
    if (!isSurfaceVisible) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let rafId: number;
    const startTime = performance.now();
    const DURATION = 8000; // 8s per full loop

    const tick = (now: number) => {
      const { w, h, r } = frameDimsRef.current;
      const safeR = Math.max(1, Math.min(r, w / 2, h / 2));
      const totalLen = 2 * (w - 2 * safeR) + 2 * (h - 2 * safeR) + 2 * Math.PI * safeR;
      const segLen = 0.18 * totalLen;

      const elapsed = (now - startTime) % DURATION;
      const sBase = (elapsed / DURATION) * totalLen;

      // 4 lights at 0°, 90°, 180°, 270° (clockwise)
      const sWarmA = sBase;
      const sTealA = (sBase + 0.25 * totalLen) % totalLen;
      const sWarmB = (sBase + 0.50 * totalLen) % totalLen;
      const sTealB = (sBase + 0.75 * totalLen) % totalLen;

      const dWarm =
        buildArcSubpath(w, h, safeR, totalLen, sWarmA, segLen) +
        " " +
        buildArcSubpath(w, h, safeR, totalLen, sWarmB, segLen);
      const dTeal =
        buildArcSubpath(w, h, safeR, totalLen, sTealA, segLen) +
        " " +
        buildArcSubpath(w, h, safeR, totalLen, sTealB, segLen);

      if (maskWarmRef.current) maskWarmRef.current.setAttribute("d", dWarm);
      if (maskTealRef.current) maskTealRef.current.setAttribute("d", dTeal);

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isSurfaceVisible]);

  const borderPath = buildBorderPath(frameDims.w, frameDims.h, frameDims.r);

  return (
    <div className={styles.viewport}>
      {/* Top-right action: Back to Landing Page */}
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
        <span>Kembali ke Landing Page</span>
      </Link>

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

      {/* Login card — born from the light, the visual destination.
          In the sleeping state (phase === "dark"), the card is in the DOM but
          invisible and non-interactive. aria-hidden removes it from the
          accessibility tree. pointer-events:none prevents accidental clicks.
          This avoids layout shift when the card is later revealed. */}
      <div
        ref={frameRef}
        className={[styles.cardFrame, isFrameTraced ? styles.cardFrameRevealed : ""].filter(Boolean).join(" ")}
        aria-hidden={phase === "dark"}
        style={phase === "dark" ? { pointerEvents: "none" } : undefined}
      >
        <svg className={styles.borderTrace} viewBox={`0 0 ${frameDims.w} ${frameDims.h}`} preserveAspectRatio="none" overflow="visible" aria-hidden="true">
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
          {/* Perimeter traveling lights — SVG Mask + arc-length RAF positioning */}
          <defs>
            <mask id="plm-mask-warm" maskUnits="userSpaceOnUse" x="0" y="0" width={frameDims.w} height={frameDims.h}>
              <rect x="0" y="0" width={frameDims.w} height={frameDims.h} fill="black" />
              <path ref={maskWarmRef} fill="none" stroke="white" strokeWidth={28} strokeLinecap="round" />
            </mask>
            <mask id="plm-mask-teal" maskUnits="userSpaceOnUse" x="0" y="0" width={frameDims.w} height={frameDims.h}>
              <rect x="0" y="0" width={frameDims.w} height={frameDims.h} fill="black" />
              <path ref={maskTealRef} fill="none" stroke="white" strokeWidth={28} strokeLinecap="round" />
            </mask>
          </defs>
          <path
            d={borderPath}
            fill="none"
            stroke="rgba(255, 251, 235, 0.85)"
            strokeWidth={3}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            mask="url(#plm-mask-warm)"
            className={[styles.perimeterLightPath, styles.perimeterGlowWarm, isSurfaceVisible ? styles.perimeterLightPathOn : ""].filter(Boolean).join(" ")}
          />
          <path
            d={borderPath}
            fill="none"
            stroke="rgba(45, 212, 191, 0.75)"
            strokeWidth={3}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            mask="url(#plm-mask-teal)"
            className={[styles.perimeterLightPath, styles.perimeterGlowTeal, isSurfaceVisible ? styles.perimeterLightPathOn : ""].filter(Boolean).join(" ")}
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
