"use client";

import { useId, useRef, useState } from "react";
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
                  aria-describedby={`${id}-status`}
                  onChange={() => void selectTheme(option.value)}
                />
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
