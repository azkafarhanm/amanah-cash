"use client";
import { ErrorState } from "@/components/ui";
export default function Error({ reset }: { reset: () => void }) { return <ErrorState title="Data Siswa tidak dapat dimuat" description="Coba lagi atau kembali ke daftar Siswa Anda." action={<button type="button" onClick={reset}>Coba lagi</button>} />; }
