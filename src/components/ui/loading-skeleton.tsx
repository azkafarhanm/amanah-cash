import type { HTMLAttributes } from "react";
import styles from "./ui.module.css";

export type LoadingSkeletonVariant = "text" | "table" | "cards";
export type LoadingSkeletonProps = HTMLAttributes<HTMLDivElement> & {
  lines?: number;
  variant?: LoadingSkeletonVariant;
};

export function LoadingSkeleton({ lines = 3, variant = "text", className, ...props }: LoadingSkeletonProps) {
  return (
    <div
      className={[
        styles.loadingSkeleton,
        styles[`loadingSkeleton${variant[0].toUpperCase()}${variant.slice(1)}`],
        className
      ].filter(Boolean).join(" ")}
      aria-label="Memuat konten"
      role="status"
      {...props}
    >
      {Array.from({ length: lines }, (_, index) => <span key={index} />)}
    </div>
  );
}
