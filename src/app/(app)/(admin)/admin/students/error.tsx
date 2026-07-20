"use client";
import { ErrorState } from "@/components/ui";
export default function Error({ reset }: { reset: () => void }) { return <ErrorState title="Data Siswa tidak dapat dimuat" description="Coba lagi. Tidak ada perubahan yang dilakukan." action={<button type="button" onClick={reset}>Coba lagi</button>} />; }
