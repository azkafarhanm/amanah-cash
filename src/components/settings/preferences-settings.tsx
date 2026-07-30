"use client";

import { useId, useRef, useState } from "react";
import { updateDefaultPageSize } from "@/settings/actions";
import {
  PAGE_SIZE_OPTIONS,
  type PageSizePreference
} from "@/settings/preferences";
import styles from "./theme-settings.module.css";

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
        <h2 id={headingId}>Preferensi</h2>
        <p>Atur perilaku default untuk pekerjaan sehari-hari.</p>
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
