import type { LucideIcon } from "lucide-react";
import { TrendingUp, AlertTriangle, Info } from "lucide-react";
import styles from "./dashboard-v2.module.css";

type InsightType = "warning" | "info" | "success" | "deposit";

type Insight = {
  id: string;
  type: InsightType;
  text: string;
  icon?: LucideIcon;
};

type SmartInsightsProps = {
  insights: Insight[];
  title?: string;
};

const DEFAULT_ICONS: Record<InsightType, LucideIcon> = {
  warning: AlertTriangle,
  info: Info,
  success: TrendingUp,
  deposit: TrendingUp,
};

export function SmartInsights({
  insights,
  title = "Insight Cerdas",
}: SmartInsightsProps) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <div className={styles.dashboardSection}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={styles.insightsGrid}>
        {insights.map((insight) => {
          const Icon = insight.icon || DEFAULT_ICONS[insight.type];
          return (
            <div key={insight.id} className={styles.insightCard}>
              <div className={`${styles.insightAccent} ${styles[`insightAccent${capitalize(insight.type)}`]}`} />
              <div className={`${styles.insightIcon} ${styles[`insightIcon${capitalize(insight.type)}`]}`}>
                <Icon size={16} aria-hidden="true" />
              </div>
              <div className={styles.insightContent}>
                <p className={styles.insightText}>{insight.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
