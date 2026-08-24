"use client";

import { useEffect, useRef, type ReactNode } from "react";

import styles from "./landing-content.module.css";

/**
 * Scroll reveal — one-shot and PERSISTENT.
 *
 * A section plays its entrance reveal the first time it enters the viewport
 * and stays revealed for the lifetime of the page: scrolling it back out of
 * view can never re-hide it, and the entrance animation never re-triggers.
 *
 * Performance notes:
 * - Every Reveal instance shares ONE IntersectionObserver, so a fast fling
 *   batches all threshold crossings into a single observer callback instead
 *   of waking one observer per section.
 * - Each node is unobserved the moment it is revealed, so after the first
 *   pass the observer tracks nothing and scroll work drops to zero.
 * - Revealing writes the `data-revealed` attribute imperatively — the CSS is
 *   attribute-driven, so this costs one DOM attribute write and zero React
 *   re-renders during scrolling.
 */

const REVEAL_OBSERVER_OPTIONS: IntersectionObserverInit = {
  rootMargin: "0px 0px -10% 0px",
  threshold: 0.1,
};

let sharedObserver: IntersectionObserver | null = null;
let sharedObserverRefs = 0;

function getSharedRevealObserver(): IntersectionObserver {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        // One-shot: stop watching immediately. Leaving the viewport after
        // this point must never re-hide or re-animate the section.
        observer.unobserve(entry.target);
        (entry.target as HTMLElement).dataset.revealed = "true";
      }
    }, REVEAL_OBSERVER_OPTIONS);
  }
  return sharedObserver;
}

export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!("IntersectionObserver" in window)) return;
    // Already revealed (e.g. StrictMode remount): keep it revealed forever.
    if (node.dataset.revealed === "true") return;

    node.dataset.enhanced = "true";
    const observer = getSharedRevealObserver();
    sharedObserverRefs += 1;
    observer.observe(node);

    return () => {
      sharedObserverRefs -= 1;
      observer.unobserve(node);
      if (sharedObserverRefs === 0 && sharedObserver) {
        sharedObserver.disconnect();
        sharedObserver = null;
      }
    };
  }, []);

  return <div className={styles.reveal} ref={ref}>{children}</div>;
}
