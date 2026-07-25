import Link from "next/link";
import type { ReactNode } from "react";
import { Card, LoadingSkeleton } from "@/components/ui";
import type { DashboardActivityItem, DashboardActivityKind } from "@/dashboard/types";
import styles from "./dashboard.module.css";

export function DashboardGrid({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return <div className={wide ? styles.dashboardGridWide : styles.dashboardGrid}>{children}</div>;
}

export function DashboardActionLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link className={styles.dashboardActionLink} href={href}>{children}</Link>;
}

export function DashboardSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <section className={styles.dashboardSection} aria-labelledby={`dashboard-${title.toLocaleLowerCase("id-ID").replace(/[^a-z0-9]+/g, "-")}`}>
    <header><h2 id={`dashboard-${title.toLocaleLowerCase("id-ID").replace(/[^a-z0-9]+/g, "-")}`}>{title}</h2>{description ? <p>{description}</p> : null}</header>
    {children}
  </section>;
}

export function StatisticCard({ label, value, description, hero = false }: { label: string; value: string | number; description?: string; hero?: boolean }) {
  const labelId = `stat-${label.toLocaleLowerCase("id-ID").replace(/[^a-z0-9]+/g, "-")}`;
  return <Card className={`${styles.statisticCard} ${hero ? styles.statisticCardHero : ""}`} role="group" aria-labelledby={labelId}>
    <span id={labelId}>{label}</span>
    <strong>{value}</strong>
    {description ? <p>{description}</p> : null}
  </Card>;
}


export function TrendCard({ label, value, period, description, tone = "neutral" }: {
  label: string;
  value: string;
  period: string;
  description: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  const labelId = `trend-${label.toLocaleLowerCase("id-ID").replace(/[^a-z0-9]+/g, "-")}`;
  return <Card className={`${styles.trendCard} ${styles[`trend${tone[0].toUpperCase()}${tone.slice(1)}`]}`} role="group" aria-labelledby={labelId}>
    <div><span id={labelId}>{label}</span><small>{period}</small></div>
    <strong>{value}</strong>
    <p>{description}</p>
  </Card>;
}

export function SummaryCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  const titleId = `summary-${title.toLocaleLowerCase("id-ID").replace(/[^a-z0-9]+/g, "-")}`;
  return <Card className={styles.summaryCard} role="region" aria-labelledby={titleId}>
    <header><h2 id={titleId}>{title}</h2>{description ? <p>{description}</p> : null}</header>
    {children}
  </Card>;
}

export function SummaryList({ items, emptyMessage }: {
  items: Array<{ id: string; label: string; value: string | number }>;
  emptyMessage: string;
}) {
  return items.length ? <ul className={styles.summaryList}>{items.map((item) => <li key={item.id}><span>{item.label}</span><strong>{item.value}</strong></li>)}</ul> : <p className={styles.activityEmpty}>{emptyMessage}</p>;
}

const ACTIVITY_LABEL: Record<DashboardActivityKind, string> = {
  ADMINISTRATIVE: "Administratif",
  FINANCIAL: "Keuangan",
  OWNERSHIP_CHANGE: "Kepemilikan",
  STATUS_CHANGE: "Status"
};

function activityDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", hour12: false, timeZone: "Asia/Jakarta" }).format(new Date(value));
}

export function ActivityCard({ title, items, emptyMessage }: {
  title: string;
  items: DashboardActivityItem[];
  emptyMessage: string;
}) {
  const titleId = `activity-${title.toLocaleLowerCase("id-ID").replace(/[^a-z0-9]+/g, "-")}`;
  return <Card className={styles.activityCard} role="region" aria-labelledby={titleId}>
    <h2 id={titleId}>{title}</h2>
    {items.length ? <ol className={styles.activityList}>{items.map((item) => <li key={`${item.kind}-${item.id}`}>
      <span className={styles.activityKind}>{ACTIVITY_LABEL[item.kind]}</span>
      <div>{item.href ? <Link href={item.href}>{item.title}</Link> : <strong>{item.title}</strong>}<p>{item.description}</p><time dateTime={item.occurredAt}>{activityDate(item.occurredAt)}</time></div>
    </li>)}</ol> : <p className={styles.activityEmpty}>{emptyMessage}</p>}
  </Card>;
}

export function QuickActionCard({ title, description, href, variant = "secondary" }: { title: string; description: string; href: string; variant?: "primary" | "secondary" }) {
  return <Card className={styles.quickActionCard}>
    <h3>{title}</h3>
    <p>{description}</p>
    <Link className={variant === "primary" ? styles.quickActionPrimaryLink : undefined} href={href} aria-label={`${title}: ${description}`}>Buka</Link>
  </Card>;
}


export function AttentionStudentsCard({ items }: {
  items: Array<{
    id: string;
    name: string;
    reason: "ZERO_BALANCE" | "NO_TRANSACTIONS" | "INACTIVE_WITH_BALANCE";
    balance: string;
    updatedAt: string;
  }>;
}) {
  const titleId = "attention-students-title";
  return (
    <Card className={styles.activityCard} role="region" aria-labelledby={titleId}>
      <div className={styles.cardHeaderWithBadge}>
        <h2 id={titleId}>Perhatian Operasional</h2>
      </div>
      {items.length ? (
        <ol className={styles.activityList}>
          {items.map((item) => (
            <li key={item.id}>
              <span className={styles.activityKind}>
                {item.reason === "INACTIVE_WITH_BALANCE"
                  ? "Non-aktif bersaldo"
                  : item.reason === "ZERO_BALANCE"
                  ? "Saldo Rp 0"
                  : "Belum transaksi"}
              </span>
              <div>
                <Link href={`/operator/students/${encodeURIComponent(item.id)}`}>
                  {item.name}
                </Link>
                <p>
                  Saldo: Rp {new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(BigInt(item.balance || "0"))}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.activityEmpty}>
          Semua siswa aktif memiliki saldo positif dan transaksi tercatat.
        </p>
      )}
    </Card>
  );
}

export function DashboardSkeleton() {
  return <div className={styles.dashboardSkeleton} aria-busy="true" aria-label="Memuat dashboard">
    <LoadingSkeleton variant="cards" lines={5} />
    <div className={styles.dashboardGrid}><LoadingSkeleton variant="cards" lines={3} /><LoadingSkeleton variant="cards" lines={3} /></div>
  </div>;
}

