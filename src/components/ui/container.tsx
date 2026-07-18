import type { HTMLAttributes } from "react";

import styles from "./ui.module.css";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "application" | "landing";
}

export function Container({
  size = "application",
  className,
  ...props
}: ContainerProps) {
  const sizeClass =
    size === "landing" ? styles.containerLanding : styles.containerApplication;

  return (
    <div
      className={[styles.container, sizeClass, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
