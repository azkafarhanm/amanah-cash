import { ContentWrapper, SectionHeader } from "@/components/ui";
import { TransactionWorkspaceView } from "@/components/transactions/workspace";

export default function TransactionsWorkspacePage() {
  return (
    <ContentWrapper>
      <SectionHeader
        title="Workspace Transaksi"
        description="Kelola dan pantau seluruh transaksi siswa dalam satu ruang kerja operasional."
      />
      <TransactionWorkspaceView />
    </ContentWrapper>
  );
}
