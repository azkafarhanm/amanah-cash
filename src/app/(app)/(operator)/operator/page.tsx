import { currentOperator } from "@/authorization";
import { ContentWrapper, SectionHeader } from "@/components/ui";
import {
  ActivityCard,
  AttentionStudentsCard,
  DashboardActionLink,
  DashboardGrid,
  DashboardSection,
  QuickActionCard,
  StatisticCard,
  TrendCard
} from "@/components/dashboard/dashboard-cards";
import { dashboardReadService } from "@/dashboard/read-service";
import type { DashboardActivityItem } from "@/dashboard/types";
import { rupiah, signedRupiah } from "@/presentation/formatting";

export default async function OperatorHome() {
  const operator = await currentOperator();
  const dashboard = await dashboardReadService().operator(operator.id);

  const recentTransactions: DashboardActivityItem[] = dashboard.recentTransactions.map((transaction) => ({
    id: transaction.id,
    kind: "FINANCIAL",
    title: transaction.studentName,
    description: `${transaction.type === "DEPOSIT" ? "Setoran" : transaction.type === "WITHDRAWAL" ? "Penarikan" : `Koreksi ${transaction.correctionDirection === "INCREASE" ? "tambah" : "kurang"}`} · ${rupiah(transaction.amount)}${transaction.deleted ? " · Dihapus sementara" : ""}`,
    occurredAt: transaction.occurredAt,
    href: `/operator/students/${encodeURIComponent(transaction.studentId)}`
  }));

  const recentCorrections: DashboardActivityItem[] = dashboard.recentCorrections.map((correction) => ({
    id: correction.id,
    kind: "FINANCIAL",
    title: correction.studentName,
    description: `Koreksi ${correction.correctionDirection === "INCREASE" ? "tambah" : "kurang"} · ${rupiah(correction.amount)}${correction.reason ? ` · ${correction.reason}` : ""}`,
    occurredAt: correction.occurredAt,
    href: `/operator/students/${encodeURIComponent(correction.studentId)}`
  }));

  const recentWithdrawals: DashboardActivityItem[] = dashboard.recentWithdrawals.map((withdrawal) => ({
    id: withdrawal.id,
    kind: "FINANCIAL",
    title: withdrawal.studentName,
    description: `Penarikan · ${rupiah(withdrawal.amount)}`,
    occurredAt: withdrawal.occurredAt,
    href: `/operator/students/${encodeURIComponent(withdrawal.studentId)}`
  }));

  return (
    <ContentWrapper>
      <SectionHeader
        title="Dashboard Operator"
        description="Pusat kendali keuangan operasional Siswa yang ditugaskan kepada Anda."
        action={<DashboardActionLink href="/operator/transactions">Buka Workspace Transaksi</DashboardActionLink>}
      />

      <DashboardSection title="Kesehatan Keuangan Bulan Ini" description="Indikator saldo dan arus kas operasional bulan berjalan.">
        <DashboardGrid>
          <StatisticCard
            hero
            label="Saldo yang dikelola"
            value={rupiah(dashboard.managedBalance)}
            description={`Total saldo tersimpan dari ${dashboard.students.active} Siswa aktif`}
          />

          <TrendCard
            label="Setoran bulan ini"
            value={rupiah(dashboard.month.deposits.amount)}
            period="Bulan Ini"
            description={`${dashboard.month.deposits.count} transaksi Setoran aktif`}
            tone="positive"
          />
          <TrendCard
            label="Penarikan bulan ini"
            value={rupiah(dashboard.month.withdrawals.amount)}
            period="Bulan Ini"
            description={`${dashboard.month.withdrawals.count} transaksi Penarikan aktif`}
            tone="negative"
          />
          <TrendCard
            label="Arus kas bersih"
            value={signedRupiah(dashboard.month.netCashFlow.isPositive ? dashboard.month.netCashFlow.amount : `-${dashboard.month.netCashFlow.amount}`)}
            period="Bulan Ini"
            description="Selisih Setoran dan Penarikan bulan ini"
            tone={dashboard.month.netCashFlow.isPositive ? "positive" : "negative"}
          />
        </DashboardGrid>
      </DashboardSection>

      <DashboardSection title="Aktivitas Hari Ini" description="Ringkasan operasional harian Asia/Jakarta.">
        <DashboardGrid>
          <StatisticCard
            label="Siswa saya"
            value={dashboard.students.total}
            description={`${dashboard.students.active} aktif · ${dashboard.students.inactive} tidak aktif · ${dashboard.students.archived} diarsipkan`}
          />
          <StatisticCard
            label="Siswa aktif hari ini"
            value={dashboard.students.activeToday}
            description="Siswa aktif dengan transaksi tercatat hari ini"
          />
          <TrendCard
            label="Setoran hari ini"
            value={rupiah(dashboard.today.deposits.amount)}
            period="Hari ini"
            description={`${dashboard.today.deposits.count} transaksi Setoran`}
            tone="positive"
          />
          <TrendCard
            label="Penarikan hari ini"
            value={rupiah(dashboard.today.withdrawals.amount)}
            period="Hari ini"
            description={`${dashboard.today.withdrawals.count} transaksi Penarikan`}
            tone="negative"
          />
        </DashboardGrid>
      </DashboardSection>

      <DashboardGrid wide>
        <AttentionStudentsCard items={dashboard.attentionStudents} />
        <ActivityCard
          title="Transaksi terbaru"
          items={recentTransactions}
          emptyMessage="Belum ada aktivitas keuangan yang dicatat."
        />
      </DashboardGrid>

      <DashboardGrid wide>
        <ActivityCard
          title="Koreksi terbaru"
          items={recentCorrections}
          emptyMessage="Belum ada koreksi saldo yang dicatat."
        />
        <ActivityCard
          title="Penarikan terbaru"
          items={recentWithdrawals}
          emptyMessage="Belum ada penarikan yang dicatat."
        />
      </DashboardGrid>

      <DashboardSection title="Aksi Cepat Operasional" description="Pintas langsung ke alur transaksi dan pengelolaan siswa.">
        <DashboardGrid>
          <QuickActionCard
            title="+ Catat Transaksi"
            description="Buka workspace untuk mencatat transaksi siswa secara langsung."
            href="/operator/transactions"
          />
          <QuickActionCard
            title="Workspace Transaksi"
            description="Kelola stream transaksi dan saring aktivitas operasional."
            href="/operator/transactions"
          />
          <QuickActionCard
            title="+ Tambah Siswa"
            description="Daftarkan siswa baru ke dalam lingkup operasional Anda."
            href="/operator/students"
          />
          <QuickActionCard
            title="Laporan Keuangan"
            description="Unduh dan tinjau laporan keuangan operasional (CSV, Excel, PDF)."
            href="/operator/reports"
          />
        </DashboardGrid>
      </DashboardSection>
    </ContentWrapper>
  );
}

