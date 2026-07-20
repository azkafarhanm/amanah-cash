"use client";

import { ErrorState } from "@/components/ui";

export default function ApplicationError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorState
      title="Aplikasi tidak dapat memuat konten"
      description="Terjadi kendala sementara. Data Anda tidak berubah. Silakan coba kembali."
      action={<button className="systemStateButton" type="button" onClick={reset}>Coba lagi</button>}
    />
  );
}
