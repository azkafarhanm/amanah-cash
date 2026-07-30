import Link from "next/link";
import { ContentWrapper, EmptyState, Pagination, SectionHeader, StatusBadge } from "@/components/ui";
import { operatorManagement } from "@/operators/service";
import styles from "./operators.module.css";
import { protectRoute } from "@/authorization/routes";
import { readCurrentDefaultPageSize } from "@/settings/service";

type Props = { searchParams: Promise<{ search?: string; status?: string; page?: string; pageSize?: string; notice?: string }> };
const date = (value: Date | null) => value ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(value) : "Belum pernah";

export default async function OperatorsPage({ searchParams }: Props) {
  const [query, user] = await Promise.all([searchParams, protectRoute("admin")]);
  const defaultPageSize = await readCurrentDefaultPageSize(user.id);
  const result = await operatorManagement().list({ ...query, pageSize: query.pageSize ?? defaultPageSize });
  const filtered = Boolean(query.search || query.status);
  const href = (page: number) => `/admin/operators?${new URLSearchParams({ ...(query.search ? { search: query.search } : {}), ...(query.status ? { status: query.status } : {}), ...(query.pageSize ? { pageSize: query.pageSize } : {}), page: String(page) })}`;
  return <ContentWrapper>
    <SectionHeader title="Operator" description="Kelola akun Google Operator tanpa akses ke data keuangan." action={<Link className={styles.button} href="/admin/operators/new">Tambah Operator</Link>} />
    {query.notice ? <p className={styles.message}>{query.notice}</p> : null}
    <form className={styles.toolbar} method="get">
      {query.pageSize ? <input type="hidden" name="pageSize" value={query.pageSize} /> : null}
      <label className={styles.field}>Cari nama atau email<input className={styles.input} name="search" defaultValue={query.search} /></label>
      <label className={styles.field}>Status<select className={styles.select} name="status" defaultValue={query.status ?? ""}><option value="">Semua</option><option value="active">Aktif</option><option value="inactive">Tidak aktif</option></select></label>
      <button className={styles.button} type="submit">Terapkan</button>
    </form>
    {result.items.length === 0 ? <EmptyState title={filtered ? "Tidak ada hasil yang cocok" : "Belum ada Operator terdaftar"} description={filtered ? "Tidak ada Operator yang cocok dengan pencarian atau filter saat ini. Ubah atau reset filter untuk melihat data lainnya." : "Tambahkan akun Operator pertama. Akun baru tetap tidak aktif sampai Anda mengaktifkannya."} /> : <>
      <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Nama</th><th>Email Google</th><th>Status</th><th>Dibuat</th><th>Login terakhir</th><th>Siswa</th></tr></thead><tbody>{result.items.map((operator) => <tr key={operator.id}><td data-label="Nama"><Link className={styles.link} href={`/admin/operators/${operator.id}`}>{operator.name}</Link></td><td data-label="Email Google">{operator.email}</td><td data-label="Status"><StatusBadge tone={operator.isActive ? "success" : "neutral"}>{operator.isActive ? "Aktif" : "Tidak aktif"}</StatusBadge></td><td data-label="Dibuat">{date(operator.createdAt)}</td><td data-label="Login terakhir">{date(operator.lastLoginAt)}</td><td data-label="Siswa">{operator.assignedStudentCount}</td></tr>)}</tbody></table></div>
      <Pagination ariaLabel="Paginasi Operator" page={result.page} pages={result.pages} totalLabel={`${result.total} Operator`} previousHref={result.page > 1 ? href(result.page - 1) : undefined} nextHref={result.page < result.pages ? href(result.page + 1) : undefined} />
    </>}
  </ContentWrapper>;
}
