"use client";

import { useCallback, useState } from "react";
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
  if (typeof window === "undefined") return "SYSTEM";
  try {
    const stored = window.localStorage.getItem("amanah-cash-theme");
    if (stored === "LIGHT" || stored === "DARK" || stored === "SYSTEM") {
      return stored;
    }
  } catch {}
  return "SYSTEM";
}

export function LandingThemeToggle() {
  const [active, setActive] = useState<ThemePreference>(readStoredTheme);

  const handleToggle = useCallback((theme: ThemePreference) => {
    setActive(theme);
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
