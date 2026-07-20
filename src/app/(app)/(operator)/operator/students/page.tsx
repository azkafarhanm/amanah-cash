import { ContentWrapper, SectionHeader } from "@/components/ui";
import { StudentList } from "@/components/students/student-list";
import { currentOperator } from "@/authorization";
import { studentManagement } from "@/students/service";

export default async function OperatorStudentsPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string; page?: string }> }) {
  const [query, operator] = await Promise.all([searchParams, currentOperator()]);
  const result = await studentManagement().list({ kind: "operator", operatorId: operator.id }, query);
  return <ContentWrapper><SectionHeader title="Siswa Saya" description="Hanya Siswa yang ditugaskan kepada Anda yang ditampilkan." /><StudentList result={result} query={query} basePath="/operator/students" /></ContentWrapper>;
}
