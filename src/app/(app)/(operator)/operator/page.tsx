import { currentOperator } from "@/authorization";
import { ContentWrapper, SectionHeader } from "@/components/ui";
import {
  ActivityCard,
  DashboardActionLink,
  DashboardGrid,
  DashboardSection,
  QuickActionCard,
  StatisticCard,
  TrendCard
} from "@/components/dashboard/dashboard-cards";
import { dashboardReadService } from "@/dashboard/read-service";
import type { DashboardActivityItem } from "@/dashboard/types";
import { rupiah } from "@/components/transactions/presentation";

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
  const recentlyUpdatedStudents: DashboardActivityItem[] = dashboard.recentlyUpdatedStudents.map((student) => ({
    id: student.id,
    kind: "STATUS_CHANGE",
    title: student.name,
    description: `Status ${student.status === "ACTIVE" ? "aktif" : student.status === "INACTIVE" ? "tidak aktif" : "diarsipkan"}.`,
    occurredAt: student.updatedAt,
    href: `/operator/students/${encodeURIComponent(student.id)}`
  }));
  return (
    <ContentWrapper>
      <SectionHeader title="Dashboard Operator" description="Ringkasan operasional untuk Siswa yang ditugaskan kepada Anda." action={<DashboardActionLink href="/operator/students">Buka daftar Siswa</DashboardActionLink>} />
      <DashboardSection title="Ringkasan hari ini" description="Aktivitas menggunakan waktu kejadian hari ini di Asia/Jakarta.">
        <DashboardGrid>
          <StatisticCard label="Siswa saya" value={dashboard.students.total} description={`${dashboard.students.active} aktif · ${dashboard.students.inactive} tidak aktif · ${dashboard.students.archived} diarsipkan`} />
          <StatisticCard label="Siswa aktif hari ini" value={dashboard.students.activeToday} description="Siswa aktif dengan transaksi tercatat hari ini." />
          <StatisticCard label="Saldo yang dikelola" value={rupiah(dashboard.managedBalance)} description="Jumlah saldo tersimpan dari seluruh Siswa dalam lingkup Anda." />
          <TrendCard label="Setoran hari ini" value={rupiah(dashboard.today.deposits.amount)} period="Hari ini" description={`${dashboard.today.deposits.count} transaksi Setoran aktif`} tone="positive" />
          <TrendCard label="Penarikan hari ini" value={rupiah(dashboard.today.withdrawals.amount)} period="Hari ini" description={`${dashboard.today.withdrawals.count} transaksi Penarikan aktif`} tone="negative" />
        </DashboardGrid>
      </DashboardSection>
      <DashboardGrid wide>
        <ActivityCard title="Transaksi terbaru" items={recentTransactions} emptyMessage="Belum ada aktivitas keuangan yang dicatat." />
        <ActivityCard title="Siswa yang baru diperbarui" items={recentlyUpdatedStudents} emptyMessage="Belum ada Siswa yang ditugaskan kepada Anda." />
      </DashboardGrid>
      <DashboardSection title="Aksi cepat" description="Lanjutkan ke alur Siswa dan transaksi yang sudah tersedia.">
        <DashboardGrid>
          <QuickActionCard title="Lihat Siswa" description="Buka seluruh Siswa dalam lingkup Anda." href="/operator/students" />
          <QuickActionCard title="Buka transaksi" description="Pilih Siswa untuk melihat riwayat transaksi." href="/operator/students" />
          <QuickActionCard title="Setoran baru" description="Pilih Siswa aktif lalu gunakan aksi Setor." href="/operator/students" />
          <QuickActionCard title="Penarikan baru" description="Pilih Siswa aktif lalu gunakan aksi Tarik." href="/operator/students" />
        </DashboardGrid>
      </DashboardSection>
    </ContentWrapper>
  );
}
