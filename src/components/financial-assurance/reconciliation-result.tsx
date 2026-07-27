"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Card, LoadingSkeleton, StatusBadge } from "@/components/ui";
import type {
  IntegrityStatus,
  ReconciliationResult
} from "@/financial-assurance/types";
import { reportDate, rupiah } from "@/presentation/formatting";
import styles from "./financial-assurance.module.css";

const STATUS_PRESENTATION: Record<
  IntegrityStatus,
  {
    label: string;
    badgeLabel: string;
    description: string;
    tone: "success" | "danger" | "warning";
  }
> = {
  MATCHED: {
    label: "Saldo sesuai",
    badgeLabel: "Sesuai",
    description: "Saldo tersimpan sesuai dengan seluruh transaksi aktif saat pemeriksaan dilakukan.",
    tone: "success"
  },
  MISMATCHED: {
    label: "Ditemukan ketidaksesuaian saldo",
    badgeLabel: "Tidak sesuai",
    description: "Nilai saldo tersimpan dan hasil perhitungan transaksi aktif tidak sama.",
    tone: "danger"
  },
  UNAVAILABLE: {
    label: "Pemeriksaan belum tersedia",
    badgeLabel: "Belum tersedia",
    description: "Hasil pemeriksaan belum dapat dipastikan. Coba periksa kembali.",
    tone: "warning"
  }
};

export function ReconciliationResultCard({ studentId }: { studentId: string }) {
  const [result, setResult] = useState<ReconciliationResult | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const latestAttempt = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const currentAttempt = latestAttempt.current + 1;
    latestAttempt.current = currentAttempt;

    fetch(
      `/api/operator/students/${encodeURIComponent(studentId)}/reconciliation`,
      { cache: "no-store", signal: controller.signal }
    )
      .then((response) => {
        if (!response.ok) throw new Error("reconciliation unavailable");
        return response.json() as Promise<ReconciliationResult>;
      })
      .then((data) => {
        if (latestAttempt.current !== currentAttempt) return;
        setResult(data);
        setError(false);
      })
      .catch(() => {
        if (
          controller.signal.aborted ||
          latestAttempt.current !== currentAttempt
        ) {
          return;
        }
        setError(true);
      })
      .finally(() => {
        if (
          !controller.signal.aborted &&
          latestAttempt.current === currentAttempt
        ) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [attempt, studentId]);

  function retry() {
    setLoading(true);
    setAttempt((value) => value + 1);
  }

  if (loading && !error && !result) {
    return (
      <section aria-label="Hasil rekonsiliasi" aria-busy="true">
        <LoadingSkeleton variant="cards" lines={6} />
      </section>
    );
  }

  if (error && !result) {
    return (
      <Card className={styles.resultError} role="alert">
        <h2>Hasil pemeriksaan tidak dapat dimuat</h2>
        <p>Data keuangan tidak diubah. Periksa koneksi Anda lalu coba lagi.</p>
        <Button
          isLoading={loading}
          loadingLabel="Mencoba lagi memuat hasil pemeriksaan"
          onClick={retry}
        >
          Coba lagi memuat hasil pemeriksaan
        </Button>
      </Card>
    );
  }

  if (!result) return null;

  const presentation = STATUS_PRESENTATION[result.integrityStatus];
  const urgent = result.integrityStatus === "MISMATCHED";

  return (
    <Card
      className={[
        styles.resultCard,
        styles[`result${result.integrityStatus}`]
      ].join(" ")}
      role={urgent ? "alert" : "status"}
      aria-labelledby="reconciliation-result-title"
    >
      <header className={styles.resultHeader}>
        <div>
          <h2 id="reconciliation-result-title">{presentation.label}</h2>
          <p>{presentation.description}</p>
        </div>
        <StatusBadge tone={presentation.tone} aria-hidden="true">
          {presentation.badgeLabel}
        </StatusBadge>
      </header>

      <dl className={styles.resultValues}>
        <div>
          <dt>Waktu pemeriksaan</dt>
          <dd>
            <time dateTime={result.checkedAt}>{reportDate(result.checkedAt)}</time>
          </dd>
        </div>
        <div>
          <dt>Saldo tersimpan</dt>
          <dd>{rupiah(result.persistedBalance)}</dd>
        </div>
        <div>
          <dt>Saldo hasil perhitungan</dt>
          <dd>{rupiah(result.calculatedBalance)}</dd>
        </div>
        <div>
          <dt>Selisih</dt>
          <dd>{rupiah(result.difference)}</dd>
        </div>
        <div>
          <dt>Transaksi aktif</dt>
          <dd>{result.activeTransactionCount.toLocaleString("id-ID")}</dd>
        </div>
      </dl>

      {error ? (
        <p className={styles.refreshError} role="alert">
          Hasil terbaru tidak dapat dimuat. Hasil pemeriksaan sebelumnya tetap ditampilkan.
        </p>
      ) : null}

      <Button
        variant="secondary"
        isLoading={loading}
        loadingLabel="Memeriksa kembali"
        onClick={retry}
      >
        Periksa lagi
      </Button>
    </Card>
  );
}
