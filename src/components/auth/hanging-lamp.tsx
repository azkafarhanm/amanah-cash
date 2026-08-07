"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { authAudio } from "@/lib/auth-audio";
import { triggerHapticIgnition, triggerHapticPull } from "@/lib/haptics";
import styles from "./hanging-lamp.module.css";

const ACTIVATION_THRESHOLD = 30;
/* A compact ceiling-mounted fixture — the lamp is decorative, not a layout block.
   Short rod keeps the pendant close to the ceiling so the brand + card fit
   comfortably in a single viewport without reserving excessive vertical space.
   Cord is long enough to exit the shade's open mouth so the knob hangs below. */
const ROD_BASE_HEIGHT = 40;
const PULL_CORD_BASE_LENGTH = 56;
const PULL_CORD_TRAVEL = 56;

export type LampPhase = "dark" | "igniting" | "illuminated";

type HangingLampProps = {
  onPhaseChange?: (phase: LampPhase) => void;
  /** When true the fixture fades to a quieter visual weight so the brand and card dominate. */
  quiet?: boolean;
};

export function HangingLamp({ onPhaseChange, quiet }: HangingLampProps) {
  const [phase, setPhase] = useState<LampPhase>("dark");
  const [isFlashing, setIsFlashing] = useState(false);
  const [pullOffset, setPullOffset] = useState(0);
  const [isSpringing, setIsSpringing] = useState(false);
  const [swingKey, setSwingKey] = useState(0);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const phaseAtDragStart = useRef<LampPhase>("dark");

  const activate = useCallback(() => {
    if (phase !== "dark") return;
    triggerHapticPull();
    authAudio.play("switchClick");
    setIsFlashing(true);
    setPhase("igniting");
    setTimeout(() => {
      triggerHapticIgnition();
      authAudio.play("lampIgnition");
      setPhase("illuminated");
      onPhaseChange?.("illuminated");
    }, 380);
    setTimeout(() => setIsFlashing(false), 460);
  }, [phase, onPhaseChange]);

  const deactivate = useCallback(() => {
    if (phase !== "illuminated") return;
    triggerHapticPull();
    authAudio.play("switchClick");
    setPhase("dark");
    onPhaseChange?.("dark");
  }, [phase, onPhaseChange]);

  const toggle = useCallback(() => {
    if (phase === "dark") activate();
    else if (phase === "illuminated") deactivate();
  }, [phase, activate, deactivate]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (phase !== "dark" && phase !== "illuminated") return;
      isDragging.current = true;
      phaseAtDragStart.current = phase;
      dragStartY.current = e.clientY;
      setIsSpringing(false);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      e.preventDefault();
    },
    [phase]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = Math.max(0, e.clientY - dragStartY.current);
    setPullOffset(Math.min(delta, PULL_CORD_TRAVEL));
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (pullOffset >= ACTIVATION_THRESHOLD) toggle();
    // Spring physics: cord springs back with slight overshoot + lamp swings
    setIsSpringing(true);
    setPullOffset(0);
    setSwingKey((k) => k + 1);
    setTimeout(() => setIsSpringing(false), 700);
  }, [pullOffset, toggle]);

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase, onPhaseChange]);

  const isOn = phase === "illuminated" || phase === "igniting";
  const cordStretch = pullOffset * 0.4;

  return (
    <div className={[styles.lampContainer, quiet ? styles.lampQuiet : ""].filter(Boolean).join(" ")}>
      {/* Lamp fixture — swings slightly after cord release */}
      <div key={swingKey} className={[styles.lampFixture, isSpringing ? styles.lampSwinging : ""].filter(Boolean).join(" ")}>
        <div className={styles.ceilingMount} />
        {/* Metal rod from ceiling — the lamp hangs from this, not a thin cord */}
        <div className={styles.lampRod} style={{ height: `${ROD_BASE_HEIGHT + cordStretch}px` }} />

        <div className={[styles.lampShade, isOn ? styles.lampShadeOn : ""].filter(Boolean).join(" ")}>
          <div className={styles.lampShadeSheen} />
          <div className={styles.lampShadeLip} />
          <div className={[styles.lampBulb, isOn ? styles.lampBulbOn : ""].filter(Boolean).join(" ")} />
          <div className={[styles.ignitionFlash, isFlashing ? styles.ignitionFlashActive : ""].filter(Boolean).join(" ")} />
        </div>

        {/*
          Pull cord — emerges from INSIDE the shade's open bottom mouth,
          centered (through the bulb area), then drops to the knob. The string's
          top is occluded by the shade lip so it reads as coming THROUGH the
          lamp, not hanging beside or in front of it.
        */}
        <div
          role="button"
          tabIndex={0}
          aria-label={isOn ? "Tarik untuk mematikan lampu" : "Tarik untuk menyalakan lampu"}
          aria-pressed={isOn}
          className={[styles.pullCordGroup, isSpringing ? styles.pullCordSpringing : ""].filter(Boolean).join(" ")}
          style={{
            top: `${ROD_BASE_HEIGHT + 88}px`,
            transform: `translateX(-50%) translateY(${pullOffset}px)`,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggle();
            }
          }}
        >
          {/* Cord exits through the shade center, then drops to the knob */}
          <div className={styles.pullString} style={{ height: `${PULL_CORD_BASE_LENGTH + pullOffset * 0.25}px` }} />
          <div className={styles.pullKnob} />
        </div>
      </div>

      {/*
        Volumetric light cone — the card lives INSIDE this light (R2).
        Wide base extending beyond the card's left/right edges, feathered
        falloff, warm-white dominant with a subtle teal edge. The bulb is the
        only thing allowed to bloom (R7).
      */}
      <div
        className={[styles.lightCone, isOn ? styles.lightConeActive : ""].filter(Boolean).join(" ")}
        style={{ top: `${ROD_BASE_HEIGHT + 114}px` }}
      >
        <div className={styles.lightCore} />
        <div className={styles.lightBloom} />
        <div className={styles.lightConeInner} />
        <div className={styles.lightConeOuter} />
      </div>

      {/* Screen-reader announcement of the lit/unlit state (§16) — gives the
          "room waking up" a non-visual equivalent. Visually hidden, polite. */}
      <span
        aria-live="polite"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {phase === "illuminated" ? "Lampu menyala" : phase === "dark" ? "Lampu padam" : ""}
      </span>
    </div>
  );
}
