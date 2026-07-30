import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Logo, PageContainer } from "@/components/ui";

import styles from "./landing-header.module.css";

export function LandingHeader() {
  return (
    <header className={styles.header}>
      <PageContainer className={styles.content}>
        <Link
          aria-label="Amanah Cash — Beranda"
          className={styles.identity}
          href="/"
        >
          <Logo aria-hidden="true" />
        </Link>
        <nav
          aria-label="Navigasi utama"
          className={`${styles.navigation} desktop:flex`}
        >
          <Link href="#cara-kerja">Cara kerja</Link>
          <Link href="#fitur">Fitur</Link>
          <Link href="#keamanan">Keamanan</Link>
          <Link href="#tanya-jawab">Tanya jawab</Link>
        </nav>
        <Link className={styles.headerAction} href="/login">
          <span className="tablet:inline">Mulai menggunakan</span>
          <ArrowRight aria-hidden="true" />
        </Link>
      </PageContainer>
    </header>
  );
}
