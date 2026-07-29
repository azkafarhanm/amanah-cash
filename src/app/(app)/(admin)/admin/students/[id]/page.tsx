import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentWrapper, SectionHeader } from "@/components/ui";
import { StudentForm } from "@/components/admin-forms/student-form";
import { StudentDetail } from "@/components/students/student-detail";
import { studentManagement } from "@/students/service";
import { StudentManagementError } from "@/students/domain";
import { editStudentAction } from "../actions";
import styles from "@/components/students/students.module.css";

export default async function AdminStudentDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ notice?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]); const service = studentManagement();
  const student = await service.detail(id, { kind: "admin" }).catch((error: unknown) => {
    if (error instanceof StudentManagementError && error.code === "NOT_FOUND") notFound();
    throw error;
  });
  const operators = await service.activeOperators(); const edit = editStudentAction.bind(null, id);
  return <ContentWrapper><SectionHeader title={student.name} description="Kelola data dan kepemilikan Siswa tanpa fitur keuangan." action={<Link className={styles.link} href="/admin/students">Kembali</Link>} />{query.notice ? <p className={styles.message}>{query.notice}</p> : null}<StudentDetail student={student} /><StudentForm action={edit} initialValues={{ name: student.name, operatorId: student.operator.id, status: student.status, notes: student.notes ?? "", ownershipTransferReason: "" }} mode="edit" operators={operators} styles={styles} /></ContentWrapper>;
}
