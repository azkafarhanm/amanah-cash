import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FinancialAuditTimeline } from "@/components/financial-assurance/financial-audit-timeline";
import { ReconciliationResultCard } from "@/components/financial-assurance/reconciliation-result";
import { ContentWrapper, SectionHeader } from "@/components/ui";
import styles from "@/components/financial-assurance/financial-assurance.module.css";

export default async function StudentReconciliationPage({
  params
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  return (
    <ContentWrapper>
      <Link className={styles.backLink} href="/operator/reconciliation">
        <ArrowLeft size={16} /> Kembali ke daftar Siswa
      </Link>
      <SectionHeader
        title="Pemeriksaan Keuangan"
        description="Bandingkan saldo tersimpan dengan seluruh transaksi aktif di Amanah Cash."
      />
      <ReconciliationResultCard studentId={studentId} />
      <FinancialAuditTimeline studentId={studentId} />
    </ContentWrapper>
  );
}
