"use client";

import Link from "next/link";
import type { WorkspaceTransactionItem } from "@/transactions/read-service";
import { rupiah, transactionDate, transactionSign, transactionTypeLabel } from "@/components/transactions/presentation";
import { Button, StatusBadge } from "@/components/ui";
import styles from "./workspace.module.css";

type WorkspaceTransactionTableProps = {
  items: WorkspaceTransactionItem[];
  onEdit?(item: WorkspaceTransactionItem): void;
  onDelete?(item: WorkspaceTransactionItem): void;
  onRestore?(item: WorkspaceTransactionItem): void;
};

export function WorkspaceTransactionTable({
  items,
  onEdit,
  onDelete,
  onRestore
}: WorkspaceTransactionTableProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table} aria-label="Daftar Transaksi Seluruh Siswa">
        <thead>
          <tr>
            <th scope="col" className={styles.th}>Tanggal & Waktu</th>
            <th scope="col" className={styles.th}>Siswa</th>
            <th scope="col" className={styles.th}>Jenis</th>
            <th scope="col" className={styles.th}>Nominal</th>
            <th scope="col" className={styles.th}>Oleh</th>
            <th scope="col" className={styles.th}>Status</th>
            <th scope="col" className={styles.th}>Aksi</th>
          </tr>
        </thead>
        <tbody>
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
              <tr key={item.id} className={styles.tr}>
                <td className={styles.td}>
                  <time dateTime={item.occurredAt}>{transactionDate(item.occurredAt)}</time>
                </td>
                <td className={styles.td}>
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
                </td>
                <td className={styles.td}>
                  <StatusBadge tone={item.type === "DEPOSIT" ? "success" : item.type === "WITHDRAWAL" ? "warning" : "neutral"}>
                    {typeLabel}
                  </StatusBadge>
                </td>
                <td className={styles.td}>
                  <span className={amountClass}>{formattedAmount}</span>
                </td>
                <td className={styles.td}>{item.operator}</td>
                <td className={styles.td}>
                  {isDeleted ? (
                    <StatusBadge tone="danger">Terhapus</StatusBadge>
                  ) : (
                    <StatusBadge tone="success">Aktif</StatusBadge>
                  )}
                </td>
                <td className={styles.td}>
                  <div className={styles.rowActions}>
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
