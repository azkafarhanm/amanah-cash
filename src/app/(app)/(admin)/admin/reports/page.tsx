import { requirePlatformAdmin } from "@/authorization";
import { AdminReportFilters, AdminReportTable } from "@/components/reports/report-components";
import { ContentWrapper, SectionHeader } from "@/components/ui";
import { reportReadService } from "@/reports/read-service";
import type { AdminReportQuery } from "@/reports/types";

export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<AdminReportQuery> }) {
  const [, query] = await Promise.all([requirePlatformAdmin(), searchParams]);
  const report = await reportReadService().admin(query);
  return <ContentWrapper>
    <SectionHeader title="Laporan Administratif" description="Aktivitas Operator dan penugasan tanpa akses ke saldo, transaksi, atau rincian audit keuangan." />
    <AdminReportFilters result={report} basePath="/admin/reports" />
    <AdminReportTable result={report} basePath="/admin/reports" />
  </ContentWrapper>;
}
