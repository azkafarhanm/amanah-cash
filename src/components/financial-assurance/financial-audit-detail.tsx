"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Button,
  Card,
  ContextDetailDrawer,
  LoadingSkeleton,
  StatusBadge
} from "@/components/ui";
import type {
  FinancialAuditDetail,
  FinancialAuditFieldKey,
  FinancialAuditFieldValueMap
} from "@/financial-assurance/types";
import {
  correctionDirectionLabel,
  reportDate,
  rupiah,
  transactionTypeLabel
} from "@/presentation/formatting";
import { FINANCIAL_AUDIT_EVENT_PRESENTATION } from "./financial-audit-timeline";
import styles from "./financial-assurance.module.css";

type DetailState =
  | Readonly<{ status: "loading"; auditEventId: string | null }>
  | Readonly<{ status: "error"; auditEventId: string }>
  | Readonly<{ status: "ready"; auditEventId: string; detail: FinancialAuditDetail }>;

function detailUrl(studentId: string, auditEventId: string) {
  return `/api/operator/reconciliation/students/${encodeURIComponent(studentId)}/audit/${encodeURIComponent(auditEventId)}`;
}

function displayedValue<Key extends FinancialAuditFieldKey>(
  detail: FinancialAuditDetail,
  field: Key
): FinancialAuditFieldValueMap[Key] | null {
  const change = detail.changes.find((candidate) => candidate.field === field);
  if (!change) return null;
  return change.after as FinancialAuditFieldValueMap[Key] | null;
}

function OptionalValue({ children }: { children: ReactNode }) {
  return children === null || children === "" ? (
    <span className={styles.auditDetailEmptyValue}>Tidak tersedia</span>
  ) : children;
}

export function FinancialAuditDetail({
  studentId,
  auditEventId,
  onClose
}: {
  studentId: string;
  auditEventId: string | null;
  onClose(): void;
}) {
  const detailCache = useRef(new Map<string, FinancialAuditDetail>());
  const inFlight = useRef(new Map<string, Promise<FinancialAuditDetail>>());
  const [state, setState] = useState<DetailState>({
    status: "loading",
    auditEventId: null
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!auditEventId) return;
    const cached = detailCache.current.get(auditEventId);
    if (cached) {
      setState({ status: "ready", auditEventId, detail: cached });
      return;
    }

    let active = true;
    setState({ status: "loading", auditEventId });
    let request = inFlight.current.get(auditEventId);
    if (!request) {
      request = fetch(detailUrl(studentId, auditEventId), { cache: "no-store" })
        .then((response) => {
          if (!response.ok) throw new Error("audit detail unavailable");
          return response.json() as Promise<FinancialAuditDetail>;
        })
        .then((detail) => {
          detailCache.current.set(auditEventId, detail);
          return detail;
        })
        .finally(() => {
          inFlight.current.delete(auditEventId);
        });
      inFlight.current.set(auditEventId, request);
    }

    request.then(
      (detail) => {
        if (active) setState({ status: "ready", auditEventId, detail });
      },
      () => {
        if (active) setState({ status: "error", auditEventId });
      }
    );
    return () => {
      active = false;
    };
  }, [attempt, auditEventId, studentId]);

  function retry() {
    setAttempt((value) => value + 1);
  }

  const currentState =
    state.auditEventId === auditEventId
      ? state
      : { status: "loading", auditEventId } as const;
  const detail = currentState.status === "ready" ? currentState.detail : null;
  const presentation = detail
    ? FINANCIAL_AUDIT_EVENT_PRESENTATION[detail.eventType]
    : null;
  const amount = detail ? displayedValue(detail, "amount") : null;
  const correctionDirection = detail ? displayedValue(detail, "correctionDirection") : null;
  const reason = detail?.reason ?? (detail ? displayedValue(detail, "reason") : null);
  const notes = detail ? displayedValue(detail, "notes") : null;
  const occurredAt = detail ? displayedValue(detail, "occurredAt") : null;
  const deletedAt = detail ? displayedValue(detail, "deletedAt") : null;
  const transactionType = detail ? displayedValue(detail, "type") : null;
  const revision = detail?.transactionRevision ?? (detail ? displayedValue(detail, "revision") : null);

  return (
    <ContextDetailDrawer
      open={auditEventId !== null}
      title="Detail Audit Keuangan"
      description="Informasi read-only dari catatan audit keuangan."
      onClose={onClose}
      contentProps={{ className: styles.auditDetailDrawer }}
    >
      {currentState.status === "loading" ? (
        <div className={styles.auditDetailState} aria-busy="true">
          <p className={styles.auditDetailAnnouncement} role="status" aria-live="polite">
            Memuat detail audit keuangan
          </p>
          <LoadingSkeleton variant="cards" lines={5} />
        </div>
      ) : null}

      {currentState.status === "error" ? (
        <Card className={styles.auditDetailState} role="alert">
          <h3>Detail audit tidak dapat dimuat</h3>
          <p>Periksa koneksi Anda lalu coba lagi.</p>
          <Button onClick={retry}>Coba lagi memuat detail audit</Button>
        </Card>
      ) : null}

      {detail?.detailAvailability === "UNSUPPORTED_SCHEMA" ? (
        <Card className={styles.auditDetailState} role="status">
          <h3>Detail audit tidak tersedia</h3>
          <p>
            Catatan ini menggunakan versi data yang belum didukung. Nilai detail tidak
            ditampilkan untuk mencegah informasi yang keliru.
          </p>
        </Card>
      ) : null}

      {detail?.detailAvailability === "AVAILABLE" && presentation ? (
        <div className={styles.auditDetailContent}>
          <div className={styles.auditDetailSummary}>
            <StatusBadge tone={presentation.tone}>{presentation.label}</StatusBadge>
            <time dateTime={detail.committedAt}>{reportDate(detail.committedAt)}</time>
          </div>
          <dl className={styles.auditDetailValues}>
            <div>
              <dt>Jenis peristiwa</dt>
              <dd>{presentation.summary}</dd>
            </div>
            {revision !== null ? (
              <div>
                <dt>Revisi</dt>
                <dd>{revision}</dd>
              </div>
            ) : null}
            {transactionType !== null ? (
              <div>
                <dt>Jenis transaksi</dt>
                <dd>{transactionTypeLabel[transactionType]}</dd>
              </div>
            ) : null}
            {amount !== null ? (
              <div>
                <dt>Jumlah</dt>
                <dd>{rupiah(amount)}</dd>
              </div>
            ) : null}
            {correctionDirection !== null ? (
              <div>
                <dt>Arah koreksi</dt>
                <dd>{correctionDirectionLabel(correctionDirection)}</dd>
              </div>
            ) : null}
            <div>
              <dt>Alasan</dt>
              <dd><OptionalValue>{reason}</OptionalValue></dd>
            </div>
            <div>
              <dt>Catatan</dt>
              <dd><OptionalValue>{notes}</OptionalValue></dd>
            </div>
            <div>
              <dt>Waktu kejadian</dt>
              <dd><OptionalValue>{occurredAt ? reportDate(occurredAt) : null}</OptionalValue></dd>
            </div>
            {deletedAt ? (
              <div>
                <dt>Waktu penghapusan</dt>
                <dd><time dateTime={deletedAt}>{reportDate(deletedAt)}</time></dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}
    </ContextDetailDrawer>
  );
}
