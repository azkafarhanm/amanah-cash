import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";

import "./globals.css";

export const metadata: Metadata = {
  title: "Amanah Cash",
  description: "Pengelolaan dana titipan siswa yang mudah ditelusuri.",
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
