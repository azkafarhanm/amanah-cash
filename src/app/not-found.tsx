import { ErrorState } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="systemStatePage">
      <ErrorState title="Halaman tidak ditemukan" description="Alamat yang Anda buka tidak tersedia." href="/app" hrefLabel="Kembali ke aplikasi" />
    </main>
  );
}
