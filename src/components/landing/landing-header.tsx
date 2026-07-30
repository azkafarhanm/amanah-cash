"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

import { Logo, PageContainer } from "@/components/ui";

import styles from "./landing-header.module.css";

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

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
          className={`${styles.navigation} ${menuOpen ? styles.navigationOpen : ""} desktop:flex`}
        >
          <Link href="#cara-kerja" onClick={() => setMenuOpen(false)}>Cara kerja</Link>
          <Link href="#fitur" onClick={() => setMenuOpen(false)}>Fitur</Link>
          <Link href="#keamanan" onClick={() => setMenuOpen(false)}>Keamanan</Link>
          <Link href="#tanya-jawab" onClick={() => setMenuOpen(false)}>Tanya jawab</Link>
        </nav>
        <div className={styles.headerActions}>
          <Link className={styles.headerAction} href="/login">
            <span className="tablet:inline">Mulai menggunakan</span>
            <ArrowRight aria-hidden="true" />
          </Link>
          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            className={styles.menuToggle}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </PageContainer>
    </header>
  );
}
