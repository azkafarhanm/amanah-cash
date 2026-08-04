import Link from "next/link";
import { StudentAvatar } from "@/components/students/student-avatar";
import type { OperatorDashboardResult } from "@/dashboard/types";
import styles from "./dashboard-v2.module.css";

const statusLabel = { ACTIVE: "Aktif", INACTIVE: "Tidak aktif", ARCHIVED: "Diarsipkan" } as const;

export function RecentStudents({ students }: { students: OperatorDashboardResult["recentlyUpdatedStudents"] }) {
  return <section className={styles.chartContainer} aria-labelledby="recent-students-title">
    <h3 className={styles.chartTitle} id="recent-students-title">Siswa Terbaru</h3>
    {students.length ? <div className={styles.recentStudents}>
      {students.map((student) => <Link className={styles.recentStudent} href={`/operator/students/${encodeURIComponent(student.id)}`} key={student.id}>
        <StudentAvatar studentId={student.id} name={student.name} photoObjectKey={student.photoObjectKey} photoUpdatedAt={student.photoUpdatedAt} scope="operator" size="dashboard" />
        <span className={styles.recentStudentName}>{student.name}</span>
        <span className={styles.recentStudentStatus}>{statusLabel[student.status]}</span>
      </Link>)}
    </div> : <p className={styles.attentionEmpty}>Belum ada Siswa</p>}
  </section>;
}
