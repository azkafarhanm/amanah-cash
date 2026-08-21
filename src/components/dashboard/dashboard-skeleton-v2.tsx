import styles from "./dashboard-v2.module.css";

export function DashboardSkeletonV2() {
  return (
    <div aria-busy="true" aria-label="Memuat dashboard" className="routeTransitionSkeleton">
      <div className={styles.kpiGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${styles.kpiCard} ${styles.skeleton} ${styles.skeletonKpi}`} />
        ))}
      </div>

      <div className={styles.chartsGrid} style={{ marginTop: "var(--space-6)" }}>
        <div className={`${styles.chartContainer} ${styles.skeleton} ${styles.skeletonChart}`} />
        <div className={`${styles.chartContainer} ${styles.skeleton} ${styles.skeletonChart}`} />
      </div>

      <div className={styles.secondaryGrid} style={{ marginTop: "var(--space-6)" }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`${styles.chartContainer} ${styles.skeleton} ${styles.skeletonChart}`} />
        ))}
      </div>

      <div style={{ marginTop: "var(--space-6)" }}>
        <div className={styles.insightsGrid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`${styles.insightCard} ${styles.skeleton} ${styles.skeletonInsight}`} />
          ))}
        </div>
      </div>

      <div className={styles.bottomGrid} style={{ marginTop: "var(--space-6)" }}>
        <div className={`${styles.chartContainer} ${styles.skeleton}`} style={{ height: 320 }} />
        <div className={`${styles.chartContainer} ${styles.skeleton}`} style={{ height: 320 }} />
      </div>
    </div>
  );
}
