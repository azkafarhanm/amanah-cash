import Link from "next/link";
import { ContentWrapper, SectionHeader } from "@/components/ui";
import { studentManagement } from "@/students/service";
import { createStudentAction } from "../actions";
import styles from "@/components/students/students.module.css";

export default async function NewStudentPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [query, operators] = await Promise.all([searchParams, studentManagement().activeOperators()]);
  return <ContentWrapper><SectionHeader title="Tambah Siswa" description="Setiap Siswa wajib ditugaskan kepada satu Operator aktif." />{query.error ? <p className={styles.error} role="alert">{query.error}</p> : null}<form action={createStudentAction} className={`${styles.form} ${styles.panel}`}><label className={styles.field}>Nama lengkap<input className={styles.input} name="name" required maxLength={100} /></label><label className={styles.field}>Operator<select className={styles.select} name="operatorId" required defaultValue=""><option value="" disabled>Pilih Operator aktif</option>{operators.map((operator) => <option key={operator.id} value={operator.id}>{operator.name} · {operator.email}</option>)}</select></label><label className={styles.field}>Status<select className={styles.select} name="status" defaultValue="ACTIVE"><option value="ACTIVE">Aktif</option><option value="INACTIVE">Tidak aktif</option><option value="ARCHIVED">Diarsipkan</option></select></label><label className={styles.field}>Catatan (opsional)<textarea className={styles.textarea} name="notes" maxLength={500} /></label><div className={styles.actions}><Link className={styles.link} href="/admin/students">Batal</Link><button className={styles.button} type="submit" disabled={!operators.length}>Buat Siswa</button></div>{!operators.length ? <p className={styles.error}>Aktifkan setidaknya satu Operator sebelum membuat Siswa.</p> : null}</form></ContentWrapper>;
}
