import Link from "next/link";
import { ContentWrapper, FeaturePlaceholder, SectionHeader } from "@/components/ui";

export default function OperatorHome() {
  return (
    <ContentWrapper>
      <SectionHeader title="Dashboard Operator" description="Gambaran arah ruang kerja harian Operator." />
      <FeaturePlaceholder
        title="Dashboard Operator sedang disiapkan"
        description="Dashboard terpadu akan merangkum pekerjaan harian tanpa menggantikan daftar Siswa dan riwayat transaksi yang sudah tersedia."
        status="IN_DEVELOPMENT"
        capabilities={[
          { title: "Ringkasan Keuangan", description: "Ikhtisar saldo siswa yang ditugaskan kepada Anda." },
          { title: "Transaksi Terbaru", description: "Aktivitas transaksi terkini dari siswa dalam lingkup kepemilikan Anda." },
          { title: "Aktivitas Operator", description: "Pengingat pekerjaan operasional yang memerlukan perhatian." },
          { title: "Gambaran Siswa", description: "Status siswa aktif, tidak aktif, dan diarsipkan." }
        ]}
        action={<Link href="/operator/students">Buka daftar Siswa</Link>}
      />
    </ContentWrapper>
  );
}
