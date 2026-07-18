import type { HTMLAttributes } from "react";

import styles from "./ui.module.css";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  spacing?: "none" | "landing";
  surface?: "canvas" | "surface" | "subtle";
}

const surfaceClasses = {
  canvas: styles.sectionCanvas,
  surface: styles.sectionSurface,
  subtle: styles.sectionSubtle,
} as const;

export function Section({
  spacing = "none",
  surface = "surface",
  className,
  ...props
}: SectionProps) {
  return (
    <section
      className={[
        styles.section,
        surfaceClasses[surface],
        spacing === "landing" && styles.sectionLanding,
        spacing === "landing" &&
          "tablet:py-[var(--landing-section-padding-tablet)] desktop:py-[var(--landing-section-padding-desktop)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
