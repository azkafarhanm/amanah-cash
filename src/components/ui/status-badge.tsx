import type { HTMLAttributes } from "react";
import styles from "./ui.module.css";

export type StatusBadgeTone = "neutral" | "success" | "warning" | "danger";
export type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: StatusBadgeTone };

export function StatusBadge({ tone = "neutral", className, ...props }: StatusBadgeProps) {
  return (
    <span
      className={[styles.statusBadge, styles[`statusBadge${tone[0].toUpperCase()}${tone.slice(1)}`], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
