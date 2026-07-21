import Link from "next/link";
import { EmptyState } from "@/components/ui";
import type { StudentRecord } from "@/students/domain";
import type { StudentFinancialSummary } from "@/transactions/read-service";
import { rupiah } from "@/components/transactions/presentation";
import { StudentStatusBadge, studentDate } from "./presentation";
import styles from "./students.module.css";

export function StudentList({ result, query, basePath, scope, financialSummaries }: {
  result: { items: StudentRecord[]; total: number; page: number; pages: number };
  query: { search?: string; status?: string };
  basePath: string;
  scope: "admin" | "operator";
  financialSummaries?: Record<string, StudentFinancialSummary>;
}) {
  const href = (page: number) => `${basePath}?${new URLSearchParams({ ...(query.search ? { search: query.search } : {}), ...(query.status ? { status: query.status } : {}), page: String(page) })}`;
  const filtered = Boolean(query.search || query.status);
  const emptyCopy = filtered
    ? { title: "Tidak ada hasil yang cocok", description: "Tidak ada Siswa yang cocok dengan pencarian atau filter saat ini. Ubah atau reset filter untuk melihat data lainnya." }
    : scope === "operator"
      ? { title: "Belum ada Siswa yang ditugaskan", description: "Administrator Platform belum menugaskan Siswa kepada akun Operator Anda." }
      : { title: "Belum ada Siswa terdaftar", description: "Tambahkan Siswa pertama dan pilih Operator aktif untuk memulai penugasan." };
  return <>
    <form className={styles.toolbar} method="get"><label className={styles.field}>Cari Siswa atau Operator<input className={styles.input} name="search" defaultValue={query.search} /></label><label className={styles.field}>Status<select className={styles.select} name="status" defaultValue={query.status ?? ""}><option value="">Semua</option><option value="ACTIVE">Aktif</option><option value="INACTIVE">Tidak aktif</option><option value="ARCHIVED">Diarsipkan</option></select></label><button className={styles.button} type="submit">Terapkan</button></form>
    {result.items.length === 0 ? <EmptyState kind="students" {...emptyCopy} /> : <><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Nama Siswa</th><th>Operator</th><th>Status</th>{scope === "operator" ? <th>Saldo saat ini</th> : null}<th>Dibuat</th></tr></thead><tbody>{result.items.map((student) => {
      const financial = financialSummaries?.[student.id];
      return <tr key={student.id}><td data-label="Nama Siswa"><Link className={styles.link} href={`${basePath}/${student.id}`}>{student.name}</Link></td><td data-label="Operator">{student.operator.name}</td><td data-label="Status"><StudentStatusBadge status={student.status} /></td>{scope === "operator" ? <td data-label="Saldo saat ini"><span className={styles.balance}><strong>{rupiah(financial?.balance ?? "0")}</strong><small>{financial?.transactionCount ? `${financial.transactionCount.toLocaleString("id-ID")} transaksi tercatat` : "Belum ada transaksi tercatat"}</small></span></td> : null}<td data-label="Dibuat">{studentDate(student.createdAt)}</td></tr>;
    })}</tbody></table></div><nav className={styles.pagination} aria-label="Paginasi"><span>Halaman {result.page} dari {result.pages} · {result.total} Siswa</span><div>{result.page > 1 ? <Link className={styles.link} href={href(result.page - 1)}>Sebelumnya</Link> : null} {result.page < result.pages ? <Link className={styles.link} href={href(result.page + 1)}>Berikutnya</Link> : null}</div></nav></>}
  </>;
}
