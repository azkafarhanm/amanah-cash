"use client";

import styles from "./avatar.module.css";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "studentList" | "studentDashboard" | "studentDetail";

type AvatarAccessibility =
  | { decorative?: true; alt?: never }
  | { decorative: false; alt: string };

export type AvatarProps = AvatarAccessibility & {
  name?: string | null;
  photo?: string | null;
  size?: AvatarSize;
  loading?: "eager" | "lazy";
  className?: string;
  fallback?: { initials?: string; background?: string };
};

const SIZE_PIXELS: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  studentList: 56,
  studentDashboard: 64,
  studentDetail: 72
};

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "?";
}

function fallbackBackground(name: string): string {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 160) + 160;
  return `linear-gradient(135deg, hsl(${hue}, 55%, 45%), hsl(${hue + 25}, 60%, 35%))`;
}

const loadedPhotosCache = new Set<string>();
const failedPhotosCache = new Set<string>();

export function Avatar({
  name,
  photo,
  size = "md",
  loading = "lazy",
  decorative = true,
  alt,
  className,
  fallback
}: AvatarProps) {
  const fallbackName = name?.trim() || "";
  const pixels = SIZE_PIXELS[size];

  return (
    <span
      className={`${styles.avatar} ${styles[size]}${className ? ` ${className}` : ""}`}
      aria-hidden={decorative ? "true" : undefined}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : alt}
    >
      <span
        className={styles.fallback}
        style={{ background: fallback?.background ?? fallbackBackground(fallbackName) }}
        aria-hidden="true"
      >
        <span className={styles.initials}>{fallback?.initials ?? initialsFor(fallbackName)}</span>
      </span>
      {photo && !failedPhotosCache.has(photo) ? (
        // Google profile images are already-sized identity metadata. A native image
        // preserves the initials beneath it and avoids requesting anything when absent.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={photo}
          className={styles.photo}
          src={photo}
          alt=""
          aria-hidden="true"
          width={pixels}
          height={pixels}
          loading={loading}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => {
            if (photo) loadedPhotosCache.add(photo);
          }}
          onError={(event) => {
            if (photo) failedPhotosCache.add(photo);
            event.currentTarget.hidden = true;
          }}
        />
      ) : null}
    </span>
  );
}
