"use client";

import { useId, useRef, useState } from "react";
import { updateThemePreference } from "@/settings/actions";
import {
  applyThemeToDocument,
  THEME_CHANGE_EVENT,
  type ThemePreference
} from "@/settings/theme";
import styles from "./theme-settings.module.css";

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <path d="M12 17v4M8 21h8" />
    </svg>
  );
}

const OPTIONS: ReadonlyArray<{
  value: ThemePreference;
  label: string;
  description: string;
  icon: () => React.ReactElement;
}> = [
  { value: "LIGHT", label: "Light", description: "Selalu gunakan tema terang.", icon: SunIcon },
  { value: "DARK", label: "Dark", description: "Selalu gunakan tema gelap.", icon: MoonIcon },
  {
    value: "SYSTEM",
    label: "System",
    description: "Ikuti pengaturan tampilan perangkat.",
    icon: MonitorIcon
  },
];

function announceTheme(theme: ThemePreference) {
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: theme }));
  applyThemeToDocument(theme);
}

export function ThemeSettings({ initialTheme }: { initialTheme: ThemePreference }) {
  const legendId = useId();
  const requestId = useRef(0);
  const saveChain = useRef(Promise.resolve());
  const committed = useRef(initialTheme);
  const [selected, setSelected] = useState(initialTheme);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();

  async function selectTheme(theme: ThemePreference) {
    if (theme === selected) return;

    const currentRequest = ++requestId.current;
    const previous = committed.current;
    setSelected(theme);
    setSaving(false);
    setMessage(undefined);
    setError(undefined);
    announceTheme(theme);

    const savingTimer = window.setTimeout(() => {
      if (currentRequest === requestId.current) setSaving(true);
    }, 100);
    let result: Awaited<ReturnType<typeof updateThemePreference>> | undefined;
    saveChain.current = saveChain.current.then(async () => {
      result = await updateThemePreference(theme);
    });
    await saveChain.current;
    window.clearTimeout(savingTimer);
    if (currentRequest !== requestId.current) return;
    setSaving(false);

    if (!result) return;
    if (result.status === "error") {
      setSelected(previous);
      announceTheme(previous);
      setError(result.message);
      return;
    }

    const savedTheme = result.theme;
    committed.current = savedTheme;
    setSelected(savedTheme);
    setMessage(`Tema ${OPTIONS.find((option) => option.value === savedTheme)?.label} disimpan.`);
  }

  return (
    <section className={styles.section} aria-labelledby={legendId}>
      <header className={styles.header}>
        <div>
          <h2 id={legendId}>Tampilan</h2>
          <p>Pilih tampilan yang nyaman untuk pekerjaan keuangan sehari-hari.</p>
        </div>
      </header>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Tema</legend>
        <div className={styles.options}>
          {OPTIONS.map((option) => {
            const id = `${legendId}-${option.value.toLowerCase()}`;
            const Icon = option.icon;
            return (
              <label className={styles.option} key={option.value} htmlFor={id}>
                <div className={styles.symbolHeader}>
                  <span className={styles.symbolBadge}>
                    <Icon />
                  </span>
                  <input
                    id={id}
                    type="radio"
                    name="theme"
                    value={option.value}
                    checked={selected === option.value}
                    aria-describedby={`${id}-status`}
                    onChange={() => void selectTheme(option.value)}
                  />
                </div>
                <span className={styles.optionCopy}>
                  <span className={styles.optionLabel}>{option.label}</span>
                  <span className={styles.optionDescription}>{option.description}</span>
                </span>
                <span id={`${id}-status`} className={styles.optionStatus}>
                  {saving && selected === option.value ? "Menyimpan…" : ""}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <p
        className={styles.resultStatus}
        data-tone={error ? "error" : message ? "success" : "neutral"}
        role={error ? "alert" : "status"}
        aria-live="polite"
      >
        {error ?? message ?? ""}
      </p>
    </section>
  );
}
