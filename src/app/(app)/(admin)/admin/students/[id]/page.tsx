import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentWrapper, SectionHeader } from "@/components/ui";
import { StudentDetail } from "@/components/students/student-detail";
import { studentManagement } from "@/students/service";
import { StudentManagementError } from "@/students/domain";
import { editStudentAction } from "../actions";
import styles from "@/components/students/students.module.css";

export default async function AdminStudentDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; notice?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]); const service = studentManagement();
  const student = await service.detail(id, { kind: "admin" }).catch((error: unknown) => {
    if (error instanceof StudentManagementError && error.code === "NOT_FOUND") notFound();
    throw error;
  });
  const operators = await service.activeOperators(); const edit = editStudentAction.bind(null, id);
  return <ContentWrapper><SectionHeader title={student.name} description="Kelola data dan kepemilikan Siswa tanpa fitur keuangan." action={<Link className={styles.link} href="/admin/students">Kembali</Link>} />{query.notice ? <p className={styles.message}>{query.notice}</p> : null}{query.error ? <p className={styles.error} role="alert">{query.error}</p> : null}<StudentDetail student={student} /><form action={edit} className={`${styles.form} ${styles.panel}`}><h2>Edit Siswa</h2><label className={styles.field}>Nama lengkap<input className={styles.input} name="name" defaultValue={student.name} required maxLength={100} /></label><label className={styles.field}>Operator<select className={styles.select} name="operatorId" defaultValue={student.operator.id} required>{operators.map((operator) => <option key={operator.id} value={operator.id}>{operator.name} · {operator.email}</option>)}</select></label><label className={styles.field}>Alasan perpindahan Operator<textarea className={styles.textarea} name="ownershipTransferReason" maxLength={500} aria-describedby="ownership-transfer-hint" /><span id="ownership-transfer-hint">Wajib diisi hanya jika Operator diubah. Alasan dicatat dalam audit kepemilikan.</span></label><label className={styles.field}>Status<select className={styles.select} name="status" defaultValue={student.status}><option value="ACTIVE">Aktif</option><option value="INACTIVE">Tidak aktif</option><option value="ARCHIVED">Diarsipkan</option></select></label><label className={styles.field}>Catatan<textarea className={styles.textarea} name="notes" defaultValue={student.notes ?? ""} maxLength={500} /></label><button className={styles.button} type="submit">Simpan perubahan</button></form></ContentWrapper>;
}
