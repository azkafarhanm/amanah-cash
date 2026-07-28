"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Card, EmptyState, LoadingSkeleton, StatusBadge } from "@/components/ui";
import type {
  FinancialAuditEventType,
  FinancialAuditTimelineItem,
  FinancialAuditTimelineResult
} from "@/financial-assurance/types";
import { reportDate } from "@/presentation/formatting";
import styles from "./financial-assurance.module.css";

const EVENT_PRESENTATION: Record<
  FinancialAuditEventType,
  { label: string; summary: string; tone: "success" | "warning" | "danger" | "neutral" }
> = {
  CREATE: { label: "Dicatat", summary: "Transaksi keuangan dicatat", tone: "success" },
  EDIT: { label: "Diubah", summary: "Transaksi keuangan diubah", tone: "warning" },
  DELETE: { label: "Dihapus", summary: "Transaksi keuangan dihapus", tone: "danger" },
  RESTORE: { label: "Dipulihkan", summary: "Transaksi keuangan dipulihkan", tone: "success" },
  OWNERSHIP_TRANSFER: { label: "Kepemilikan", summary: "Kepemilikan Siswa diperbarui", tone: "neutral" }
};

function auditUrl(studentId: string, cursor?: string) {
  const base = `/api/operator/reconciliation/students/${encodeURIComponent(studentId)}/audit`;
  if (!cursor) return base;
  const parameters = new URLSearchParams();
  parameters.set("cursor", cursor);
  return `${base}?${parameters.toString()}`;
}

function summary(item: FinancialAuditTimelineItem) {
  const presentation = EVENT_PRESENTATION[item.eventType];
  return item.reason
    ? `${presentation.summary}: ${item.reason}`
    : presentation.summary;
}

function uniqueAuditItems(items: ReadonlyArray<FinancialAuditTimelineItem>) {
  const ids = new Set<string>();
  return items.filter((item) => {
    if (ids.has(item.id)) return false;
    ids.add(item.id);
    return true;
  });
}

export function FinancialAuditTimeline({ studentId }: { studentId: string }) {
  const [items, setItems] = useState<ReadonlyArray<FinancialAuditTimelineItem>>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialError, setInitialError] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const latestAttempt = useRef(0);
  const focusAfterLoadMore = useRef<string | null>(null);
  const loadMoreInFlight = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    const currentAttempt = latestAttempt.current + 1;
    latestAttempt.current = currentAttempt;

    fetch(auditUrl(studentId), { cache: "no-store", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("audit timeline unavailable");
        return response.json() as Promise<FinancialAuditTimelineResult>;
      })
      .then((data) => {
        if (latestAttempt.current !== currentAttempt) return;
        setItems(uniqueAuditItems(data.items));
        setNextCursor(data.nextCursor);
      })
      .catch(() => {
        if (controller.signal.aborted || latestAttempt.current !== currentAttempt) return;
        setInitialError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted && latestAttempt.current === currentAttempt) {
          setInitialLoading(false);
        }
      });

    return () => controller.abort();
  }, [attempt, studentId]);

  useEffect(() => {
    if (!focusAfterLoadMore.current) return;
    document.getElementById(`financial-audit-event-${focusAfterLoadMore.current}`)?.focus();
    focusAfterLoadMore.current = null;
  }, [items]);

  function retry() {
    setInitialLoading(true);
    setInitialError(false);
    setLoadMoreError(false);
    setAttempt((value) => value + 1);
  }

  async function loadMore() {
    if (!nextCursor || loadingMore || loadMoreInFlight.current) return;
    loadMoreInFlight.current = true;
    const cursor = nextCursor;
    setLoadingMore(true);
    setLoadMoreError(false);

    try {
      const response = await fetch(auditUrl(studentId, cursor), { cache: "no-store" });
      if (!response.ok) throw new Error("audit timeline unavailable");
      const data = await response.json() as FinancialAuditTimelineResult;
      setItems((previous) => uniqueAuditItems([...previous, ...data.items]));
      setNextCursor(data.nextCursor);
      focusAfterLoadMore.current = data.items[0]?.id ?? null;
    } catch {
      setLoadMoreError(true);
    } finally {
      loadMoreInFlight.current = false;
      setLoadingMore(false);
    }
  }

  if (initialLoading) {
    return (
      <section className={styles.auditTimeline} aria-labelledby="financial-audit-title" aria-busy="true">
        <header className={styles.auditTimelineHeader}>
          <h2 id="financial-audit-title">Riwayat Audit Keuangan</h2>
          <p>Perubahan keuangan yang telah tercatat untuk Siswa ini.</p>
        </header>
        <LoadingSkeleton variant="cards" lines={4} />
      </section>
    );
  }

  if (initialError) {
    return (
      <section className={styles.auditTimeline} aria-labelledby="financial-audit-title">
        <Card className={styles.auditTimelineError} role="alert">
          <h2 id="financial-audit-title">Riwayat audit tidak dapat dimuat</h2>
          <p>Data keuangan tidak diubah. Periksa koneksi Anda lalu coba lagi.</p>
          <Button isLoading={initialLoading} loadingLabel="Mencoba lagi memuat riwayat audit" onClick={retry}>
            Coba lagi memuat riwayat audit
          </Button>
        </Card>
      </section>
    );
  }

  const visibleItems = uniqueAuditItems(items);

  return (
    <section className={styles.auditTimeline} aria-labelledby="financial-audit-title">
      <header className={styles.auditTimelineHeader}>
        <h2 id="financial-audit-title">Riwayat Audit Keuangan</h2>
        <p>Perubahan keuangan yang telah tercatat untuk Siswa ini.</p>
      </header>

      {visibleItems.length === 0 ? (
        <EmptyState
          title="Belum ada riwayat audit keuangan"
          description="Perubahan keuangan yang tercatat akan muncul di sini."
        />
      ) : (
        <ol className={styles.auditTimelineList} aria-label="Riwayat audit keuangan">
          {visibleItems.map((item) => {
            const presentation = EVENT_PRESENTATION[item.eventType];
            return (
              <li
                key={item.id}
                id={`financial-audit-event-${item.id}`}
                className={styles.auditTimelineItem}
                tabIndex={-1}
              >
                <Card className={styles.auditTimelineCard}>
                  <header className={styles.auditTimelineCardHeader}>
                    <StatusBadge tone={presentation.tone}>{presentation.label}</StatusBadge>
                    <time dateTime={item.committedAt}>{reportDate(item.committedAt)}</time>
                  </header>
                  <p>{summary(item)}</p>
                  {item.transactionRevision !== null ? (
                    <span className={styles.auditRevision}>Revisi {item.transactionRevision}</span>
                  ) : null}
                </Card>
              </li>
            );
          })}
        </ol>
      )}

      {loadMoreError ? (
        <p className={styles.auditLoadMoreError} role="alert">
          Riwayat audit berikutnya tidak dapat dimuat. Coba lagi.
        </p>
      ) : null}
      {nextCursor ? (
        <div className={styles.auditPagination}>
          <Button
            variant="secondary"
            isLoading={loadingMore}
            loadingLabel="Memuat riwayat audit berikutnya"
            onClick={loadMore}
          >
            Muat lebih banyak
          </Button>
          <span className={styles.auditLoadingStatus} role="status" aria-live="polite">
            {loadingMore ? "Memuat riwayat audit berikutnya" : ""}
          </span>
        </div>
      ) : null}
    </section>
  );
}
