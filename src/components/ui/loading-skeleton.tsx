import type { HTMLAttributes } from "react";
import styles from "./ui.module.css";

export type LoadingSkeletonProps = HTMLAttributes<HTMLDivElement> & { lines?: number };

export function LoadingSkeleton({ lines = 3, className, ...props }: LoadingSkeletonProps) {
  return (
    <div
      className={[styles.loadingSkeleton, className].filter(Boolean).join(" ")}
      aria-label="Memuat konten"
      role="status"
      {...props}
    >
      {Array.from({ length: lines }, (_, index) => <span key={index} />)}
    </div>
  );
}
