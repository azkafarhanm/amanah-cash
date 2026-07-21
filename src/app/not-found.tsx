import { ErrorState } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="systemStatePage">
      <ErrorState kind="notFound" title="Halaman tidak ditemukan" description="Alamat yang Anda buka tidak tersedia. Periksa alamat atau kembali ke aplikasi." href="/app" hrefLabel="Kembali ke aplikasi" />
    </main>
  );
}
