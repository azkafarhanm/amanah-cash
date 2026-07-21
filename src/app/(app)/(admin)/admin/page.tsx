import Link from "next/link";
import { ContentWrapper, FeaturePlaceholder, SectionHeader } from "@/components/ui";

export default function AdminHome() {
  return (
    <ContentWrapper>
      <SectionHeader title="Dashboard Administrator" description="Gambaran arah ruang kerja administrasi Amanah Cash." />
      <FeaturePlaceholder
        title="Dashboard Administrator sedang disiapkan"
        description="Dashboard terpadu akan membantu Administrator Platform memantau kesiapan operasional tanpa membuka data keuangan siswa."
        status="IN_DEVELOPMENT"
        capabilities={[
          { title: "Ringkasan Operator", description: "Status aktivasi dan kesiapan akun Operator." },
          { title: "Gambaran Siswa", description: "Jumlah siswa dan status penugasan tanpa informasi keuangan." },
          { title: "Aktivitas Administratif", description: "Ringkasan perubahan administratif yang relevan." },
          { title: "Kesiapan Platform", description: "Informasi konfigurasi dan kesehatan operasional." }
        ]}
        action={<Link href="/admin/operators">Kelola Operator</Link>}
      />
    </ContentWrapper>
  );
}
