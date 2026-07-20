import { ErrorState } from "@/components/ui";

export default function Unauthorized() {
  return (
    <main className="systemStatePage">
      <ErrorState title="Sesi diperlukan" description="Silakan masuk kembali untuk melanjutkan." href="/login" hrefLabel="Masuk" />
    </main>
  );
}
