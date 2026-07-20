import Link from "next/link";
import { ContentWrapper, SectionHeader } from "@/components/ui";
import { StudentDetail } from "@/components/students/student-detail";
import { requireOwnership } from "@/authorization";
import { studentManagement } from "@/students/service";
import styles from "@/components/students/students.module.css";

export default async function OperatorStudentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const operator = await requireOwnership(id);
  const student = await studentManagement().detail(id, { kind: "operator", operatorId: operator.id });
  return <ContentWrapper><SectionHeader title={student.name} description="Detail Siswa yang ditugaskan kepada Anda." action={<Link className={styles.link} href="/operator/students">Kembali</Link>} /><StudentDetail student={student} /></ContentWrapper>;
}
