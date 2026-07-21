import Link from "next/link";
import { ContentWrapper, FeaturePlaceholder, SectionHeader } from "@/components/ui";

export default function ReportsPage() {
  return (
    <ContentWrapper>
      <SectionHeader title="Laporan" description="Pelaporan keuangan terkontrol untuk data yang Anda kelola." />
      <FeaturePlaceholder
        title="Modul Laporan"
        description="Laporan dan ekspor merupakan bagian roadmap setelah rekonsiliasi serta pembacaan audit keuangan selesai."
        status="PLANNED"
        estimatedAvailability="Setelah milestone rekonsiliasi dan audit keuangan"
        action={<Link href="/operator">Kembali ke Dashboard</Link>}
      />
    </ContentWrapper>
  );
}
