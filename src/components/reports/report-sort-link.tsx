"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

export function ReportSortLink({
  href,
  ariaLabel,
  children
}: {
  href: string;
  ariaLabel: string;
  children: ReactNode;
}) {
  function preserveViewportOnPointerFocus(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
  }

  return (
    <Link
      aria-label={ariaLabel}
      href={href}
      scroll={false}
      onMouseDown={preserveViewportOnPointerFocus}
    >
      {children}
    </Link>
  );
}
