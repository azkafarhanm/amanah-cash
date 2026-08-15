"use client";

import { useEffect, useState } from "react";
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

export function scrollToLandingAnchor(targetId: string, e?: React.MouseEvent | MouseEvent) {
  const target = document.getElementById(targetId);
  if (!target) return;

  if (e) {
    e.preventDefault();
  }

  if (typeof window !== "undefined") {
    if (window.location.hash !== `#${targetId}`) {
      window.history.pushState(null, "", `#${targetId}`);
    }
    const header = document.querySelector("header");
    const navHeight = header ? header.getBoundingClientRect().height : 56;
    const targetTop = getStaticSectionTop(target);
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.scrollTo({
      top: Math.max(0, targetTop - navHeight),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }
}

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
  ) => {
    setMenuOpen(false);
    scrollToLandingAnchor(targetId, e);
  };

  useEffect(() => {
    // Intercept in-page landing anchor links (Hero CTA, Solution CTA, Workflow CTA, Final CTA, Footer)
    const handleDocumentClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#" || href === "#main-content") return;
      const targetId = href.slice(1);
      const sectionElement = document.getElementById(targetId);
      if (sectionElement && sectionElement.closest("main")) {
        setMenuOpen(false);
        scrollToLandingAnchor(targetId, e);
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

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
