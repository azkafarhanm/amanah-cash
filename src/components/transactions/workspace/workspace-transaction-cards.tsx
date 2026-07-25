"use client";

import Link from "next/link";
import type { WorkspaceTransactionItem } from "@/transactions/read-service";
import { rupiah, transactionDate, transactionSign, transactionTypeLabel } from "@/components/transactions/presentation";
import { Button, StatusBadge } from "@/components/ui";
import styles from "./workspace.module.css";

type WorkspaceTransactionCardsProps = {
  items: WorkspaceTransactionItem[];
  onEdit?(item: WorkspaceTransactionItem): void;
  onDelete?(item: WorkspaceTransactionItem): void;
  onRestore?(item: WorkspaceTransactionItem): void;
};

export function WorkspaceTransactionCards({
  items,
  onEdit,
  onDelete,
  onRestore
}: WorkspaceTransactionCardsProps) {
  return (
    <div className={styles.cardsWrapper} aria-label="Daftar Kartu Transaksi Seluruh Siswa">
      {items.map((item) => {
        const isDeposit = item.type === "DEPOSIT" || (item.type === "CORRECTION" && item.correctionDirection === "INCREASE");
        const isWithdrawal = item.type === "WITHDRAWAL" || (item.type === "CORRECTION" && item.correctionDirection === "DECREASE");
        const amountClass = isDeposit
          ? styles.amountDeposit
          : isWithdrawal
          ? styles.amountWithdrawal
          : styles.amountCorrection;

        const sign = transactionSign({ type: item.type, correctionDirection: item.correctionDirection });
        const formattedAmount = `${sign}${rupiah(item.amount)}`;
        const isDeleted = Boolean(item.deletedAt);
        const typeLabel = transactionTypeLabel[item.type];

        return (
          <article key={item.id} className={styles.cardItem}>
            <header className={styles.cardHeader}>
              <div className={styles.studentCell}>
                <Link
                  href={`/operator/students/${encodeURIComponent(item.studentId)}`}
                  className={styles.studentLink}
                >
                  {item.studentName}
                </Link>
                {item.studentNotes ? (
                  <span className={styles.studentSubtext}>{item.studentNotes}</span>
                ) : null}
              </div>
              {isDeleted ? (
                <StatusBadge tone="danger">Terhapus</StatusBadge>
              ) : (
                <StatusBadge tone="success">Aktif</StatusBadge>
              )}
            </header>

            <div className={styles.cardBody}>
              <StatusBadge tone={item.type === "DEPOSIT" ? "success" : item.type === "WITHDRAWAL" ? "warning" : "neutral"}>
                {typeLabel}
              </StatusBadge>
              <span className={amountClass}>{formattedAmount}</span>
            </div>

            <footer className={styles.cardFooter}>
              <div className={styles.cardMeta}>
                <time dateTime={item.occurredAt}>{transactionDate(item.occurredAt)}</time>
                <span>Oleh: {item.operator}</span>
              </div>
              <div className={styles.cardActions}>
                {!isDeleted ? (
                  <>
                    {onEdit && (
                      <Button
                        type="button"
                        variant="secondary"
                        className={styles.actionBtn}
                        onClick={() => onEdit(item)}
                        aria-label={`Edit transaksi ${item.studentName}`}
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        type="button"
                        variant="secondary"
                        className={`${styles.actionBtn} ${styles.dangerActionBtn}`}
                        onClick={() => onDelete(item)}
                        aria-label={`Hapus transaksi ${item.studentName}`}
                      >
                        Hapus
                      </Button>
                    )}
                  </>
                ) : (
                  onRestore && (
                    <Button
                      type="button"
                      variant="secondary"
                      className={styles.actionBtn}
                      onClick={() => onRestore(item)}
                      aria-label={`Pulihkan transaksi ${item.studentName}`}
                    >
                      Pulihkan
                    </Button>
                  )
                )}
              </div>
            </footer>
          </article>
        );
      })}
    </div>
  );
}
