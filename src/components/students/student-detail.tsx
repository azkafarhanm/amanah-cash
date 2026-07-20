import { StudentStatusBadge, studentDate } from "./presentation";
import type { StudentRecord } from "@/students/domain";
import styles from "./students.module.css";

export function StudentDetail({ student }: { student: StudentRecord }) {
  return <><section className={`${styles.detail} ${styles.panel}`} aria-labelledby="student-information"><h2 id="student-information">Informasi dasar</h2><dl className={styles.definition}><div><dt>Nama</dt><dd>{student.name}</dd></div><div><dt>Operator</dt><dd>{student.operator.name}<br />{student.operator.email}</dd></div><div><dt>Status</dt><dd><StudentStatusBadge status={student.status} /></dd></div><div><dt>Dibuat</dt><dd>{studentDate(student.createdAt)}</dd></div><div><dt>Diperbarui</dt><dd>{studentDate(student.updatedAt)}</dd></div><div><dt>Catatan</dt><dd>{student.notes ?? "Tidak ada catatan"}</dd></div></dl></section><section className={styles.panel} aria-labelledby="financial-placeholder"><h2 id="financial-placeholder">Ringkasan keuangan</h2><p className={styles.placeholder}>Ringkasan keuangan belum tersedia. Modul ini tidak menghitung saldo dan tidak menampilkan transaksi.</p></section></>;
}
