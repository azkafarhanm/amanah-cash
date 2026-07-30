import type { ThemePreference } from "@/settings/theme";

export function ThemeBootstrapScript({ preference }: { preference: ThemePreference }) {
  const script = `
(() => {
  const preference = ${JSON.stringify(preference)};
  const dark = preference === "DARK"
    || (preference === "SYSTEM" && matchMedia("(prefers-color-scheme: dark)").matches);
  const theme = dark ? "dark" : "light";
  document.documentElement.dataset.themePreference = preference.toLowerCase();
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  try {
    localStorage.setItem("amanah-cash-theme", preference);
  } catch {}
})();
`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
