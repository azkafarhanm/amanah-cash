"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Refetches the page after a browser back or forward navigation.
 *
 * Next deliberately serves its own cache for back/forward — the staleTimes
 * reference notes it "doesn't change back/forward caching behavior", so that
 * scroll position and layout survive. On a page whose whole job is to show a
 * current figure, that trade is wrong: stepping back to a dashboard would
 * redisplay the total from before the deposit that was just recorded.
 *
 * Removing prefetch={true} from the sidebar (see app-shell.tsx) fixed forward
 * navigation. This covers the other direction.
 *
 * Calling refresh() straight from the popstate handler is safe, and that is
 * worth stating because the opposite seems likelier: Next settles the new
 * route *before* the DOM event reaches listeners. Logging both during a back
 * navigation shows the order plainly —
 *
 *     route effect: pathname = /admin      <- router already updated
 *     popstate:     location = /admin      <- handler runs after
 *
 * so by the time this runs, refresh() acts on the route being entered, not the
 * one being left. An earlier version of this file tried to be careful about
 * that ordering by deferring the refresh until the next route change; it never
 * fired at all, because the route change had already happened.
 */
export function HistoryNavigationRefresh() {
  const router = useRouter();

  useEffect(() => {
    const refetchAfterHistoryNavigation = () => router.refresh();
    window.addEventListener("popstate", refetchAfterHistoryNavigation);
    return () => window.removeEventListener("popstate", refetchAfterHistoryNavigation);
  }, [router]);

  return null;
}
