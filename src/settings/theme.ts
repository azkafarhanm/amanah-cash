export const THEME_PREFERENCES = ["LIGHT", "DARK", "SYSTEM"] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];
export type ResolvedTheme = "light" | "dark";

export const DEFAULT_THEME_PREFERENCE: ThemePreference = "DARK";
export const THEME_STORAGE_KEY = "amanah-cash-theme";
export const THEME_CHANGE_EVENT = "amanah-cash:theme-change";

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === "string" && THEME_PREFERENCES.includes(value as ThemePreference);
}

export function resolveTheme(
  preference: ThemePreference,
  prefersDark: boolean
): ResolvedTheme {
  if (preference === "LIGHT") return "light";
  if (preference === "DARK") return "dark";
  return prefersDark ? "dark" : "light";
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
