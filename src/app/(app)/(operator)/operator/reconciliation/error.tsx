"use client";

import { Button, ErrorState } from "@/components/ui";

export default function FinancialAssuranceError({
  reset
}: {
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Daftar Siswa tidak dapat dimuat"
      description="Pemeriksaan keuangan belum dibuka. Periksa koneksi Anda lalu coba lagi."
      action={<Button onClick={reset}>Coba lagi memuat daftar Siswa</Button>}
    />
  );
}
