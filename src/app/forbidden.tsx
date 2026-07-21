import { ErrorState } from "@/components/ui";

export default function Forbidden() {
  return (
    <main className="systemStatePage">
      <ErrorState kind="forbidden" title="Akses tidak diizinkan" description="Akun Anda telah dikenali, tetapi peran atau lingkup kepemilikan Anda tidak mengizinkan akses ke area ini." href="/app" hrefLabel="Kembali ke ruang kerja" />
    </main>
  );
}
