"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import {
  THEME_CHANGE_EVENT,
  applyThemeToDocument,
  type ThemePreference,
} from "@/settings/theme";

import styles from "./landing-theme-toggle.module.css";

const options = [
  { value: "LIGHT" as ThemePreference, icon: Sun, label: "Terang" },
  { value: "DARK" as ThemePreference, icon: Moon, label: "Gelap" },
  { value: "SYSTEM" as ThemePreference, icon: Monitor, label: "Otomatis" },
];

function readStoredTheme(): ThemePreference {
  if (typeof window === "undefined") return "DARK";
  try {
    const stored = window.localStorage.getItem("amanah-cash-theme");
    if (stored === "LIGHT" || stored === "DARK" || stored === "SYSTEM") {
      return stored;
    }
  } catch {}
  return "DARK";
}

function subscribeToTheme(onStoreChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
}

export function LandingThemeToggle() {
  // The server snapshot makes the hydration render deterministic; the stored
  // browser preference is read immediately after hydration.
  const active = useSyncExternalStore(
    subscribeToTheme,
    readStoredTheme,
    () => "DARK"
  );

  const handleToggle = useCallback((theme: ThemePreference) => {
    applyThemeToDocument(theme);
    window.dispatchEvent(
      new CustomEvent(THEME_CHANGE_EVENT, { detail: theme })
    );
  }, []);

  return (
    <div
      className={styles.toggleGroup}
      role="radiogroup"
      aria-label="Pilih tema tampilan"
    >
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          aria-checked={active === value}
          aria-label={label}
          className={styles.toggleButton}
          data-active={active === value || undefined}
          role="radio"
          type="button"
          onClick={() => handleToggle(value)}
        >
          <Icon aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
