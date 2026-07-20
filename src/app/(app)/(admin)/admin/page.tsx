import { ContentWrapper, EmptyState, SectionHeader } from "@/components/ui";

export default function AdminHome() {
  return (
    <ContentWrapper>
      <SectionHeader title="Ruang kerja administrator" description="Modul administrasi akan tersedia di area ini." />
      <EmptyState title="Kerangka aplikasi siap" description="Pilih navigasi saat modul administrasi telah tersedia." />
    </ContentWrapper>
  );
}
