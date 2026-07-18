import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";

import "./globals.css";

export const metadata: Metadata = {
  title: "Amanah Cash — Pencatatan Transaksi Keuangan Siswa",
  description:
    "Amanah Cash membantu guru dan pengelola sekolah mencatat transaksi keuangan siswa, memahami saldo, dan menelusuri riwayat transaksi dengan lebih jelas.",
  openGraph: {
    title: "Amanah Cash — Transaksi Keuangan Siswa Lebih Jelas",
    description:
      "Catat pemasukan dan pengeluaran, lihat saldo, dan telusuri riwayat transaksi siswa melalui alur sederhana yang mudah digunakan lewat ponsel.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id-ID" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
