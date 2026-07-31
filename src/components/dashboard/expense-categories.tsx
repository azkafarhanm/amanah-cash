import { rupiah } from "@/presentation/formatting";
import styles from "./dashboard-v2.module.css";

type CategoryData = {
  label: string;
  amount: number;
};

type ExpenseCategoriesProps = {
  data: CategoryData[];
  title?: string;
  subtitle?: string;
};

export function ExpenseCategories({
  data,
  title = "Kategori Pengeluaran",
  subtitle = "Kategori dengan pengeluaran terbesar",
}: ExpenseCategoriesProps) {
  if (data.length === 0) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <div>
            <h3 className={styles.chartTitle}>{title}</h3>
            <p className={styles.chartSubtitle}>{subtitle}</p>
          </div>
        </div>
        <div className={styles.emptyState}>
          <p className={styles.emptyStateDescription}>Belum ada data pengeluaran</p>
        </div>
      </div>
    );
  }

  const maxAmount = Math.max(...data.map((d) => d.amount));
  const colors = [
    "var(--deposit-color)",
    "var(--color-action-primary)",
    "var(--color-warning-foreground)",
    "var(--withdrawal-color)",
    "var(--color-text-secondary)",
  ];

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <div>
          <h3 className={styles.chartTitle}>{title}</h3>
          <p className={styles.chartSubtitle}>{subtitle}</p>
        </div>
      </div>

      <div className={styles.barChart}>
        {data.map((item, index) => {
          const percentage = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
          const color = colors[index % colors.length];

          return (
            <div key={item.label} className={styles.barRow}>
              <span className={styles.barLabel}>{item.label}</span>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${percentage}%`,
                    background: color,
                    opacity: 1 - index * 0.15,
                  }}
                />
              </div>
              <span className={styles.barValue}>{rupiah(item.amount)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
