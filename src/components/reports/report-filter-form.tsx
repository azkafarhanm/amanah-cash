"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "./reports.module.css";

export function ReportFilterForm({
  children,
  ariaLabel,
  basePath,
  hasActiveFilters,
  initialPeriod,
  initialDateFrom,
  initialDateTo,
  initialKind,
  description
}: {
  children: ReactNode;
  ariaLabel: string;
  basePath: string;
  hasActiveFilters: boolean;
  initialPeriod: string;
  initialDateFrom?: string;
  initialDateTo?: string;
  initialKind?: string;
  description: string;
}) {
  const router = useRouter();
  const [period, setPeriod] = useState(initialPeriod);
  const [kind, setKind] = useState(initialKind);
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();
  const form = useRef<HTMLFormElement>(null);
  const fields = useRef<HTMLFieldSetElement>(null);
  const descriptionId = `${ariaLabel.toLowerCase().replaceAll(" ", "-")}-description`;

  useEffect(() => {
    const action = fields.current?.querySelector<HTMLSelectElement>('select[name="action"]');
    if (action) action.disabled = kind !== "OPERATOR_ACTIVITY" || pending;
  }, [kind, pending]);

  function navigate(href: string) {
    startTransition(() => router.push(href));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    const formData = new FormData(event.currentTarget);
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value) params.set(key, value);
    }
    params.delete("page");
    if (period !== "CUSTOM") {
      params.delete("dateFrom");
      params.delete("dateTo");
    }
    const query = params.toString();
    navigate(query ? `${basePath}?${query}` : basePath);
  }

  return <form
    ref={form}
    className={styles.filters}
    method="get"
    aria-label={ariaLabel}
    aria-describedby={descriptionId}
    aria-busy={pending}
    onSubmit={submit}
    onChange={(event) => {
      const target = event.target;
      if (target instanceof HTMLSelectElement && target.name === "period") setPeriod(target.value);
      if (target instanceof HTMLSelectElement && target.name === "kind") setKind(target.value);
      setDirty(true);
    }}
  >
    <p id={descriptionId} className={styles.filterDescription}>{description}</p>
    <fieldset ref={fields} className={styles.filterFields} disabled={pending}>
      <legend className={styles.visuallyHidden}>Pilihan filter</legend>
      {children}
      <label className={styles.field}>Dari tanggal
        <input type="date" name="dateFrom" defaultValue={initialDateFrom} disabled={period !== "CUSTOM" || pending} />
      </label>
      <label className={styles.field}>Sampai tanggal
        <input type="date" name="dateTo" defaultValue={initialDateTo} disabled={period !== "CUSTOM" || pending} />
      </label>
    </fieldset>
    <div className={styles.filterActions}>
      <button type="submit" disabled={pending} aria-busy={pending}>{pending ? "Menerapkan…" : "Terapkan filter"}</button>
      <button type="button" className={styles.resetButton} disabled={(!hasActiveFilters && !dirty) || pending} onClick={() => {
        form.current?.reset();
        setPeriod("MONTH");
        setKind(initialKind ? "OPERATOR_ACTIVITY" : undefined);
        setDirty(false);
        if (hasActiveFilters) navigate(basePath);
      }}>Reset filter</button>
    </div>
    {pending ? <p className={styles.visuallyHidden} role="status" aria-live="polite">Memuat hasil laporan yang diperbarui.</p> : null}
  </form>;
}
