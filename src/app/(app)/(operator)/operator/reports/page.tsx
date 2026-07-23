import { currentOperator } from "@/authorization";
import { ContentWrapper, SectionHeader } from "@/components/ui";
import { OperatorReportExport, OperatorReportTable, ReportFilters, ReportSummary } from "@/components/reports/report-components";
import { reportReadService } from "@/reports/read-service";
import type { ReportQuery } from "@/reports/types";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<ReportQuery> }) {
  const [operator, query] = await Promise.all([currentOperator(), searchParams]);
  const report = await reportReadService().operator(operator.id, query);
  return <ContentWrapper>
    <SectionHeader title="Laporan Keuangan" description="Riwayat keuangan hanya untuk Siswa yang saat ini ditugaskan kepada Anda." />
    <ReportFilters filters={report.filters} students={report.students} basePath="/operator/reports" />
    <OperatorReportExport result={report} />
    <ReportSummary result={report} />
    <OperatorReportTable result={report} basePath="/operator/reports" detailBasePath="/operator/reports/students" />
  </ContentWrapper>;
}
