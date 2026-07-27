"use client";

import { Button, ErrorState } from "@/components/ui";

export default function StudentReconciliationError({
  reset
}: {
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Pemeriksaan keuangan tidak dapat dibuka"
      description="Data keuangan tidak diubah. Coba muat kembali halaman ini."
      action={<Button onClick={reset}>Coba lagi membuka pemeriksaan</Button>}
    />
  );
}
