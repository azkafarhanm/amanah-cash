import { FinancialAuditTimeline } from "@/components/financial-assurance/financial-audit-timeline";
import { ReconciliationResultCard } from "@/components/financial-assurance/reconciliation-result";
import { BackButton, ContentWrapper, SectionHeader } from "@/components/ui";

export default async function StudentReconciliationPage({
  params
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  return (
    <ContentWrapper>
      <SectionHeader
        title="Pemeriksaan Keuangan"
        description="Bandingkan saldo tersimpan dengan seluruh transaksi aktif di Amanah Cash."
        action={<BackButton href="/operator/reconciliation">Kembali ke Pemeriksaan</BackButton>}
      />
      <ReconciliationResultCard studentId={studentId} />
      <FinancialAuditTimeline studentId={studentId} />
    </ContentWrapper>
  );
}
