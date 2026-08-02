import { BackButton, ContentWrapper, SectionHeader } from "@/components/ui";
import { StudentDetail } from "@/components/students/student-detail";
import { requireOwnership } from "@/authorization";
import { studentManagement } from "@/students/service";
import { TransactionExperience } from "@/components/transactions/transaction-experience";
import { transactionReadService, type TransactionHistoryQuery } from "@/transactions/read-service";

export default async function OperatorStudentDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<TransactionHistoryQuery> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]); const operator = await requireOwnership(id);
  const [student, transactions] = await Promise.all([
    studentManagement().detail(id, { kind: "operator", operatorId: operator.id }),
    transactionReadService().history(id, operator.id, query)
  ]);
  return <ContentWrapper><SectionHeader title={student.name} description="Saldo dan riwayat transaksi Siswa yang ditugaskan kepada Anda." action={<BackButton href="/operator/students">Kembali ke Siswa Saya</BackButton>} /><StudentDetail student={student} /><TransactionExperience studentId={id} studentStatus={student.status} result={transactions} query={query} /></ContentWrapper>;
}
