"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";
import {
  readScrollPositions,
  saveScrollPosition,
  scrollPositionKey
} from "./scroll-position";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function readStorage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function ScrollRestoration() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const locationKey = scrollPositionKey(pathname, search ? `?${search}` : "");

  useIsomorphicLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    const storage = readStorage();
    const key = locationKey;

    let frame = 0;
    const persist = () => {
      if (!storage) return;
      saveScrollPosition(storage, key, { x: window.scrollX, y: window.scrollY });
    };
    const schedulePersist = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        persist();
      });
    };
    const restore = () => {
      if (!storage) return;
      const position = readScrollPositions(storage)[locationKey];
      if (!position) return;

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          window.scrollTo({ left: position.x, top: position.y, behavior: "auto" });
        });
      });
    };
    const persistBeforeNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      const target = event.target instanceof Element
        ? event.target.closest("a") as HTMLAnchorElement | null
        : null;
      if (!target || target.target === "_blank" || target.hasAttribute("download")) return;

      try {
        const destination = new URL(target.href, window.location.href);
        if (destination.origin === window.location.origin) persist();
      } catch {
        // Invalid or browser-internal anchors do not affect restoration.
      }
    };

    window.addEventListener("scroll", schedulePersist, { passive: true });
    window.addEventListener("pagehide", persist);
    document.addEventListener("click", persistBeforeNavigation, true);
    restore();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedulePersist);
      window.removeEventListener("pagehide", persist);
      document.removeEventListener("click", persistBeforeNavigation, true);
    };
  }, [locationKey]);

  return null;
}
