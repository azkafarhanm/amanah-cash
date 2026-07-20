import Link from "next/link";
import { ContentWrapper, SectionHeader } from "@/components/ui";
import { createOperatorAction } from "../actions";
import styles from "../operators.module.css";

export default async function NewOperatorPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams;
  return <ContentWrapper>
    <SectionHeader title="Tambah Operator" description="Akun dibuat tidak aktif. Aktifkan setelah akun Google siap digunakan." />
    {query.error ? <p className={styles.error} role="alert">{query.error}</p> : null}
    <form action={createOperatorAction} className={`${styles.form} ${styles.panel}`}>
      <label className={styles.field}>Nama lengkap<input className={styles.input} name="name" required minLength={2} maxLength={100} autoComplete="name" /></label>
      <label className={styles.field}>Email Google<input className={styles.input} name="email" required type="email" maxLength={254} autoComplete="email" /></label>
      <div className={styles.actions}><Link className={styles.link} href="/admin/operators">Batal</Link><button className={styles.button} type="submit">Buat Operator</button></div>
    </form>
  </ContentWrapper>;
}
