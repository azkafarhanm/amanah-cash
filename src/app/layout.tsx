import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";

import "./globals.css";

const themeBootstrap = `
(() => {
  const valid = new Set(["LIGHT", "DARK", "SYSTEM"]);
  let stored = null;
  try {
    stored = localStorage.getItem("amanah-cash-theme");
  } catch {}
  const preference = valid.has(stored) ? stored : "DARK";
  const dark = preference === "DARK"
    || (preference === "SYSTEM" && matchMedia("(prefers-color-scheme: dark)").matches);
  const theme = dark ? "dark" : "light";
  document.documentElement.dataset.themePreference = preference.toLowerCase();
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
})();
`;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // cover is required so env(safe-area-inset-*) resolves inside the installed
  // PWA (standalone) — without it every safe-area padding evaluates to 0 and
  // content slides under the notch/status bar/home indicator.
  viewportFit: "cover"
};

export const metadata: Metadata = {
  title: "Amanah Cash — Pengelolaan Keuangan Siswa yang Lebih Jelas",
  description:
    "Amanah Cash membantu sekolah, pesantren, yayasan, dan lembaga sejenis mencatat transaksi, memantau saldo, meninjau laporan, dan menelusuri aktivitas keuangan siswa.",
  openGraph: {
    title: "Amanah Cash — Kelola Keuangan Siswa dengan Lebih Jelas",
    description:
      "Satu aplikasi untuk mencatat setoran dan penarikan, memantau saldo, meninjau laporan, dan menjaga riwayat keuangan siswa tetap dapat ditelusuri.",
  },
  icons: {
    icon: "/brand/icon.svg",
    apple: "/icons/icon-192.svg"
  },
  manifest: "/manifest.webmanifest"
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
