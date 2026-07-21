import Link from "next/link";
import { ContentWrapper, EmptyState, SectionHeader, StatusBadge } from "@/components/ui";
import { operatorManagement } from "@/operators/service";
import styles from "./operators.module.css";

type Props = { searchParams: Promise<{ search?: string; status?: string; page?: string; notice?: string }> };
const date = (value: Date | null) => value ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(value) : "Belum pernah";

export default async function OperatorsPage({ searchParams }: Props) {
  const query = await searchParams;
  const result = await operatorManagement().list(query);
  const filtered = Boolean(query.search || query.status);
  const href = (page: number) => `/admin/operators?${new URLSearchParams({ ...(query.search ? { search: query.search } : {}), ...(query.status ? { status: query.status } : {}), page: String(page) })}`;
  return <ContentWrapper>
    <SectionHeader title="Operator" description="Kelola akun Google Operator tanpa akses ke data keuangan." action={<Link className={styles.button} href="/admin/operators/new">Tambah Operator</Link>} />
    {query.notice ? <p className={styles.message}>{query.notice}</p> : null}
    <form className={styles.toolbar} method="get">
      <label className={styles.field}>Cari nama atau email<input className={styles.input} name="search" defaultValue={query.search} /></label>
      <label className={styles.field}>Status<select className={styles.select} name="status" defaultValue={query.status ?? ""}><option value="">Semua</option><option value="active">Aktif</option><option value="inactive">Tidak aktif</option></select></label>
      <button className={styles.button} type="submit">Terapkan</button>
    </form>
    {result.items.length === 0 ? <EmptyState title={filtered ? "Tidak ada hasil yang cocok" : "Belum ada Operator terdaftar"} description={filtered ? "Tidak ada Operator yang cocok dengan pencarian atau filter saat ini. Ubah atau reset filter untuk melihat data lainnya." : "Tambahkan akun Operator pertama. Akun baru tetap tidak aktif sampai Anda mengaktifkannya."} /> : <>
      <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Nama</th><th>Email Google</th><th>Status</th><th>Dibuat</th><th>Login terakhir</th><th>Siswa</th></tr></thead><tbody>{result.items.map((operator) => <tr key={operator.id}><td data-label="Nama"><Link className={styles.link} href={`/admin/operators/${operator.id}`}>{operator.name}</Link></td><td data-label="Email Google">{operator.email}</td><td data-label="Status"><StatusBadge tone={operator.isActive ? "success" : "neutral"}>{operator.isActive ? "Aktif" : "Tidak aktif"}</StatusBadge></td><td data-label="Dibuat">{date(operator.createdAt)}</td><td data-label="Login terakhir">{date(operator.lastLoginAt)}</td><td data-label="Siswa">{operator.assignedStudentCount}</td></tr>)}</tbody></table></div>
      <nav className={styles.pagination} aria-label="Paginasi"><span>Halaman {result.page} dari {result.pages} · {result.total} Operator</span><div className={styles.actions}>{result.page > 1 ? <Link className={styles.link} href={href(result.page - 1)}>Sebelumnya</Link> : null}{result.page < result.pages ? <Link className={styles.link} href={href(result.page + 1)}>Berikutnya</Link> : null}</div></nav>
    </>}
  </ContentWrapper>;
}
