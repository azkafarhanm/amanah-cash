import { BackButton, ContentWrapper } from "@/components/ui";
import { StudentDetailHeader } from "@/components/students/student-detail-header";
import { StudentDetail } from "@/components/students/student-detail";
import { protectOwnership } from "@/authorization/routes";
import { studentManagement } from "@/students/service";
import { TransactionExperience } from "@/components/transactions/transaction-experience";
import { transactionReadService, type TransactionHistoryQuery } from "@/transactions/read-service";
import { ArchivedStudentBanner, StudentArchiveSection } from "@/components/students/student-archive";
import styles from "@/components/students/students.module.css";
import { archiveOperatorStudentAction, restoreOperatorStudentAction } from "../actions";

export default async function OperatorStudentDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<TransactionHistoryQuery & { notice?: string; error?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]); const operator = await protectOwnership(id);
  const [student, transactions] = await Promise.all([
    studentManagement().detail(id, { kind: "operator", operatorId: operator.id }),
    transactionReadService().history(id, operator.id, query)
  ]);
  const archived = student.status === "ARCHIVED";
  return <ContentWrapper>
    <StudentDetailHeader student={student} scope="operator" description="Saldo dan riwayat transaksi Siswa yang ditugaskan kepada Anda." action={<BackButton href="/operator/students">Kembali ke Siswa Saya</BackButton>} />
    {query.notice ? <p className={styles.message} role="status">{query.notice}</p> : null}
    {query.error ? <p className={styles.error} role="alert">{query.error}</p> : null}
    {archived ? <ArchivedStudentBanner archivedAt={student.archivedAt ? student.archivedAt.toISOString() : null} restoreAction={restoreOperatorStudentAction.bind(null, id)} /> : null}
    <StudentDetail student={student} />
    <TransactionExperience studentId={id} studentStatus={student.status} result={transactions} query={query} />
    {archived ? null : <StudentArchiveSection studentName={student.name} balance={student.balance ?? "0"} archiveAction={archiveOperatorStudentAction.bind(null, id)} />}
  </ContentWrapper>;
}
