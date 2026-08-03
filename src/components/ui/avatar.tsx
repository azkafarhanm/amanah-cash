"use client";

import styles from "./avatar.module.css";

export type AvatarSize = "xs" | "sm" | "md" | "lg";

type AvatarAccessibility =
  | { decorative?: true; alt?: never }
  | { decorative: false; alt: string };

export type AvatarProps = AvatarAccessibility & {
  name?: string | null;
  photo?: string | null;
  size?: AvatarSize;
  loading?: "eager" | "lazy";
};

const SIZE_PIXELS: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48
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

export function Avatar({
  name,
  photo,
  size = "md",
  loading = "lazy",
  decorative = true,
  alt
}: AvatarProps) {
  const fallbackName = name?.trim() || "";
  const pixels = SIZE_PIXELS[size];

  return (
    <span
      className={`${styles.avatar} ${styles[size]}`}
      style={{ background: fallbackBackground(fallbackName) }}
      aria-hidden={decorative ? "true" : undefined}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : alt}
    >
      <span className={styles.initials}>{initialsFor(fallbackName)}</span>
      {photo ? (
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
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      ) : null}
    </span>
  );
}
