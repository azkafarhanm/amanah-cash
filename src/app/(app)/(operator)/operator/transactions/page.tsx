import Link from "next/link";
import { ContentWrapper, FeaturePlaceholder, SectionHeader } from "@/components/ui";

export default function TransactionsModulePage() {
  return (
    <ContentWrapper>
      <SectionHeader title="Transaksi" description="Ruang transaksi lintas siswa yang direncanakan." />
      <FeaturePlaceholder
        title="Modul Transaksi Terpusat"
        description="Pencatatan dan riwayat transaksi saat ini tersedia melalui detail setiap Siswa. Tampilan lintas siswa ini masih direncanakan."
        status="PLANNED"
        action={<Link href="/operator/students">Pilih Siswa untuk mencatat transaksi</Link>}
      />
    </ContentWrapper>
  );
}
