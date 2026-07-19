import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "..");
const readSource = (path) => readFileSync(resolve(root, path), "utf8");

test("the root route renders only the structural LandingPage shell", () => {
  const route = readSource("src/app/page.tsx");

  assert.match(route, /return <LandingPage \/>/);
  assert.doesNotMatch(
    route,
    /Hero|Navbar|Navigation|CTA|FAQ|Workflow|Feature|Preview/,
  );
});

test("LandingPage preserves the approved landmark source order", () => {
  const shell = readSource("src/components/landing/landing-page.tsx");
  const landmarks = ["<SkipLink />", "<header>", "<main", "<LandingFooter />"];
  const positions = landmarks.map((landmark) => shell.indexOf(landmark));

  assert.equal(positions.every((position) => position >= 0), true);
  assert.deepEqual(positions, [...positions].sort((left, right) => left - right));
  assert.equal((shell.match(/<header>/g) ?? []).length, 1);
  assert.equal((shell.match(/<main/g) ?? []).length, 1);
  assert.equal((shell.match(/<LandingFooter \/>/g) ?? []).length, 1);
  assert.match(shell, /<main id="main-content" tabIndex=\{-1\}>/);
});

test("LandingFooter renders only the approved static identity content", () => {
  const footer = readSource("src/components/landing/landing-footer.tsx");

  assert.doesNotMatch(footer, /["']use client["']/);
  assert.equal((footer.match(/<footer/g) ?? []).length, 1);
  assert.match(footer, />Amanah Cash</);
  assert.match(
    footer,
    /Pencatatan transaksi keuangan siswa yang sederhana, jelas, dan mudah\s+ditelusuri\./,
  );
  assert.match(footer, /new Date\(\)\.getFullYear\(\)/);
  assert.match(footer, /© \{currentYear\} Amanah Cash\./);
  assert.match(footer, /<PageContainer className=\{styles\.content\}>/);
  assert.doesNotMatch(footer, /<a\b|<nav\b|href=|Link|Dokumentasi/);
});

test("LandingFooter uses the approved static token contract", () => {
  const footer = readSource("src/components/landing/landing-footer.tsx");
  const styles = readSource(
    "src/components/landing/landing-footer.module.css",
  );
  const localPrimitive =
    /#[\da-f]{3,8}|rgba?\(|(?:\d*\.)?\d+(?:px|rem|ms)|cubic-bezier\(|:\s*transparent\b|@media\s*\(/i;

  assert.doesNotMatch(styles, localPrimitive);
  assert.match(styles, /background: var\(--landing-canvas\)/);
  assert.match(styles, /border-block-start: var\(--landing-footer-border\)/);
  assert.match(styles, /font: var\(--type-label\)/);
  assert.match(styles, /font: var\(--type-supporting\)/);
  assert.match(
    footer,
    /tablet:py-\[var\(--landing-section-padding-tablet\)\]/,
  );
  assert.match(
    footer,
    /desktop:py-\[var\(--landing-section-padding-desktop\)\]/,
  );
});

test("the skip link uses the exact approved label and main target", () => {
  const skipLink = readSource("src/components/landing/skip-link.tsx");
  const styles = readSource(
    "src/components/landing/landing-foundation.module.css",
  );

  assert.match(skipLink, /href="#main-content"/);
  assert.match(skipLink, />\s*Lewati ke konten utama\s*</);
  assert.match(styles, /\.skipLink:focus-visible/);
  assert.match(styles, /inset-block-start: var\(--space-4\)/);
});

test("PageContainer fixes the shared Container to landing dimensions", () => {
  const pageContainer = readSource("src/components/ui/page-container.tsx");

  assert.match(pageContainer, /Omit<ContainerProps, "size">/);
  assert.match(pageContainer, /<Container size="landing"/);
});

test("metadata exactly matches the approved content specification", () => {
  const layout = readSource("src/app/layout.tsx");

  assert.match(
    layout,
    /title: "Amanah Cash — Pencatatan Transaksi Keuangan Siswa"/,
  );
  assert.match(
    layout,
    /"Amanah Cash membantu guru dan pengelola sekolah mencatat transaksi keuangan siswa, memahami saldo, dan menelusuri riwayat transaksi dengan lebih jelas\."/,
  );
  assert.match(
    layout,
    /title: "Amanah Cash — Transaksi Keuangan Siswa Lebih Jelas"/,
  );
  assert.match(
    layout,
    /"Catat pemasukan dan pengeluaran, lihat saldo, dan telusuri riwayat transaksi siswa melalui alur sederhana yang mudah digunakan lewat ponsel\."/,
  );
  assert.doesNotMatch(
    layout,
    /metadataBase|canonical|images|keywords|structuredData/,
  );
});

test("the approved Geist package uses next font local and the fallback contract", () => {
  const layout = readSource("src/app/layout.tsx");
  const globalStyles = readSource("src/app/globals.css");
  const geistSource = readSource("node_modules/geist/dist/sans.js");

  assert.match(layout, /import \{ GeistSans \} from "geist\/font\/sans"/);
  assert.match(geistSource, /import localFont from "next\/font\/local"/);
  assert.match(geistSource, /variable: "--font-geist-sans"/);
  assert.match(
    globalStyles,
    /--font-family-sans: var\(--font-geist-sans\), ui-sans-serif, system-ui/,
  );
});

test("component styles consume tokens without local primitive values", () => {
  const componentStyles = [
    "src/components/ui/ui.module.css",
    "src/components/landing/landing-foundation.module.css",
    "src/components/landing/landing-footer.module.css",
  ].map(readSource);
  const localPrimitive =
    /#[\da-f]{3,8}|rgba?\(|(?:\d*\.)?\d+(?:px|rem|ms)|cubic-bezier\(|:\s*transparent\b|@media\s*\(/i;

  for (const styles of componentStyles) {
    assert.doesNotMatch(styles, localPrimitive);
  }

  const container = readSource("src/components/ui/container.tsx");
  const section = readSource("src/components/ui/section.tsx");

  assert.match(container, /tablet:px-\[var\(--layout-gutter-wide\)\]/);
  assert.match(
    section,
    /tablet:py-\[var\(--landing-section-padding-tablet\)\]/,
  );
  assert.match(
    section,
    /desktop:py-\[var\(--landing-section-padding-desktop\)\]/,
  );
});
