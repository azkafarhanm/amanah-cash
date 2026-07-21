import Link from "next/link";
import { ContentWrapper, FeaturePlaceholder, SectionHeader } from "@/components/ui";

export default function AdminSettingsPage() {
  return (
    <ContentWrapper>
      <SectionHeader title="Pengaturan" description="Konfigurasi platform yang direncanakan." />
      <FeaturePlaceholder
        title="Pengaturan Platform"
        description="Konfigurasi platform akan tersedia setelah kebutuhan deployment dan operasional disetujui."
        status="PLANNED"
        estimatedAvailability="Fase kesiapan produksi"
        action={<Link href="/admin">Kembali ke Dashboard</Link>}
      />
    </ContentWrapper>
  );
}
