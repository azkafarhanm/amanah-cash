"use client";

import { useEffect, type ReactNode } from "react";
import {
  applyThemeToDocument,
  millisecondsUntilNextTimeBoundary,
  THEME_CHANGE_EVENT,
  type ThemePreference
} from "@/settings/theme";

export function ThemeProvider({
  preference,
  children
}: {
  preference: ThemePreference;
  children: ReactNode;
}) {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    let activePreference = preference;
    let boundaryTimer: ReturnType<typeof setTimeout> | undefined;

    const scheduleBoundary = () => {
      if (boundaryTimer) clearTimeout(boundaryTimer);
      if (activePreference !== "TIME") return;
      boundaryTimer = setTimeout(() => {
        applyThemeToDocument(activePreference);
        scheduleBoundary();
      }, millisecondsUntilNextTimeBoundary());
    };

    const apply = () => {
      applyThemeToDocument(activePreference);
      scheduleBoundary();
    };
    const handlePreference = (event: Event) => {
      const detail = (event as CustomEvent<ThemePreference>).detail;
      activePreference = detail;
      apply();
    };
    const handleSystemChange = () => {
      if (activePreference === "SYSTEM") apply();
    };

    apply();
    media.addEventListener("change", handleSystemChange);
    window.addEventListener(THEME_CHANGE_EVENT, handlePreference);

    return () => {
      if (boundaryTimer) clearTimeout(boundaryTimer);
      media.removeEventListener("change", handleSystemChange);
      window.removeEventListener(THEME_CHANGE_EVENT, handlePreference);
    };
  }, [preference]);

  return children;
}
