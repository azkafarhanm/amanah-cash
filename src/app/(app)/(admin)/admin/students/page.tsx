import Link from "next/link";
import { ContentWrapper, SectionHeader } from "@/components/ui";
import { StudentList } from "@/components/students/student-list";
import { studentManagement } from "@/students/service";
import styles from "@/components/students/students.module.css";
import { protectRoute } from "@/authorization/routes";
import { readCurrentDefaultPageSize } from "@/settings/service";

export default async function AdminStudentsPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string; page?: string; pageSize?: string; notice?: string }> }) {
  const [query, user] = await Promise.all([searchParams, protectRoute("admin")]);
  const defaultPageSize = await readCurrentDefaultPageSize(user.id);
  const result = await studentManagement().list({ kind: "admin" }, { ...query, pageSize: query.pageSize ?? defaultPageSize });
  return <ContentWrapper><SectionHeader title="Siswa" description="Kelola identitas, status, dan penugasan Operator Siswa." action={<Link className={styles.button} href="/admin/students/new">Tambah Siswa</Link>} />{query.notice ? <p className={styles.message}>{query.notice}</p> : null}<StudentList result={result} query={query} basePath="/admin/students" scope="admin" /></ContentWrapper>;
}
