import Link from "next/link";

import { Logo, PageContainer } from "@/components/ui";

import styles from "./landing-header.module.css";

function ProductIdentity() {
  return (
    <Link
      aria-label="Amanah Cash — Beranda"
      className={styles.identity}
      href="/"
    >
      <Logo aria-hidden="true" />
    </Link>
  );
}

export function LandingHeader() {
  return (
    <header className={styles.header}>
      <PageContainer className={styles.content}>
        <ProductIdentity />
      </PageContainer>
    </header>
  );
}
