"use client";

import { StatusBadge } from "@/components/ui";
import type { TransactionHistoryItem } from "@/transactions/read-service";
import { formatTimelineGroup, rupiah, transactionDate, transactionSign, transactionTypeLabel } from "./presentation";
import { TransactionDialog } from "./transaction-dialog";
import styles from "./transactions.module.css";

export function StudentTimeline({
  items,
  studentId,
  balance,
  readOnly,
  onSuccess
}: {
  items: TransactionHistoryItem[];
  studentId: string;
  balance: string;
  readOnly: boolean;
  onSuccess(message: string): void;
}) {
  // Group items by timeline group (e.g. "Hari ini", "Kemarin", "Juli 2026")
  const groups: { label: string; items: TransactionHistoryItem[] }[] = [];

  for (const item of items) {
    const groupLabel = formatTimelineGroup(item.occurredAt);
    let group = groups.find((g) => g.label === groupLabel);
    if (!group) {
      group = { label: groupLabel, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }

  return (
    <div className={styles.ledger} aria-label="Riwayat Transaksi Keuangan Siswa">
      {groups.map((group) => (
        <section key={group.label} className={styles.timelineGroup} aria-label={`Transaksi ${group.label}`}>
          <div className={styles.timelineGroupHeader}>
            <span className={styles.timelineGroupBadge}>{group.label}</span>
          </div>
          {group.items.map((item) => {
            const isDeposit = item.type === "DEPOSIT" || (item.type === "CORRECTION" && item.correctionDirection === "INCREASE");
            const isWithdrawal = item.type === "WITHDRAWAL" || (item.type === "CORRECTION" && item.correctionDirection === "DECREASE");
            const amountClass = isDeposit
              ? styles.amountPositive
              : isWithdrawal
              ? styles.amountNegative
              : styles.amountCorrection;

            return (
              <article
                key={item.id}
                className={`${styles.transactionItem} ${styles.timelineItem} ${
                  item.type === "CORRECTION" ? styles.correctionItem : ""
                }`}
              >
                <header className={styles.transactionTop}>
                  <div className={styles.transactionIdentity}>
                    <StatusBadge
                      tone={
                        item.type === "DEPOSIT"
                          ? "success"
                          : item.type === "CORRECTION"
                          ? "warning"
                          : "neutral"
                      }
                    >
                      {transactionTypeLabel[item.type]}
                    </StatusBadge>
                    {item.type === "CORRECTION" ? (
                      <span className={styles.direction}>
                        {item.correctionDirection === "INCREASE" ? "Tambah saldo" : "Kurangi saldo"}
                      </span>
                    ) : null}
                  </div>
                  <strong className={amountClass}>
                    {transactionSign(item)} {rupiah(item.amount)}
                  </strong>
                </header>

                <dl className={styles.transactionMeta}>
                  <div>
                    <dt>Waktu Kejadian</dt>
                    <dd>{transactionDate(item.occurredAt)}</dd>
                  </div>
                  <div>
                    <dt>Operator</dt>
                    <dd>{item.operator}</dd>
                  </div>
                  <div>
                    <dt>Catatan</dt>
                    <dd>{item.notes ?? "Tidak ada catatan"}</dd>
                  </div>
                  {item.type === "CORRECTION" ? (
                    <div>
                      <dt>Alasan Koreksi</dt>
                      <dd>{item.reason}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>Status</dt>
                    <dd>
                      <StatusBadge tone={item.deletedAt ? "danger" : "success"}>
                        {item.deletedAt ? "Dihapus sementara" : "Aktif"}
                      </StatusBadge>
                    </dd>
                  </div>
                </dl>

                <footer className={styles.rowActions}>
                  {item.deletedAt ? (
                    <TransactionDialog
                      kind="RESTORE"
                      studentId={studentId}
                      balance={balance}
                      item={item}
                      disabled={readOnly}
                      onSuccess={onSuccess}
                    />
                  ) : (
                    <>
                      <TransactionDialog
                        kind="EDIT"
                        studentId={studentId}
                        balance={balance}
                        item={item}
                        disabled={readOnly}
                        onSuccess={onSuccess}
                      />
                      <TransactionDialog
                        kind="DELETE"
                        studentId={studentId}
                        balance={balance}
                        item={item}
                        disabled={readOnly}
                        onSuccess={onSuccess}
                      />
                    </>
                  )}
                </footer>
              </article>
            );
          })}
        </section>
      ))}
    </div>
  );
}
