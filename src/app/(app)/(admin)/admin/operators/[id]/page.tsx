import { notFound } from "next/navigation";
import { BackButton, ContentWrapper, SectionHeader, StatusBadge } from "@/components/ui";
import { OperatorForm } from "@/components/admin-forms/operator-form";
import { OperatorManagementError } from "@/operators/domain";
import { operatorManagement } from "@/operators/service";
import { deleteOperatorAction, editOperatorAction } from "../actions";
import styles from "../operators.module.css";
import { DeleteOperatorForm } from "@/components/admin-forms/delete-operator-form";

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
    <SectionHeader title={operator.name} description="Profil akun Operator. Halaman ini tidak memuat informasi keuangan." action={<BackButton href="/admin/operators">Kembali ke Operator</BackButton>} />
    {query.notice ? <p className={styles.message}>{query.notice}</p> : null}{query.error ? <p className={styles.error} role="alert">{query.error}</p> : null}
    <section className={`${styles.detail} ${styles.panel}`} aria-labelledby="profile-title"><h2 id="profile-title">Profil</h2><dl className={styles.definition}><div><dt>Email Google</dt><dd>{operator.email}</dd></div><div><dt>Status</dt><dd><StatusBadge tone={operator.isActive ? "success" : "neutral"}>{operator.isActive ? "Aktif" : "Tidak aktif"}</StatusBadge></dd></div><div><dt>Siswa ditugaskan</dt><dd>{operator.assignedStudentCount}</dd></div><div><dt>Login terakhir</dt><dd>{dateTime(operator.lastLoginAt)}</dd></div><div><dt>Dibuat</dt><dd>{dateTime(operator.createdAt)}</dd></div></dl></section>
    <OperatorForm action={edit} initialValues={{ name: operator.name, email: operator.email, isActive: operator.isActive }} mode="edit" styles={styles} />
    <section className={`${styles.audit} ${styles.panel}`} aria-labelledby="audit-title"><h2 id="audit-title">Ringkasan audit</h2>{audit.length ? audit.map((item, index) => <div className={styles.auditItem} key={`${item.createdAt.toISOString()}-${index}`}><p><strong>{item.action}</strong> · {dateTime(item.createdAt)}</p><p>{item.summary}</p></div>) : <p>Belum ada perubahan administratif yang tercatat untuk Operator ini.</p>}</section>
    <DeleteOperatorForm action={remove} className={styles.panel} buttonClassName={styles.danger} />
  </ContentWrapper>;
}
