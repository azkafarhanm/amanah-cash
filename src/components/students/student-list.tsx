"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { EmptyState, Pagination } from "@/components/ui";
import type { StudentRecord } from "@/students/domain";
import type { StudentFinancialSummary } from "@/transactions/read-service";
import { rupiah } from "@/components/transactions/presentation";
import { StudentStatusBadge, studentDate } from "./presentation";
import styles from "./students.module.css";

export function StudentList({
  result,
  query,
  basePath,
  scope,
  financialSummaries,
  showFinancialSummary = scope === "operator",
  showStatusFilter = true,
  searchLabel = "Cari Siswa atau Operator",
  searchPlaceholder = "Cari nama Siswa atau Operator..."
}: {
  result: { items: StudentRecord[]; total: number; page: number; pages: number; pageSize?: number };
  query: { search?: string; status?: string; pageSize?: string };
  basePath: string;
  scope: "admin" | "operator";
  financialSummaries?: Record<string, StudentFinancialSummary>;
  showFinancialSummary?: boolean;
  showStatusFilter?: boolean;
  searchLabel?: string;
  searchPlaceholder?: string;
}) {
  const router = useRouter();
  const [prevQuerySearch, setPrevQuerySearch] = useState(query.search);
  const [searchValue, setSearchValue] = useState(query.search ?? "");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  if (query.search !== prevQuerySearch) {
    setPrevQuerySearch(query.search);
    setSearchValue(query.search ?? "");
  }

  function updateParams(newSearch: string, newStatus = query.status) {
    const params = new URLSearchParams();
    if (newSearch.trim()) params.set("search", newSearch.trim());
    if (newStatus) params.set("status", newStatus);
    if (query.pageSize) params.set("pageSize", query.pageSize);
    const queryString = params.toString();
    const target = queryString ? `${basePath}?${queryString}` : basePath;
    router.replace(target, { scroll: false });
  }

  function handleSearchChange(text: string) {
    setSearchValue(text);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (text === "") {
      updateParams("");
    } else {
      timerRef.current = setTimeout(() => {
        updateParams(text);
      }, 350);
    }
  }

  const href = (page: number) => `${basePath}?${new URLSearchParams({ ...(query.search ? { search: query.search } : {}), ...(query.status ? { status: query.status } : {}), ...(query.pageSize ? { pageSize: query.pageSize } : {}), page: String(page) })}`;
  const filtered = Boolean(query.search || query.status);
  const emptyCopy = filtered
    ? { title: "Tidak ada hasil yang cocok", description: "Tidak ada Siswa yang cocok dengan pencarian atau filter saat ini. Ubah atau reset filter untuk melihat data lainnya." }
    : scope === "operator"
      ? { title: "Belum ada Siswa yang ditugaskan", description: "Administrator Platform belum menugaskan Siswa kepada akun Operator Anda." }
      : { title: "Belum ada Siswa terdaftar", description: "Tambahkan Siswa pertama dan pilih Operator aktif untuk memulai penugasan." };
  return <>
    <form className={styles.toolbar} method="get" onSubmit={(e) => { e.preventDefault(); updateParams(searchValue); }}>
      <label className={styles.field}>
        {searchLabel}
        <input
          className={styles.input}
          name="search"
          value={searchValue}
          placeholder={searchPlaceholder}
          onChange={(e) => handleSearchChange(e.target.value)}
          autoComplete="off"
        />
      </label>
      {showStatusFilter ? <label className={styles.field}>
        Status
        <select
          className={styles.select}
          name="status"
          defaultValue={query.status ?? ""}
          onChange={(e) => updateParams(searchValue, e.target.value)}
        >
          <option value="">Semua</option>
          <option value="ACTIVE">Aktif</option>
          <option value="INACTIVE">Tidak aktif</option>
          <option value="ARCHIVED">Diarsipkan</option>
        </select>
      </label> : null}
      <button className={styles.button} type="submit">Terapkan</button>
    </form>
    {result.items.length === 0 ? <EmptyState kind="students" {...emptyCopy} /> : <><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Nama Siswa</th><th>Operator</th><th>Status</th>{showFinancialSummary ? <th>Saldo saat ini</th> : null}<th>Dibuat</th></tr></thead><tbody>{result.items.map((student) => {
      const financial = financialSummaries?.[student.id];
      return <tr key={student.id}><td data-label="Nama Siswa"><Link className={styles.link} href={`${basePath}/${student.id}`}>{student.name}</Link></td><td data-label="Operator">{student.operator.name}</td><td data-label="Status"><StudentStatusBadge status={student.status} /></td>{showFinancialSummary ? <td data-label="Saldo saat ini"><span className={styles.balance}><strong>{rupiah(financial?.balance ?? "0")}</strong><small>{financial?.transactionCount ? `${financial.transactionCount.toLocaleString("id-ID")} transaksi tercatat` : "Belum ada transaksi tercatat"}</small></span></td> : null}<td data-label="Dibuat">{studentDate(student.createdAt)}</td></tr>;
    })}</tbody></table></div><Pagination ariaLabel="Paginasi Siswa" page={result.page} pages={result.pages} totalLabel={`${result.total} Siswa`} previousHref={result.page > 1 ? href(result.page - 1) : undefined} nextHref={result.page < result.pages ? href(result.page + 1) : undefined} /></>}
  </>;
}
