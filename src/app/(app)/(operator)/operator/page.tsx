import { ContentWrapper, EmptyState, SectionHeader } from "@/components/ui";

export default function OperatorHome() {
  return (
    <ContentWrapper>
      <SectionHeader title="Ruang kerja operator" description="Modul operasional akan tersedia di area ini." />
      <EmptyState title="Kerangka aplikasi siap" description="Pilih navigasi saat modul operasional telah tersedia." />
    </ContentWrapper>
  );
}
