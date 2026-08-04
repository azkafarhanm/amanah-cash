import Link from "next/link";
import { rupiah } from "@/presentation/formatting";
import { StudentAvatar } from "@/components/students/student-avatar";
import styles from "./dashboard-v2.module.css";

type ActivityItem = {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "CORRECTION";
  studentName: string;
  amount: string;
  occurredAt: string;
  href?: string;
  deleted?: boolean;
  studentId: string;
  studentPhotoObjectKey?: string | null;
  studentPhotoUpdatedAt?: string | null;
};

type RecentActivityProps = {
  items: ActivityItem[];
  title?: string;
  maxItems?: number;
};

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export function RecentActivity({
  items,
  title = "Aktivitas Terbaru",
  maxItems = 8,
}: RecentActivityProps) {
  const displayItems = items.slice(0, maxItems);

  if (displayItems.length === 0) {
    return (
      <div className={styles.chartContainer}>
        <h3 className={styles.chartTitle}>{title}</h3>
        <div className={styles.emptyState}>
          <p className={styles.emptyStateDescription}>Belum ada aktivitas hari ini</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>{title}</h3>
      <div className={styles.activityTimeline}>
        {displayItems.map((item) => {
          const amountClass =
            item.type === "DEPOSIT"
              ? styles.activityAmountDeposit
              : item.type === "WITHDRAWAL"
              ? styles.activityAmountWithdrawal
              : styles.activityAmountCorrection;

          const typeLabel =
            item.type === "DEPOSIT"
              ? "Setoran"
              : item.type === "WITHDRAWAL"
              ? "Penarikan"
              : "Koreksi";

          const content = (
            <>
              <StudentAvatar studentId={item.studentId} name={item.studentName} photoObjectKey={item.studentPhotoObjectKey} photoUpdatedAt={item.studentPhotoUpdatedAt} scope="operator" size="compact" />
              <div className={styles.activityDetails}>
                <span className={styles.activityTitle}>{item.studentName}</span>
                <p className={styles.activityDescription}>
                  {typeLabel}{item.deleted ? " · Dihapus sementara" : ""}
                </p>
                <time className={styles.activityTime} dateTime={item.occurredAt}>
                  {formatDate(item.occurredAt)}, {formatTime(item.occurredAt)}
                </time>
              </div>
              <span className={`${styles.activityAmount} ${amountClass}`}>
                {item.type === "DEPOSIT" ? "+" : item.type === "WITHDRAWAL" ? "-" : ""}{rupiah(item.amount)}
              </span>
            </>
          );

          return (
            <div key={item.id} className={styles.activityItem}>
              {item.href ? (
                <Link href={item.href} className={styles.activityItemLink}>
                  {content}
                </Link>
              ) : (
                content
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
