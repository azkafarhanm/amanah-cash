import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./ui.module.css";

export type BackButtonProps = {
  href: string;
  children?: ReactNode;
  className?: string;
};

export function BackButton({ href, children = "Kembali", className }: BackButtonProps) {
  const combinedClassName = className ? `${styles.backButton} ${className}` : styles.backButton;

  return (
    <Link href={href} className={combinedClassName}>
      <svg
        className={styles.backArrow}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>{children}</span>
    </Link>
  );
}
