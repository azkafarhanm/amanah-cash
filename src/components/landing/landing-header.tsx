"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";

import { Logo, PageContainer } from "@/components/ui";

import styles from "./landing-header.module.css";
import { LandingThemeToggle } from "./landing-theme-toggle";

function getStaticSectionTop(element: HTMLElement): number {
  let top = 0;
  const parent = element.parentElement;
  if (!parent) return element.offsetTop;

  for (let i = 0; i < parent.children.length; i++) {
    const child = parent.children[i] as HTMLElement;
    if (child === element) {
      break;
    }
    top += child.offsetHeight;
  }
  return top;
}

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
  ) => {
    setMenuOpen(false);
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      if (typeof window !== "undefined") {
        if (window.location.hash !== `#${targetId}`) {
          window.history.pushState(null, "", `#${targetId}`);
        }
        const targetTop = getStaticSectionTop(target);
        const navHeight = 56;
        window.scrollTo({
          top: Math.max(0, targetTop - navHeight),
          behavior: "smooth",
        });
      }
    }
  };

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
          <a
            href="#cara-kerja"
            onClick={(e) => handleNavClick(e, "cara-kerja")}
          >
            Cara kerja
          </a>
          <a href="#fitur" onClick={(e) => handleNavClick(e, "fitur")}>
            Fitur
          </a>
          <a
            href="#keamanan"
            onClick={(e) => handleNavClick(e, "keamanan")}
          >
            Keamanan
          </a>
          <a
            href="#tanya-jawab"
            onClick={(e) => handleNavClick(e, "tanya-jawab")}
          >
            Tanya jawab
          </a>
          <div className={styles.navigationTheme}>
            <LandingThemeToggle />
          </div>
        </nav>
        <div className={styles.headerActions}>
          <div className={styles.headerThemeToggle}>
            <LandingThemeToggle />
          </div>
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
            {menuOpen ? (
              <X aria-hidden="true" />
            ) : (
              <Menu aria-hidden="true" />
            )}
          </button>
        </div>
      </PageContainer>
    </header>
  );
}
