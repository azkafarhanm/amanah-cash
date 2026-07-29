import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "..");
const readSource = (path) => readFileSync(resolve(root, path), "utf8");

test("LandingPage renders Batch 5.1.1 sections in the approved order", () => {
  const shell = readSource("src/components/landing/landing-page.tsx");
  const sections = [
    "<HeroSection />",
    "<ProblemsSection />",
    "<SolutionSection />",
    "<WorkflowSection />",
    "<FeaturesSection />",
    "<SecurityTrustSection />",
    "<FAQSection />",
    "<LandingFooter />",
  ];
  const positions = sections.map((section) => shell.indexOf(section));

  assert.equal(positions.every((position) => position >= 0), true);
  assert.deepEqual(positions, [...positions].sort((left, right) => left - right));
  assert.doesNotMatch(
    shell,
    /ApplicationPreviewSection|FinalCTASection|SettingsSection/,
  );
});

test("approved content inventory has exact item counts and ordering", async () => {
  const content = await import(
    "../src/components/landing/landing-content.ts"
  );

  assert.deepEqual(
    content.problems.map(({ title }) => title),
    [
      "Catatan tersebar",
      "Saldo perlu dihitung ulang",
      "Riwayat sulit ditemukan",
      "Arah transaksi kurang jelas",
      "Penjelasan membutuhkan waktu",
    ],
  );
  assert.deepEqual(
    content.solutions.map(({ title }) => title),
    [
      "Catatan terpusat per siswa",
      "Saldo dari riwayat lengkap",
      "Arah transaksi yang jelas",
      "Riwayat yang mudah ditelusuri",
    ],
  );
  assert.deepEqual(
    content.workflowSteps.map(({ title }) => title),
    ["Cari siswa", "Catat transaksi", "Periksa saldo dan riwayat"],
  );
  assert.equal(content.features.length, 6);
  assert.equal(content.trustPrinciples.length, 5);
  assert.equal(content.frequentlyAskedQuestions.length, 7);
  assert.deepEqual(
    content.frequentlyAskedQuestions.map(({ question }) => question),
    [
      "Apa itu Amanah Cash?",
      "Siapa yang dapat menggunakan Amanah Cash?",
      "Transaksi apa yang dapat dicatat?",
      "Bagaimana saldo siswa dihitung?",
      "Apakah Amanah Cash dapat digunakan melalui ponsel?",
      "Apakah transaksi dapat dicatat saat offline?",
      "Apakah transaksi dapat diedit atau dihapus?",
    ],
  );
});

test("static content remains server-rendered with approved list semantics", () => {
  const staticSections = [
    "problems-section.tsx",
    "solution-section.tsx",
    "workflow-section.tsx",
    "features-section.tsx",
    "security-trust-section.tsx",
    "faq-section.tsx",
  ].map((file) => readSource(`src/components/landing/${file}`));
  const iconList = readSource("src/components/landing/icon-text-list.tsx");
  const workflow = readSource(
    "src/components/landing/workflow-section.tsx",
  );
  const heading = readSource(
    "src/components/landing/landing-section-heading.tsx",
  );

  for (const section of staticSections) {
    assert.doesNotMatch(section, /["']use client["']/);
  }
  assert.match(iconList, /<ul/);
  assert.match(iconList, /<li className=\{styles\.item\}/);
  assert.match(workflow, /<ol/);
  assert.match(workflow, /<li className=\{styles\.workflowItem\}/);
  assert.match(heading, /<Heading level=\{2\} variant="landing-section">/);
});

test("approved fragment destinations are exact", () => {
  const solution = readSource(
    "src/components/landing/solution-section.tsx",
  );
  const workflow = readSource(
    "src/components/landing/workflow-section.tsx",
  );
  const features = readSource(
    "src/components/landing/features-section.tsx",
  );
  const faq = readSource("src/components/landing/faq-section.tsx");

  assert.match(solution, /href="#fitur"/);
  assert.match(workflow, /id="cara-kerja"/);
  assert.match(workflow, /href="#pratinjau-aplikasi"/);
  assert.match(features, /id="fitur"/);
  assert.match(faq, /id="tanya-jawab"/);
});

test("FAQ is the only client boundary and exposes independent disclosure state", () => {
  const faqItem = readSource("src/components/landing/faq-item.tsx");
  const faqSection = readSource("src/components/landing/faq-section.tsx");

  assert.match(faqItem, /^"use client";/);
  assert.match(faqItem, /useState\(false\)/);
  assert.match(faqItem, /<button/);
  assert.match(faqItem, /type="button"/);
  assert.match(faqItem, /aria-expanded=\{isOpen\}/);
  assert.match(faqItem, /aria-controls=\{answerId\}/);
  assert.match(faqItem, /role="region"/);
  assert.match(faqItem, /aria-labelledby=\{buttonId\}/);
  assert.match(faqItem, /hidden=\{!isOpen\}/);
  assert.match(faqSection, /frequentlyAskedQuestions\.map/);
  assert.match(faqSection, /<FAQItem key=\{item\.question\} \{\.\.\.item\} \/>/);
  assert.doesNotMatch(faqItem, /setTimeout|requestAnimationFrame|transition|animation/);
});

test("icons are decorative and section styles only consume approved tokens", () => {
  const icon = readSource("src/components/landing/landing-icon.tsx");
  const styles = readSource(
    "src/components/landing/landing-content.module.css",
  );
  const localPrimitive =
    /#[\da-f]{3,8}|rgba?\(|(?:\d*\.)?\d+(?:px|rem|ms)|cubic-bezier\(|@media\s*\(/i;

  assert.match(icon, /aria-hidden="true"/);
  assert.doesNotMatch(styles, localPrimitive);
  assert.match(styles, /var\(--landing-section-gap\)/);
  assert.match(styles, /var\(--landing-grid-gap\)/);
  assert.match(styles, /var\(--landing-faq-divider\)/);
  assert.match(styles, /var\(--landing-faq-max-width\)/);
  assert.doesNotMatch(styles, /:hover/);
  assert.match(styles, /\.item[\s\S]*?box-shadow: var\(--shadow-none\)/);
});

test("Batch 5.1.1 content contains no placeholders or unsupported claims", () => {
  const sources = [
    "landing-content.ts",
    "problems-section.tsx",
    "solution-section.tsx",
    "workflow-section.tsx",
    "features-section.tsx",
    "security-trust-section.tsx",
    "faq-section.tsx",
  ]
    .map((file) => readSource(`src/components/landing/${file}`))
    .join("\n");

  assert.doesNotMatch(
    sources,
    /TODO|placeholder|pricing|harga|registrasi|sertifikasi|integrasi|Settings|transaksi offline/i,
  );
});
