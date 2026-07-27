import { currentOperator } from "@/authorization";
import { StudentList } from "@/components/students/student-list";
import { ContentWrapper, SectionHeader } from "@/components/ui";
import { studentManagement } from "@/students/service";

export default async function FinancialAssurancePage({
  searchParams
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const [query, operator] = await Promise.all([searchParams, currentOperator()]);
  const result = await studentManagement().list(
    { kind: "operator", operatorId: operator.id },
    query
  );

  return (
    <ContentWrapper>
      <SectionHeader
        title="Pemeriksaan Keuangan"
        description="Pilih Siswa untuk membuka pemeriksaan keuangan yang hanya dapat Anda akses."
      />
      <StudentList
        result={result}
        query={query}
        basePath="/operator/reconciliation/students"
        scope="operator"
        showFinancialSummary={false}
        showStatusFilter={false}
        searchLabel="Cari Siswa"
        searchPlaceholder="Cari nama atau catatan Siswa..."
      />
    </ContentWrapper>
  );
}
