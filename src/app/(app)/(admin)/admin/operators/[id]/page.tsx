import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentWrapper, SectionHeader, StatusBadge } from "@/components/ui";
import { OperatorManagementError } from "@/operators/domain";
import { operatorManagement } from "@/operators/service";
import { deleteOperatorAction, editOperatorAction } from "../actions";
import styles from "../operators.module.css";

const dateTime = (value: Date | null) => value ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(value) : "Belum pernah";

export default async function OperatorDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; notice?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const service = operatorManagement();
  const operator = await service.detail(id).catch((error: unknown) => {
    if (error instanceof OperatorManagementError && error.code === "NOT_FOUND") notFound();
    throw error;
  });
  const audit = await service.audits(id);
  const edit = editOperatorAction.bind(null, id);
  const remove = deleteOperatorAction.bind(null, id);
  return <ContentWrapper>
    <SectionHeader title={operator.name} description="Profil akun Operator. Halaman ini tidak memuat informasi keuangan." action={<Link className={styles.link} href="/admin/operators">Kembali</Link>} />
    {query.notice ? <p className={styles.message}>{query.notice}</p> : null}{query.error ? <p className={styles.error} role="alert">{query.error}</p> : null}
    <section className={`${styles.detail} ${styles.panel}`} aria-labelledby="profile-title"><h2 id="profile-title">Profil</h2><dl className={styles.definition}><div><dt>Email Google</dt><dd>{operator.email}</dd></div><div><dt>Status</dt><dd><StatusBadge tone={operator.isActive ? "success" : "neutral"}>{operator.isActive ? "Aktif" : "Tidak aktif"}</StatusBadge></dd></div><div><dt>Siswa ditugaskan</dt><dd>{operator.assignedStudentCount}</dd></div><div><dt>Login terakhir</dt><dd>{dateTime(operator.lastLoginAt)}</dd></div><div><dt>Dibuat</dt><dd>{dateTime(operator.createdAt)}</dd></div></dl></section>
    <form action={edit} className={`${styles.form} ${styles.panel}`}><h2>Edit Operator</h2><label className={styles.field}>Nama lengkap<input className={styles.input} name="name" defaultValue={operator.name} required minLength={2} maxLength={100} /></label><label className={styles.field}><span>Status aktif</span><input name="isActive" type="checkbox" defaultChecked={operator.isActive} /> Operator dapat masuk setelah akun Google diprovisikan.</label><button className={styles.button} type="submit">Simpan perubahan</button></form>
    <section className={`${styles.audit} ${styles.panel}`} aria-labelledby="audit-title"><h2 id="audit-title">Ringkasan audit</h2>{audit.length ? audit.map((item, index) => <div className={styles.auditItem} key={`${item.createdAt.toISOString()}-${index}`}><p><strong>{item.action}</strong> · {dateTime(item.createdAt)}</p><p>{item.summary}</p></div>) : <p>Belum ada perubahan administratif yang tercatat untuk Operator ini.</p>}</section>
    <form action={remove} className={styles.panel}><h2>Hapus Operator</h2><p>Hanya dapat dilakukan bila tidak ada Siswa yang ditugaskan. Identitas historis dan audit tetap dipertahankan.</p><button className={styles.danger} type="submit">Hapus Operator</button></form>
  </ContentWrapper>;
}
