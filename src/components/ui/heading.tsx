import type { HTMLAttributes } from "react";

import styles from "./ui.module.css";

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: "screen" | "section" | "landing-section";
}

const variantClasses = {
  screen: styles.headingScreen,
  section: styles.headingSection,
  "landing-section": styles.headingLandingSection,
} as const;

export function Heading({
  level = 2,
  variant = "section",
  className,
  ...props
}: HeadingProps) {
  const Component = `h${level}` as const;

  return (
    <Component
      className={[styles.heading, variantClasses[variant], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
