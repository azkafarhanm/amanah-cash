export const THEME_PREFERENCES = ["LIGHT", "DARK", "SYSTEM", "TIME"] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];
export type ResolvedTheme = "light" | "dark";

export const DEFAULT_THEME_PREFERENCE: ThemePreference = "SYSTEM";
export const THEME_STORAGE_KEY = "amanah-cash-theme";
export const THEME_CHANGE_EVENT = "amanah-cash:theme-change";

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === "string" && THEME_PREFERENCES.includes(value as ThemePreference);
}

export function resolveTimeTheme(hour: number): ResolvedTheme {
  return hour >= 6 && hour < 18 ? "light" : "dark";
}

export function resolveTheme(
  preference: ThemePreference,
  prefersDark: boolean,
  date = new Date()
): ResolvedTheme {
  if (preference === "LIGHT") return "light";
  if (preference === "DARK") return "dark";
  if (preference === "TIME") return resolveTimeTheme(date.getHours());
  return prefersDark ? "dark" : "light";
}

export function millisecondsUntilNextTimeBoundary(date = new Date()): number {
  const next = new Date(date);
  const hour = date.getHours();

  if (hour < 6) {
    next.setHours(6, 0, 0, 0);
  } else if (hour < 18) {
    next.setHours(18, 0, 0, 0);
  } else {
    next.setDate(next.getDate() + 1);
    next.setHours(6, 0, 0, 0);
  }

  return Math.max(1, next.getTime() - date.getTime());
}

export function applyThemeToDocument(preference: ThemePreference): void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const resolved = resolveTheme(preference, media.matches);
  const root = document.documentElement;
  root.classList.add("theme-changing");
  root.dataset.themePreference = preference.toLowerCase();
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => root.classList.remove("theme-changing"));
  });
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // The persisted server preference remains authoritative when storage is unavailable.
  }
}
