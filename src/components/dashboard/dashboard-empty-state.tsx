import type { LucideIcon } from "lucide-react";
import styles from "./dashboard-v2.module.css";

type DashboardEmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
};

export function DashboardEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: DashboardEmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      {Icon && (
        <span className={styles.emptyStateIcon}>
          <Icon size={40} aria-hidden="true" />
        </span>
      )}
      <h3 className={styles.emptyStateTitle}>{title}</h3>
      <p className={styles.emptyStateDescription}>{description}</p>
      {action && (
        <a href={action.href} className={styles.emptyStateAction}>
          {action.label}
        </a>
      )}
    </div>
  );
}
