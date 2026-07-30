import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "..");
const readSource = (path) => readFileSync(resolve(root, path), "utf8");

test("LandingPage follows the approved narrative through its final CTA", () => {
  const shell = readSource("src/components/landing/landing-page.tsx");
  const sections = [
    "<HeroSection />",
    "<ProblemsSection />",
    "<SolutionSection />",
    "<WorkflowSection />",
    "<FeaturesSection />",
    "<SecurityTrustSection />",
    "<FAQSection />",
    "<FinalCTASection />",
    "<LandingFooter />",
  ];
  const positions = sections.map((section) => shell.indexOf(section));

  assert.equal(positions.every((position) => position >= 0), true);
  assert.deepEqual(positions, [...positions].sort((left, right) => left - right));
});

test("approved MVP content includes practical problems, features, and FAQ", async () => {
  const content = await import("../src/components/landing/landing-content.ts");

  assert.equal(content.problems.length, 5);
  assert.equal(content.solutions.length, 5);
  assert.equal(content.workflowSteps.length, 6);
  assert.equal(content.features.length, 10);
  assert.equal(content.trustPrinciples.length, 5);
  assert.equal(content.frequentlyAskedQuestions.length, 10);
  assert.deepEqual(
    content.workflowSteps.map(({ title }) => title),
    [
      "Pilih siswa",
      "Catat transaksi",
      "Periksa hasil",
      "Tinjau aktivitas",
      "Telusuri perubahan",
      "Jaga keberlanjutan",
    ],
  );
  assert.match(content.features.map(({ title }) => title).join("\n"), /Laporan dan ekspor/);
  assert.match(content.features.map(({ title }) => title).join("\n"), /Backup dan restore/);
  assert.match(content.trustPrinciples.map(({ title }) => title).join("\n"), /Akses berbasis peran/);
});

test("sections preserve semantic lists and the exact approved destinations", () => {
  const iconList = readSource("src/components/landing/icon-text-list.tsx");
  const workflow = readSource("src/components/landing/workflow-section.tsx");
  const header = readSource("src/components/landing/landing-header.tsx");
  const security = readSource("src/components/landing/security-trust-section.tsx");
  const faq = readSource("src/components/landing/faq-section.tsx");

  assert.match(iconList, /<ul/);
  assert.match(workflow, /<ol/);
  assert.match(workflow, /id="cara-kerja"/);
  assert.match(workflow, /href="#fitur"/);
  assert.match(header, /href="#cara-kerja"/);
  assert.match(header, /href="#fitur"/);
  assert.match(header, /href="#keamanan"/);
  assert.match(header, /href="\/login"/);
  assert.match(security, /id="keamanan"/);
  assert.match(faq, /id="tanya-jawab"/);
});

test("interactive boundaries are focused, small, and motion-safe", () => {
  const faq = readSource("src/components/landing/faq-item.tsx");
  const reveal = readSource("src/components/landing/reveal.tsx");
  const styles = readSource("src/components/landing/landing-content.module.css");

  assert.match(faq, /^"use client";/);
  assert.match(faq, /aria-expanded=\{isOpen\}/);
  assert.match(faq, /aria-controls=\{answerId\}/);
  assert.match(faq, /data-open=\{isOpen\}/);
  assert.match(reveal, /^"use client";/);
  assert.match(reveal, /IntersectionObserver/);
  assert.match(reveal, /dataset\.enhanced/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /\.faqButton:focus-visible/);
});

test("landing content avoids future, financial-service, and unsupported claims", () => {
  const sources = [
    "landing-content.ts",
    "hero-section.tsx",
    "security-trust-section.tsx",
    "final-cta-section.tsx",
  ]
    .map((file) => readSource(`src/components/landing/${file}`))
    .join("\n");

  assert.doesNotMatch(sources, /pricing|harga|sertifikasi|100% aman|akun gratis selamanya/i);
  assert.match(sources, /tidak memindahkan atau menyimpan dana/i);
});
