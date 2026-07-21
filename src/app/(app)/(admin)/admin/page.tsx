import { ContentWrapper, SectionHeader } from "@/components/ui";
import {
  ActivityCard,
  DashboardActionLink,
  DashboardGrid,
  DashboardSection,
  QuickActionCard,
  StatisticCard,
  SummaryCard,
  SummaryList
} from "@/components/dashboard/dashboard-cards";
import { dashboardReadService } from "@/dashboard/read-service";

export default async function AdminHome() {
  const dashboard = await dashboardReadService().admin();
  return (
    <ContentWrapper>
      <SectionHeader title="Dashboard Administrator" description="Ringkasan administratif tanpa akses ke saldo atau rincian transaksi Siswa." action={<DashboardActionLink href="/admin/operators">Kelola Operator</DashboardActionLink>} />
      <DashboardSection title="Ringkasan platform" description="Status akun dan penugasan yang tersimpan saat ini.">
        <DashboardGrid>
          <StatisticCard label="Total Operator" value={dashboard.operators.total} />
          <StatisticCard label="Operator aktif" value={dashboard.operators.active} />
          <StatisticCard label="Operator tidak aktif" value={dashboard.operators.inactive} />
          <StatisticCard label="Total Siswa" value={dashboard.students.total} />
          <StatisticCard label="Siswa aktif" value={dashboard.students.active} />
          <StatisticCard label="Siswa tidak aktif" value={dashboard.students.inactive} />
          <StatisticCard label="Siswa diarsipkan" value={dashboard.students.archived} />
        </DashboardGrid>
      </DashboardSection>
      <DashboardGrid wide>
        <SummaryCard title="Distribusi Siswa per Operator" description="Jumlah Siswa berdasarkan penanggung jawab saat ini.">
          <SummaryList items={dashboard.studentDistribution.map((operator) => ({ id: operator.operatorId, label: operator.operatorName, value: operator.studentCount }))} emptyMessage="Belum ada Operator yang dapat menerima penugasan Siswa." />
        </SummaryCard>
        <ActivityCard title="Perubahan Operator terbaru" items={dashboard.administrativeActivity} emptyMessage="Belum ada aktivitas administratif terbaru." />
        <ActivityCard title="Perubahan kepemilikan terbaru" items={dashboard.ownershipChanges} emptyMessage="Belum ada perpindahan kepemilikan Siswa." />
        <ActivityCard title="Penugasan Siswa terbaru" items={dashboard.latestAssignments} emptyMessage="Belum ada Siswa yang ditugaskan." />
      </DashboardGrid>
      <DashboardSection title="Aksi cepat" description="Buka alur administrasi yang sudah tersedia.">
        <DashboardGrid>
          <QuickActionCard title="Buat Operator" description="Daftarkan akun Operator baru." href="/admin/operators/new" />
          <QuickActionCard title="Buat Siswa" description="Tambahkan Siswa dan pilih Operator aktif." href="/admin/students/new" />
          <QuickActionCard title="Atur penugasan" description="Buka daftar Siswa untuk mengubah Operator." href="/admin/students" />
        </DashboardGrid>
      </DashboardSection>
    </ContentWrapper>
  );
}
