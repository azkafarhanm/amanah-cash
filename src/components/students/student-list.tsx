import Link from "next/link";
import { EmptyState } from "@/components/ui";
import type { StudentRecord } from "@/students/domain";
import { StudentStatusBadge, studentDate } from "./presentation";
import styles from "./students.module.css";

export function StudentList({ result, query, basePath }: { result: { items: StudentRecord[]; total: number; page: number; pages: number }; query: { search?: string; status?: string }; basePath: string }) {
  const href = (page: number) => `${basePath}?${new URLSearchParams({ ...(query.search ? { search: query.search } : {}), ...(query.status ? { status: query.status } : {}), page: String(page) })}`;
  return <>
    <form className={styles.toolbar} method="get"><label className={styles.field}>Cari Siswa atau Operator<input className={styles.input} name="search" defaultValue={query.search} /></label><label className={styles.field}>Status<select className={styles.select} name="status" defaultValue={query.status ?? ""}><option value="">Semua</option><option value="ACTIVE">Aktif</option><option value="INACTIVE">Tidak aktif</option><option value="ARCHIVED">Diarsipkan</option></select></label><button className={styles.button} type="submit">Terapkan</button></form>
    {result.items.length === 0 ? <EmptyState title="Belum ada Siswa" description="Tidak ada Siswa yang sesuai dengan pencarian dan hak akses Anda." /> : <><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Nama Siswa</th><th>Operator</th><th>Status</th><th>Saldo saat ini</th><th>Dibuat</th></tr></thead><tbody>{result.items.map((student) => <tr key={student.id}><td><Link className={styles.link} href={`${basePath}/${student.id}`}>{student.name}</Link></td><td>{student.operator.name}</td><td><StudentStatusBadge status={student.status} /></td><td>Belum tersedia</td><td>{studentDate(student.createdAt)}</td></tr>)}</tbody></table></div><nav className={styles.pagination} aria-label="Paginasi"><span>Halaman {result.page} dari {result.pages} · {result.total} Siswa</span><div>{result.page > 1 ? <Link className={styles.link} href={href(result.page - 1)}>Sebelumnya</Link> : null} {result.page < result.pages ? <Link className={styles.link} href={href(result.page + 1)}>Berikutnya</Link> : null}</div></nav></>}
  </>;
}
