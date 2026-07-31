import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import styles from "./dashboard-v2.module.css";

type QuickAction = {
  label: string;
  href: string;
  icon: LucideIcon;
  primary?: boolean;
};

type QuickActionsProps = {
  actions: QuickAction[];
  title?: string;
};

export function QuickActions({
  actions,
  title = "Aksi Cepat",
}: QuickActionsProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <div className={styles.dashboardSection}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={styles.quickActionsGrid}>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={`${action.href}-${action.label}`}
              href={action.href}
              className={`${styles.quickAction} ${action.primary ? styles.quickActionPrimary : ""}`}
            >
              <span className={styles.quickActionIcon}>
                <Icon size={20} aria-hidden="true" />
              </span>
              <span>{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
