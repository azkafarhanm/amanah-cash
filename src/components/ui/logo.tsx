import type { HTMLAttributes } from "react";

import styles from "./ui.module.css";

export type LogoProps = Omit<HTMLAttributes<HTMLSpanElement>, "children">;

export function Logo({ className, ...props }: LogoProps) {
  return (
    <span
      className={[styles.logo, className].filter(Boolean).join(" ")}
      {...props}
    >
      Amanah Cash
    </span>
  );
}
