import { ContentWrapper, SectionHeader } from "@/components/ui";
import { StudentList } from "@/components/students/student-list";
import { CreateStudentModal } from "@/components/students/create-student-modal";
import { currentOperator } from "@/authorization";
import { studentManagement } from "@/students/service";
import { transactionReadService } from "@/transactions/read-service";
import { readCurrentDefaultPageSize } from "@/settings/service";

export default async function OperatorStudentsPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string; page?: string; pageSize?: string }> }) {
  const [query, operator] = await Promise.all([searchParams, currentOperator()]);
  const defaultPageSize = await readCurrentDefaultPageSize(operator.id);
  const result = await studentManagement().list(
    { kind: "operator", operatorId: operator.id },
    { ...query, pageSize: query.pageSize ?? defaultPageSize }
  );
  const financialSummaries = await transactionReadService().studentSummaries(result.items.map((student) => student.id), operator.id);
  return <ContentWrapper><SectionHeader title="Siswa Saya" description="Hanya Siswa yang ditugaskan kepada Anda yang ditampilkan." action={<CreateStudentModal />} /><StudentList result={result} query={query} basePath="/operator/students" scope="operator" financialSummaries={financialSummaries} /></ContentWrapper>;
}
