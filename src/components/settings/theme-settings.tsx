"use client";

import { useId, useState } from "react";
import { updateThemePreference } from "@/settings/actions";
import {
  applyThemeToDocument,
  THEME_CHANGE_EVENT,
  type ThemePreference
} from "@/settings/theme";
import styles from "./theme-settings.module.css";

const OPTIONS: ReadonlyArray<{
  value: ThemePreference;
  label: string;
  description: string;
}> = [
  { value: "LIGHT", label: "Light", description: "Selalu gunakan tema terang." },
  { value: "DARK", label: "Dark", description: "Selalu gunakan tema gelap." },
  {
    value: "SYSTEM",
    label: "System",
    description: "Ikuti pengaturan tampilan perangkat."
  },
  {
    value: "TIME",
    label: "Time",
    description: "Terang pukul 06.00–17.59, gelap pukul 18.00–05.59."
  }
];

function announceTheme(theme: ThemePreference) {
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: theme }));
  applyThemeToDocument(theme);
}

export function ThemeSettings({ initialTheme }: { initialTheme: ThemePreference }) {
  const legendId = useId();
  const [selected, setSelected] = useState(initialTheme);
  const [committed, setCommitted] = useState(initialTheme);
  const [saving, setSaving] = useState<ThemePreference | null>(null);
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();

  async function selectTheme(theme: ThemePreference) {
    if (theme === selected || saving) return;

    const previous = committed;
    setSelected(theme);
    setSaving(theme);
    setMessage(undefined);
    setError(undefined);
    announceTheme(theme);

    const result = await updateThemePreference(theme);
    setSaving(null);

    if (result.status === "error") {
      setSelected(previous);
      announceTheme(previous);
      setError(result.message);
      return;
    }

    setCommitted(result.theme);
    setSelected(result.theme);
    setMessage(`Tema ${OPTIONS.find((option) => option.value === result.theme)?.label} disimpan.`);
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
            const isSaving = saving === option.value;
            return (
              <label className={styles.option} key={option.value} htmlFor={id}>
                <span className={styles.optionCopy}>
                  <span className={styles.optionLabel}>{option.label}</span>
                  <span className={styles.optionDescription}>{option.description}</span>
                </span>
                <input
                  id={id}
                  type="radio"
                  name="theme"
                  value={option.value}
                  checked={selected === option.value}
                  disabled={saving !== null}
                  aria-describedby={`${id}-status`}
                  onChange={() => void selectTheme(option.value)}
                />
                <span id={`${id}-status`} className={styles.optionStatus}>
                  {isSaving ? "Menyimpan…" : ""}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {message ? <p className={styles.success} role="status" aria-live="polite">{message}</p> : null}
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
    </section>
  );
}
