import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Sparkline } from "./sparkline";
import styles from "./dashboard-v2.module.css";

type KpiCardProps = {
  label: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  sparklineData?: number[];
  sparklineColor?: string;
  delta?: string;
  deltaPositive?: boolean;
  glass?: boolean;
  className?: string;
  children?: ReactNode;
};

export function KpiCard({
  label,
  value,
  description,
  icon: Icon,
  sparklineData,
  sparklineColor,
  delta,
  deltaPositive,
  glass = false,
  className = "",
  children,
}: KpiCardProps) {
  const labelId = `kpi-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div
      className={`${styles.kpiCard} ${glass ? styles.kpiCardGlass : ""} ${className}`}
      role="group"
      aria-labelledby={labelId}
    >
      <div className={styles.kpiHeader}>
        <div className={styles.kpiLabelRow}>
          {Icon && (
            <span className={styles.kpiIcon}>
              <Icon size={20} aria-hidden="true" />
            </span>
          )}
          <span id={labelId} className={styles.kpiLabel}>{label}</span>
        </div>
        {delta && (
          <span className={`${styles.kpiDelta} ${deltaPositive ? styles.kpiDeltaPositive : styles.kpiDeltaNegative}`}>
            {delta}
          </span>
        )}
      </div>

      <div className={styles.kpiValue}>{value}</div>

      {description && (
        <p className={styles.kpiDescription}>{description}</p>
      )}

      {sparklineData && sparklineData.length >= 2 && (
        <div className={styles.kpiSparkline}>
          <Sparkline
            data={sparklineData}
            width={120}
            height={32}
            color={sparklineColor || "var(--color-action-primary)"}
            fillColor={sparklineColor || "var(--color-action-primary)"}
          />
        </div>
      )}

      {children}
    </div>
  );
}
