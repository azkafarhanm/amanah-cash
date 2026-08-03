import { protectRoute } from "@/authorization/routes";
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
import { ContentWrapper, SectionHeader } from "@/components/ui";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { DepositWithdrawalChart } from "@/components/dashboard/deposit-withdrawal-chart";
import { ExpenseCategories } from "@/components/dashboard/expense-categories";
import { SmartInsights } from "@/components/dashboard/smart-insights";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import styles from "@/components/dashboard/dashboard-v2.module.css";

export default async function OperatorHome() {
  const operator = await protectRoute("operator");
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
    <ContentWrapper>
      <SectionHeader
        title="Dashboard"
        description="Ringkasan keuangan dan aktivitas operasional hari ini."
      />

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
          <div className={styles.netCashFlow}>
            <div className={`${styles.netCashFlowValue} ${dashboard.month.netCashFlow.isPositive ? styles.netCashFlowValuePositive : styles.netCashFlowValueNegative}`}>
              {signedRupiah(netCashFlow)}
            </div>
            <p className={styles.netCashFlowLabel}>
              {dashboard.month.netCashFlow.isPositive ? "Positif — setoran lebih besar" : "Negatif — penarikan lebih besar"}
            </p>
          </div>
        </div>

        <div className={styles.chartContainer}>
          <h3 className={styles.chartTitle}>Siswa Perlu Perhatian</h3>
          <p className={styles.chartSubtitle}>Siswa dengan kondisi khusus</p>
          {dashboard.attentionStudents.length > 0 ? (
            <div className={styles.attentionList}>
              {dashboard.attentionStudents.map((s) => {
                const iconClass =
                  s.reason === "ZERO_BALANCE"
                    ? styles.attentionIconWarning
                    : s.reason === "NO_TRANSACTIONS"
                    ? styles.attentionIconInfo
                    : styles.attentionIconError;
                return (
                  <a
                    key={s.id}
                    href={`/operator/students/${encodeURIComponent(s.id)}`}
                    className={styles.attentionItem}
                  >
                    <span className={`${styles.attentionIcon} ${iconClass}`}>
                      <AlertTriangle size={14} />
                    </span>
                    <div className={styles.attentionDetails}>
                      <div className={styles.attentionName}>{s.name}</div>
                      <div className={styles.attentionReason}>
                        {s.reason === "ZERO_BALANCE" ? "Saldo Rp 0" : s.reason === "NO_TRANSACTIONS" ? "Belum ada transaksi" : "Non-aktif bersaldo"}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <p className={styles.attentionEmpty}>Semua siswa dalam kondisi baik</p>
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
    </ContentWrapper>
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
