"use client";

import { useId, useRef, useState } from "react";
import { updateDefaultPageSize } from "@/settings/actions";
import {
  PAGE_SIZE_OPTIONS,
  type PageSizePreference
} from "@/settings/preferences";
import styles from "./theme-settings.module.css";

function SlidersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" x2="4" y1="21" y2="14" />
      <line x1="4" x2="4" y1="10" y2="3" />
      <line x1="12" x2="12" y1="21" y2="12" />
      <line x1="12" x2="12" y1="8" y2="3" />
      <line x1="20" x2="20" y1="21" y2="16" />
      <line x1="20" x2="20" y1="12" y2="3" />
      <line x1="2" x2="6" y1="14" y2="14" />
      <line x1="10" x2="14" y1="8" y2="8" />
      <line x1="18" x2="22" y1="16" y2="16" />
    </svg>
  );
}

export function PreferencesSettings({
  initialPageSize
}: {
  initialPageSize: PageSizePreference;
}) {
  const headingId = useId();
  const requestId = useRef(0);
  const saveChain = useRef(Promise.resolve());
  const committed = useRef(initialPageSize);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string>();

  async function selectPageSize(value: PageSizePreference) {
    if (value === pageSize) return;

    const currentRequest = ++requestId.current;
    setPageSize(value);
    setStatus("idle");
    setError(undefined);

    const savingTimer = window.setTimeout(() => {
      if (currentRequest === requestId.current) setStatus("saving");
    }, 100);
    let result: Awaited<ReturnType<typeof updateDefaultPageSize>> | undefined;
    saveChain.current = saveChain.current.then(async () => {
      result = await updateDefaultPageSize(value);
    });
    await saveChain.current;
    window.clearTimeout(savingTimer);
    if (currentRequest !== requestId.current) return;

    if (!result) return;
    if (result.status === "error") {
      setPageSize(committed.current);
      setStatus("error");
      setError(result.message);
      return;
    }

    committed.current = result.defaultPageSize;
    setPageSize(result.defaultPageSize);
    setStatus("saved");
  }

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <header className={styles.header}>
        <div className={styles.headerTitleRow}>
          <span className={styles.sectionSymbol}>
            <SlidersIcon />
          </span>
          <div>
            <h2 id={headingId}>Preferensi</h2>
            <p>Atur perilaku default untuk pekerjaan sehari-hari.</p>
          </div>
        </div>
      </header>

      <div className={styles.preferenceRow}>
        <div>
          <label className={styles.legend} htmlFor={`${headingId}-page-size`}>
            Default item per halaman
          </label>
          <p className={styles.help}>
            Digunakan pada daftar yang mendukung paginasi mulai navigasi berikutnya.
          </p>
        </div>
        <div className={styles.selectArea}>
          <select
            id={`${headingId}-page-size`}
            className={styles.select}
            value={pageSize}
            aria-describedby={`${headingId}-page-size-status`}
            onChange={(event) => {
              const value = Number(event.target.value) as PageSizePreference;
              void selectPageSize(value);
            }}
          >
            {PAGE_SIZE_OPTIONS.map((value) => (
              <option value={value} key={value}>{value} item</option>
            ))}
          </select>
          <p
            id={`${headingId}-page-size-status`}
            className={styles.controlStatus}
            role={status === "error" ? "alert" : "status"}
            aria-live="polite"
          >
            {status === "saving" ? "Menyimpan…" : null}
            {status === "saved" ? "Tersimpan" : null}
            {status === "error" ? error : null}
          </p>
        </div>
      </div>
    </section>
  );
}
