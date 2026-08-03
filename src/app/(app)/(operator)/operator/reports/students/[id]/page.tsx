import { protectOwnership } from "@/authorization/routes";
import { BackButton, ContentWrapper, SectionHeader } from "@/components/ui";
import { OperatorReportExport, OperatorReportFilterContext, OperatorReportTable, ReportFilters, ReportSummary } from "@/components/reports/report-components";
import { reportReadService } from "@/reports/read-service";
import type { ReportQuery } from "@/reports/types";

export default async function StudentReportPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<ReportQuery> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const operator = await protectOwnership(id);
  const report = await reportReadService().operator(operator.id, { ...query, studentId: id });
  const student = report.students.find((item) => item.id === id);
  return <ContentWrapper>
    <SectionHeader title={`Riwayat Laporan ${student?.name ?? "Siswa"}`} description="Timeline transaksi aktif, revisi, dan bukti saldo tersimpan untuk Siswa ini." action={<BackButton href="/operator/reports">Kembali ke Laporan</BackButton>} />
    <ReportFilters filters={report.filters} students={report.students} basePath={`/operator/reports/students/${encodeURIComponent(id)}`} lockedStudentId={id} />
    <OperatorReportExport result={report} />
    <OperatorReportFilterContext result={report} />
    <ReportSummary result={report} />
    <OperatorReportTable result={report} basePath={`/operator/reports/students/${encodeURIComponent(id)}`} detailBasePath="/operator/reports/students" lockedStudentId={id} />
  </ContentWrapper>;
}
