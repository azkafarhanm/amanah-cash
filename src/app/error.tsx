"use client";

import { ErrorState } from "@/components/ui";

export default function UnexpectedError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="systemStatePage">
      <ErrorState
        title="Terjadi kesalahan"
        description="Kami tidak dapat menyelesaikan permintaan ini. Silakan coba kembali."
        action={<button className="systemStateButton" type="button" onClick={reset}>Coba lagi</button>}
      />
    </main>
  );
}
