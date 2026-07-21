import { ErrorState } from "@/components/ui";

export default function Unauthorized() {
  return (
    <main className="systemStatePage">
      <ErrorState kind="unauthorized" title="Sesi diperlukan" description="Sesi aktif tidak ditemukan atau telah berakhir. Silakan masuk kembali untuk melanjutkan." href="/login" hrefLabel="Masuk" />
    </main>
  );
}
