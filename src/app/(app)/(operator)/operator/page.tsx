import { currentOperator } from "@/authorization";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  ArrowRightLeft,
  Download,
  UserPlus,
  AlertTriangle,
} from "lucide-react";
import { dashboardReadService } from "@/dashboard/read-service";
import { rupiah, signedRupiah } from "@/presentation/formatting";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { DepositWithdrawalChart } from "@/components/dashboard/deposit-withdrawal-chart";
import { ExpenseCategories } from "@/components/dashboard/expense-categories";
import { SmartInsights } from "@/components/dashboard/smart-insights";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import styles from "@/components/dashboard/dashboard-v2.module.css";

export default async function OperatorHome() {
  const operator = await currentOperator();
  const dashboard = await dashboardReadService().operator(operator.id);

  const recentActivities = dashboard.recentTransactions.map((t) => ({
    id: t.id,
    type: t.type,
    studentName: t.studentName,
    amount: t.amount,
    occurredAt: t.occurredAt,
    href: `/operator/students/${encodeURIComponent(t.studentId)}`,
    deleted: t.deleted,
  }));

  const netCashFlow = dashboard.month.netCashFlow.isPositive
    ? dashboard.month.netCashFlow.amount
    : `-${dashboard.month.netCashFlow.amount}`;

  const insights = generateInsights(dashboard);

  const cashFlowData = [
    { label: "Setoran", value: Number(dashboard.month.deposits.amount) || 0 },
    { label: "Penarikan", value: Number(dashboard.month.withdrawals.amount) || 0 },
    { label: "Bersih", value: Number(dashboard.month.netCashFlow.amount) || 0 },
  ];

  const depositWithdrawalData = [
    { label: "Bulan Ini", deposits: Number(dashboard.month.deposits.amount) || 0, withdrawals: Number(dashboard.month.withdrawals.amount) || 0 },
  ];

  const quickActions = [
    { label: "Catat Transaksi", href: "/operator/transactions", icon: ArrowRightLeft, primary: true },
    { label: "Tambah Siswa", href: "/operator/students", icon: UserPlus },
    { label: "Ekspor Laporan", href: "/operator/reports", icon: Download },
    { label: "Lihat Semua Siswa", href: "/operator/students", icon: Users },
  ];

  return (
    <div className={styles.dashboardSection} style={{ gap: "var(--space-6)" }}>
      <div className={styles.sectionHeader}>
        <div>
          <h1 className={styles.sectionTitle}>Dashboard</h1>
          <p className={styles.sectionDescription}>
            Ringkasan keuangan dan aktivitas operasional hari ini.
          </p>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        <KpiCard
          label="Total Dana Dititipkan"
          value={rupiah(dashboard.managedBalance)}
          description={`${dashboard.students.active} siswa aktif`}
          icon={Wallet}
          sparklineData={[60, 65, 70, 68, 72, 75, 80]}
          sparklineColor="var(--color-action-primary)"
          delta={`+${dashboard.students.active} siswa`}
          deltaPositive={true}
          glass
        />

        <KpiCard
          label="Setoran Hari Ini"
          value={rupiah(dashboard.today.deposits.amount)}
          description={`${dashboard.today.deposits.count} transaksi`}
          icon={ArrowDownLeft}
          sparklineData={[10, 15, 12, 18, 20, 16, 22]}
          sparklineColor="var(--deposit-color)"
        />

        <KpiCard
          label="Penarikan Hari Ini"
          value={rupiah(dashboard.today.withdrawals.amount)}
          description={`${dashboard.today.withdrawals.count} transaksi`}
          icon={ArrowUpRight}
          sparklineData={[5, 8, 6, 10, 7, 9, 12]}
          sparklineColor="var(--withdrawal-color)"
        />

        <KpiCard
          label="Siswa Aktif"
          value={dashboard.students.active}
          description={`${dashboard.students.total} total · ${dashboard.students.activeToday} aktif hari ini`}
          icon={Users}
        />
      </div>

      <div className={styles.chartsGrid}>
        <CashFlowChart
          data={cashFlowData}
          title="Tren Arus Kas Bulan Ini"
          subtitle="Setoran, penarikan, dan arus kas bersih"
        />

        <DepositWithdrawalChart
          data={depositWithdrawalData}
          title="Setoran vs Penarikan"
          subtitle="Perbandingan bulan berjalan"
        />
      </div>

      <div className={styles.secondaryGrid}>
        <ExpenseCategories
          data={[
            { label: "Setoran", amount: Number(dashboard.month.deposits.amount) || 0 },
            { label: "Penarikan", amount: Number(dashboard.month.withdrawals.amount) || 0 },
          ]}
          title="Ringkasan Bulan Ini"
          subtitle="Total setoran dan penarikan"
        />

        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitle}>Arus Kas Bersih</h3>
          <p className={styles.chartSubtitle}>Selisih setoran dan penarikan bulan ini</p>
          <div style={{ padding: "var(--space-6) 0", textAlign: "center" }}>
            <div style={{
              fontSize: "2rem",
              fontWeight: "var(--font-weight-bold)",
              color: dashboard.month.netCashFlow.isPositive ? "var(--deposit-color)" : "var(--withdrawal-color)",
              fontVariantNumeric: "tabular-nums",
            }}>
              {signedRupiah(netCashFlow)}
            </div>
            <p style={{ margin: "var(--space-2) 0 0", font: "var(--type-supporting)", color: "var(--color-text-secondary)" }}>
              {dashboard.month.netCashFlow.isPositive ? "Positif — setoran lebih besar" : "Negatif — penarikan lebih besar"}
            </p>
          </div>
        </div>

        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitle}>Siswa Perlu Perhatian</h3>
          <p className={styles.chartSubtitle}>Siswa dengan kondisi khusus</p>
          {dashboard.attentionStudents.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {dashboard.attentionStudents.map((s) => (
                <a
                  key={s.id}
                  href={`/operator/students/${encodeURIComponent(s.id)}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    padding: "var(--space-2)",
                    borderRadius: "var(--radius-md)",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "background 0.15s ease",
                  }}
                >
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    borderRadius: "var(--radius-full)",
                    background: s.reason === "ZERO_BALANCE" ? "var(--color-warning-background)" : s.reason === "NO_TRANSACTIONS" ? "var(--color-info-background)" : "var(--color-error-background)",
                    color: s.reason === "ZERO_BALANCE" ? "var(--color-warning-foreground)" : s.reason === "NO_TRANSACTIONS" ? "var(--color-info-foreground)" : "var(--color-error-foreground)",
                    flex: "none",
                  }}>
                    <AlertTriangle size={14} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: "var(--type-label)", color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.name}
                    </div>
                    <div style={{ font: "var(--type-supporting)", color: "var(--color-text-secondary)" }}>
                      {s.reason === "ZERO_BALANCE" ? "Saldo Rp 0" : s.reason === "NO_TRANSACTIONS" ? "Belum ada transaksi" : "Non-aktif bersaldo"}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p style={{ padding: "var(--space-4)", textAlign: "center", font: "var(--type-supporting)", color: "var(--color-text-secondary)" }}>
              Semua siswa dalam kondisi baik
            </p>
          )}
        </div>
      </div>

      {insights.length > 0 && <SmartInsights insights={insights} />}

      <div className={styles.bottomGrid}>
        <RecentActivity
          items={recentActivities}
          title="Aktivitas Terbaru"
        />

        <QuickActions actions={quickActions} />
      </div>
    </div>
  );
}

function generateInsights(dashboard: Awaited<ReturnType<ReturnType<typeof dashboardReadService>["operator"]>>) {
  const insights: Array<{
    id: string;
    type: "warning" | "info" | "success" | "deposit";
    text: string;
  }> = [];

  if (dashboard.attentionStudents.length > 0) {
    const zeroBalance = dashboard.attentionStudents.filter((s) => s.reason === "ZERO_BALANCE");
    if (zeroBalance.length > 0) {
      insights.push({
        id: "zero-balance",
        type: "warning",
        text: `${zeroBalance.length} siswa memiliki saldo Rp 0.`,
      });
    }
  }

  if (dashboard.month.netCashFlow.isPositive) {
    insights.push({
      id: "positive-flow",
      type: "success",
      text: "Setoran melebihi penarikan bulan ini.",
    });
  } else {
    insights.push({
      id: "negative-flow",
      type: "warning",
      text: "Penarikan melebihi setoran bulan ini.",
    });
  }

  if (dashboard.today.deposits.count > 0) {
    insights.push({
      id: "today-deposits",
      type: "deposit",
      text: `${dashboard.today.deposits.count} setoran tercatat hari ini senilai ${rupiah(dashboard.today.deposits.amount)}.`,
    });
  }

  if (dashboard.students.activeToday > 0) {
    insights.push({
      id: "active-today",
      type: "info",
      text: `${dashboard.students.activeToday} siswa aktif memiliki transaksi hari ini.`,
    });
  }

  return insights.slice(0, 5);
}
