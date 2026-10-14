import type { ButtonHTMLAttributes, ReactNode } from "react";

import styles from "./ui.module.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingLabel?: string;
  variant?: "primary" | "secondary" | "danger";
  children: ReactNode;
}

const variantClasses = {
  primary: styles.buttonPrimary,
  secondary: styles.buttonSecondary,
  danger: styles.buttonDanger
} as const;

export function Button({
  isLoading = false,
  loadingLabel,
  variant = "primary",
  disabled,
  className,
  children,
  type = "button",
  "aria-label": ariaLabel,
  ...props
}: ButtonProps) {
  const variantClass = variantClasses[variant];

  return (
    <button
      type={type}
      className={[styles.button, variantClass, className]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      aria-label={isLoading && loadingLabel ? loadingLabel : ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
}
