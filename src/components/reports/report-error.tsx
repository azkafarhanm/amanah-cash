"use client";

import { ErrorState } from "@/components/ui";

export function ReportError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState title="Laporan tidak dapat dimuat" description="Data laporan belum berubah. Coba muat kembali setelah memeriksa koneksi Anda." action={<button type="button" onClick={reset}>Coba lagi</button>} />;
}
