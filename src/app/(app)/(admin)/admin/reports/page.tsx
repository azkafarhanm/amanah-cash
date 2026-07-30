import { requirePlatformAdmin } from "@/authorization";
import { AdminReportExport, AdminReportFilterContext, AdminReportFilters, AdminReportTable } from "@/components/reports/report-components";
import { ContentWrapper, SectionHeader } from "@/components/ui";
import { reportReadService } from "@/reports/read-service";
import type { AdminReportQuery } from "@/reports/types";
import { readCurrentDefaultPageSize } from "@/settings/service";

export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<AdminReportQuery> }) {
  const [admin, query] = await Promise.all([requirePlatformAdmin(), searchParams]);
  const pageSize = await readCurrentDefaultPageSize(admin.id);
  const report = await reportReadService().admin(query, pageSize);
  return <ContentWrapper>
    <SectionHeader title="Laporan Administratif" description="Aktivitas Operator dan penugasan tanpa akses ke saldo, transaksi, atau rincian audit keuangan." />
    <AdminReportFilters result={report} basePath="/admin/reports" />
    <AdminReportFilterContext result={report} />
    <AdminReportTable result={report} basePath="/admin/reports" />
    <AdminReportExport result={report} />
  </ContentWrapper>;
}
