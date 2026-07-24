import { rupiah } from "@/components/transactions/presentation";
import styles from "./workspace.module.css";

type WorkspaceMetricsBannerProps = {
  summary: {
    todayDeposits: string;
    todayWithdrawals: string;
    todayTransactionCount: number;
  };
};

export function WorkspaceMetricsBanner({ summary }: WorkspaceMetricsBannerProps) {
  return (
    <section className={styles.metricsBanner} aria-label="Ringkasan Operasional Hari Ini">
      <div className={styles.metricCard}>
        <span className={styles.metricLabel}>Kas Masuk Hari Ini</span>
        <strong className={styles.metricDeposit}>+{rupiah(summary.todayDeposits)}</strong>
      </div>
      <div className={styles.metricCard}>
        <span className={styles.metricLabel}>Kas Keluar Hari Ini</span>
        <strong className={styles.metricWithdrawal}>−{rupiah(summary.todayWithdrawals)}</strong>
      </div>
      <div className={styles.metricCard}>
        <span className={styles.metricLabel}>Transaksi Hari Ini</span>
        <strong className={styles.metricCount}>{summary.todayTransactionCount}</strong>
      </div>
    </section>
  );
}
