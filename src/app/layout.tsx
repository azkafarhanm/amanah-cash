import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";

import "./globals.css";

const themeBootstrap = `
(() => {
  const valid = new Set(["LIGHT", "DARK", "SYSTEM", "TIME"]);
  let stored = null;
  try {
    stored = localStorage.getItem("amanah-cash-theme");
  } catch {}
  const preference = valid.has(stored) ? stored : "SYSTEM";
  const hour = new Date().getHours();
  const dark = preference === "DARK"
    || (preference === "SYSTEM" && matchMedia("(prefers-color-scheme: dark)").matches)
    || (preference === "TIME" && (hour < 6 || hour >= 18));
  const theme = dark ? "dark" : "light";
  document.documentElement.dataset.themePreference = preference.toLowerCase();
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
})();
`;

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
    <html lang="id-ID" className={GeistSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
