import { ContentWrapper, SectionHeader } from "@/components/ui";
import { StudentList } from "@/components/students/student-list";
import { currentOperator } from "@/authorization";
import { studentManagement } from "@/students/service";
import { transactionReadService } from "@/transactions/read-service";

export default async function OperatorStudentsPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string; page?: string }> }) {
  const [query, operator] = await Promise.all([searchParams, currentOperator()]);
  const result = await studentManagement().list({ kind: "operator", operatorId: operator.id }, query);
  const financialSummaries = await transactionReadService().studentSummaries(result.items.map((student) => student.id), operator.id);
  return <ContentWrapper><SectionHeader title="Siswa Saya" description="Hanya Siswa yang ditugaskan kepada Anda yang ditampilkan." /><StudentList result={result} query={query} basePath="/operator/students" scope="operator" financialSummaries={financialSummaries} /></ContentWrapper>;
}
