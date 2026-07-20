import { ErrorState } from "@/components/ui";

export default function Forbidden() {
  return (
    <main className="systemStatePage">
      <ErrorState title="Akses tidak diizinkan" description="Akun Anda tidak memiliki akses ke area ini." href="/app" hrefLabel="Kembali ke ruang kerja" />
    </main>
  );
}
