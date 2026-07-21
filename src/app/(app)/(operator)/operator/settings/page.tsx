import Link from "next/link";
import { ContentWrapper, FeaturePlaceholder, SectionHeader } from "@/components/ui";

export default function OperatorSettingsPage() {
  return (
    <ContentWrapper>
      <SectionHeader title="Pengaturan" description="Preferensi ruang kerja Operator." />
      <FeaturePlaceholder
        title="Pengaturan Operator"
        description="Preferensi akun dan ruang kerja akan tersedia pada fase penyempurnaan berikutnya."
        status="PLANNED"
        action={<Link href="/operator">Kembali ke Dashboard</Link>}
      />
    </ContentWrapper>
  );
}
