import Link from "next/link";
import type { WorkspaceTransactionItem } from "@/transactions/read-service";
import { rupiah, transactionDate, transactionSign, transactionTypeLabel } from "@/components/transactions/presentation";
import { StatusBadge } from "@/components/ui";
import styles from "./workspace.module.css";

type WorkspaceTransactionCardsProps = {
  items: WorkspaceTransactionItem[];
};

export function WorkspaceTransactionCards({ items }: WorkspaceTransactionCardsProps) {
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
              <time dateTime={item.occurredAt}>{transactionDate(item.occurredAt)}</time>
              <span>Oleh: {item.operator}</span>
            </footer>
          </article>
        );
      })}
    </div>
  );
}

