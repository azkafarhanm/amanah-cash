"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./reports.module.css";

type ExportFormat = {
  format: string;
  label: string;
  href: string;
};

type ExportState =
  | { status: "idle" }
  | { status: "preparing"; attempt: number; format: ExportFormat }
  | { status: "started"; attempt: number; format: ExportFormat }
  | { status: "failed"; attempt: number; format: ExportFormat; message: string };

const formatDescriptions: Record<string, string> = {
  csv: "Data tabular untuk pengolahan lanjutan.",
  xlsx: "Lembar kerja terformat untuk aplikasi spreadsheet.",
  pdf: "Dokumen siap baca dan cetak."
};

function downloadName(response: Response, fallback: ExportFormat) {
  const disposition = response.headers.get("Content-Disposition");
  const encoded = disposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encoded) {
    try {
      return decodeURIComponent(encoded);
    } catch {
      // Fall through to the ordinary filename or safe fallback.
    }
  }
  const ordinary = disposition?.match(/filename="?([^";]+)"?/i)?.[1];
  if (ordinary) return ordinary;
  const extension = fallback.format === "xlsx" ? "xlsx" : fallback.format;
  return `laporan.${extension}`;
}

async function failureMessage(response: Response) {
  try {
    const body = await response.json() as { error?: { message?: unknown } };
    if (typeof body.error?.message === "string" && body.error.message) return body.error.message;
  } catch {
    // Use the presentation-safe fallback when a response is not structured JSON.
  }
  return "Laporan tidak dapat disiapkan saat ini. Coba lagi.";
}

export function ReportExportActions({ formats, total }: { formats: ExportFormat[]; total: number }) {
  const [state, setState] = useState<ExportState>({ status: "idle" });
  const mounted = useRef(true);
  const inFlight = useRef(false);
  const latestAttempt = useRef(0);
  const downloadUrls = useRef(new Set<string>());

  useEffect(() => {
    mounted.current = true;
    const urls = downloadUrls.current;
    return () => {
      mounted.current = false;
      for (const url of urls) URL.revokeObjectURL(url);
      urls.clear();
    };
  }, []);

  async function startExport(format: ExportFormat) {
    if (inFlight.current) return;
    inFlight.current = true;
    const attempt = latestAttempt.current + 1;
    latestAttempt.current = attempt;
    setState({ status: "preparing", attempt, format });

    try {
      const response = await fetch(format.href, {
        credentials: "same-origin",
        headers: { Accept: "text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/pdf" }
      });
      if (!response.ok) {
        const message = await failureMessage(response);
        if (mounted.current && attempt === latestAttempt.current) {
          setState({ status: "failed", attempt, format, message });
        }
        return;
      }

      const blob = await response.blob();
      if (!mounted.current || attempt !== latestAttempt.current) return;
      const url = URL.createObjectURL(blob);
      downloadUrls.current.add(url);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = downloadName(response, format);
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => {
        URL.revokeObjectURL(url);
        downloadUrls.current.delete(url);
      }, 1_000);
      setState({ status: "started", attempt, format });
    } catch {
      if (mounted.current && attempt === latestAttempt.current) {
        const message = navigator.onLine
          ? "Laporan tidak dapat disiapkan saat ini. Coba lagi."
          : "Laporan belum dapat disiapkan karena koneksi terputus. Periksa koneksi, lalu coba lagi.";
        setState({ status: "failed", attempt, format, message });
      }
    } finally {
      if (attempt === latestAttempt.current) inFlight.current = false;
    }
  }

  if (total === 0) {
    return <p className={styles.exportEmpty}>Tidak ada data yang dapat diunduh untuk filter saat ini.</p>;
  }

  const preparing = state.status === "preparing";
  return <>
    <p className={styles.exportExpectation}>Laporan dengan lebih banyak data mungkin memerlukan waktu lebih lama untuk disiapkan.</p>
    <div className={styles.exportActions} role="group" aria-label="Pilih format laporan" aria-busy={preparing}>
      {formats.map((format) => {
        const active = preparing && state.format.format === format.format;
        const label = format.format === "xlsx" ? "Excel (.xlsx)" : format.label;
        return <div className={styles.exportChoice} key={format.format}>
          <button
            type="button"
            className={styles.exportButton}
            disabled={preparing}
            aria-busy={active}
            aria-describedby={`export-${format.format}-description`}
            onClick={() => void startExport(format)}
          >
            {active ? `Menyiapkan ${format.label}…` : `Unduh ${label}`}
          </button>
          <small id={`export-${format.format}-description`}>{formatDescriptions[format.format] ?? "Unduh laporan dalam format ini."}</small>
        </div>;
      })}
    </div>
    <div className={styles.exportFeedback}>
      {state.status === "preparing" ? <p role="status" aria-live="polite">Menyiapkan laporan {state.format.label}.</p> : null}
      {state.status === "started" ? <p role="status" aria-live="polite">File {state.format.label} siap. Unduhan dimulai. <span>Periksa daftar unduhan browser jika file tidak terlihat.</span></p> : null}
      {state.status === "failed" ? <div className={styles.exportError} role="alert"><p>{state.message}</p><button type="button" onClick={() => void startExport(state.format)}>Coba lagi</button></div> : null}
    </div>
  </>;
}
