import {
  Users,
  UserCheck,
  GraduationCap,
  UserPlus,
  BarChart3,
} from "lucide-react";
import { dashboardReadService } from "@/dashboard/read-service";
import { ContentWrapper, SectionHeader } from "@/components/ui";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { SmartInsights } from "@/components/dashboard/smart-insights";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { InitialsAvatar } from "@/components/students/presentation";
import styles from "@/components/dashboard/dashboard-v2.module.css";

export default async function AdminHome() {
  const dashboard = await dashboardReadService().admin();

  const quickActions = [
    { label: "Buat Operator", href: "/admin/operators/new", icon: UserPlus, primary: true },
    { label: "Buat Siswa", href: "/admin/students/new", icon: GraduationCap },
    { label: "Kelola Operator", href: "/admin/operators", icon: Users },
    { label: "Lihat Laporan", href: "/admin/reports", icon: BarChart3 },
  ];

  const insights = generateAdminInsights(dashboard);

  return (
    <ContentWrapper>
      <SectionHeader
        title="Dashboard Administrator"
        description="Ringkasan administratif platform tanpa akses ke saldo atau rincian transaksi Siswa."
      />

      <div className={styles.kpiGrid}>
        <KpiCard
          label="Total Operator"
          value={dashboard.operators.total}
          description={`${dashboard.operators.active} aktif · ${dashboard.operators.inactive} tidak aktif`}
          icon={Users}
        />

        <KpiCard
          label="Operator Aktif"
          value={dashboard.operators.active}
          description="Dapat menerima penugasan Siswa"
          icon={UserCheck}
        />

        <KpiCard
          label="Total Siswa"
          value={dashboard.students.total}
          description={`${dashboard.students.active} aktif · ${dashboard.students.inactive} tidak aktif · ${dashboard.students.archived} diarsipkan`}
          icon={GraduationCap}
        />

        <KpiCard
          label="Siswa Aktif"
          value={dashboard.students.active}
          description="Siswa dengan status aktif"
          icon={UserCheck}
        />
      </div>

      <div className={styles.secondaryGrid}>
        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitle}>Distribusi Siswa per Operator</h3>
          <p className={styles.chartSubtitle}>Jumlah Siswa berdasarkan penanggung jawab</p>
          {dashboard.studentDistribution.length > 0 ? (
            <div className={styles.adminList}>
              {dashboard.studentDistribution.map((op) => (
                <div key={op.operatorId} className={styles.adminListItem}>
                  <InitialsAvatar name={op.operatorName} size={28} />
                  <div className={styles.adminListItemContent}>
                    <div className={styles.adminListItemTitle}>{op.operatorName}</div>
                  </div>
                  <span className={styles.adminListItemTime}>{op.studentCount} siswa</span>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.attentionEmpty}>Belum ada Operator</p>
          )}
        </div>

        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitle}>Aktivitas Terbaru</h3>
          <p className={styles.chartSubtitle}>Perubahan administratif terbaru</p>
          {dashboard.administrativeActivity.length > 0 ? (
            <div className={styles.adminList}>
              {dashboard.administrativeActivity.slice(0, 5).map((item) => (
                <div key={item.id} className={styles.adminListItem}>
                  <div className={styles.adminListItemContent}>
                    <div className={styles.adminListItemTitle}>
                      {item.href ? (
                        <a href={item.href} style={{ color: "inherit", textDecoration: "none" }}>{item.title}</a>
                      ) : item.title}
                    </div>
                    <div className={styles.adminListItemDescription}>{item.description}</div>
                  </div>
                  <time className={styles.adminListItemTime}>
                    {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" }).format(new Date(item.occurredAt))}
                  </time>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.attentionEmpty}>Belum ada aktivitas administratif</p>
          )}
        </div>

        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitle}>Penugasan Terbaru</h3>
          <p className={styles.chartSubtitle}>Siswa yang baru ditugaskan</p>
          {dashboard.latestAssignments.length > 0 ? (
            <div className={styles.adminList}>
              {dashboard.latestAssignments.slice(0, 5).map((item) => (
                <div key={item.id} className={styles.adminListItem}>
                  <div className={styles.adminListItemContent}>
                    <div className={styles.adminListItemTitle}>
                      {item.href ? (
                        <a href={item.href} style={{ color: "inherit", textDecoration: "none" }}>{item.title}</a>
                      ) : item.title}
                    </div>
                    <div className={styles.adminListItemDescription}>{item.description}</div>
                  </div>
                  <time className={styles.adminListItemTime}>
                    {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" }).format(new Date(item.occurredAt))}
                  </time>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.attentionEmpty}>Belum ada penugasan</p>
          )}
        </div>
      </div>

      {insights.length > 0 && <SmartInsights insights={insights} />}

      <QuickActions actions={quickActions} />
    </ContentWrapper>
  );
}

function generateAdminInsights(dashboard: Awaited<ReturnType<ReturnType<typeof dashboardReadService>["admin"]>>) {
  const insights: Array<{
    id: string;
    type: "warning" | "info" | "success" | "deposit";
    text: string;
  }> = [];

  if (dashboard.operators.inactive > 0) {
    insights.push({
      id: "inactive-operators",
      type: "warning",
      text: `${dashboard.operators.inactive} operator tidak aktif saat ini.`,
    });
  }

  if (dashboard.students.archived > 0) {
    insights.push({
      id: "archived-students",
      type: "info",
      text: `${dashboard.students.archived} siswa diarsipkan.`,
    });
  }

  if (dashboard.operators.active > 0 && dashboard.students.active > 0) {
    const avg = Math.round(dashboard.students.active / dashboard.operators.active);
    insights.push({
      id: "avg-students",
      type: "info",
      text: `Rata-rata ${avg} siswa per operator aktif.`,
    });
  }

  if (dashboard.ownershipChanges.length > 0) {
    insights.push({
      id: "recent-transfers",
      type: "deposit",
      text: `${dashboard.ownershipChanges.length} perpindahan kepemilikan terbaru tercatat.`,
    });
  }

  return insights.slice(0, 5);
}
