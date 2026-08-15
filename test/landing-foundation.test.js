import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "..");
const readSource = (path) => readFileSync(resolve(root, path), "utf8");

test("the public route remains a small LandingPage shell with landmarks", () => {
  const route = readSource("src/app/(public)/page.tsx");
  const shell = readSource("src/components/landing/landing-page.tsx");

  assert.match(route, /return <LandingPage \/>/);
  assert.match(shell, /<SkipLink \/>/);
  assert.match(shell, /<main id="main-content" tabIndex=\{-1\}>/);
  assert.match(shell, /<LandingHeader \/>/);
  assert.match(shell, /<LandingFooter \/>/);
});

test("header, hero, and footer provide consistent navigation and product entry", () => {
  const header = readSource("src/components/landing/landing-header.tsx");
  const hero = readSource("src/components/landing/hero-section.tsx");
  const footer = readSource("src/components/landing/landing-footer.tsx");

  assert.match(header, /aria-label="Navigasi utama"/);
  assert.match(header, /href="\/login"/);
  assert.match(hero, /Kelola keuangan siswa dengan lebih jelas dan terpercaya/);
  assert.match(hero, /role="img"/);
  assert.match(hero, /href="#cara-kerja"/);
  assert.match(footer, /aria-label="Navigasi footer"/);
  assert.match(footer, /© \{currentYear\} Amanah Cash\./);
});

test("Hero and landing styles use tokenized surfaces with reduced-motion fallbacks", () => {
  const heroStyles = readSource("src/components/landing/hero-section.module.css");
  const contentStyles = readSource("src/components/landing/landing-content.module.css");
  const globals = readSource("src/app/globals.css");

  assert.match(heroStyles, /var\(--landing-hero-background\)/);
  assert.match(heroStyles, /var\(--landing-preview-shadow\)/);
  assert.match(heroStyles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(contentStyles, /var\(--landing-reveal-duration\)/);
  assert.match(contentStyles, /var\(--landing-final-cta-background\)/);
  assert.match(globals, /--landing-hero-decoration:/);
  assert.match(globals, /--landing-preview-shadow:/);
});

test("metadata reflects the approved positioning without publication assumptions", () => {
  const layout = readSource("src/app/layout.tsx");

  assert.match(layout, /Amanah Cash — Pengelolaan Keuangan Siswa yang Lebih Jelas/);
  assert.match(layout, /sekolah, pesantren, yayasan, dan lembaga sejenis/);
  assert.match(layout, /Amanah Cash — Kelola Keuangan Siswa dengan Lebih Jelas/);
  assert.doesNotMatch(layout, /metadataBase|canonical|images|keywords|structuredData/);
});

test("physical sheet takeover preserves Desktop Golden Reference and calibrated cross-viewport runways", () => {
  const contentStyles = readSource("src/components/landing/landing-content.module.css");

  // Desktop Golden Reference IMMUTABILITY
  assert.match(
    contentStyles,
    /@media\s*\(min-width:\s*64rem\)\s*and\s*\(min-height:\s*38rem\)\s*\{\s*\.problemsSection,\s*\.solutionSection,\s*\.workflowSection,\s*\.featuresSection,\s*\.securitySection\s*\{\s*position:\s*sticky;\s*top:\s*var\(--landing-nav-height\);\s*min-height:\s*calc\(100svh \+ 12rem\);/
  );

  // Tablet Runway Calibration (>= 42rem)
  assert.match(
    contentStyles,
    /@media\s*\(min-width:\s*48rem\)\s*and\s*\(max-width:\s*63\.99rem\)\s*and\s*\(min-height:\s*42rem\)\s*\{\s*\.problemsSection,\s*\.solutionSection,\s*\.workflowSection,\s*\.featuresSection,\s*\.featuresContinuationSection,\s*\.securitySection\s*\{\s*position:\s*sticky;\s*top:\s*calc\(var\(--landing-nav-height\)\s*\+\s*env\(safe-area-inset-top,\s*0px\)\);\s*min-height:\s*calc\(100svh \+ 8rem\);/
  );

  // Mobile Continuous Sticky Stack (>= 36rem / 576px) with generous 12rem runway
  assert.match(
    contentStyles,
    /@media\s*\(max-width:\s*47\.99rem\)\s*and\s*\(min-height:\s*36rem\)\s*\{\s*\.problemsSection,\s*\.problemsContinuationSection,\s*\.solutionSection,\s*\.solutionContinuationSection,\s*\.workflowSection,\s*\.workflowContinuationSection,\s*\.featuresSection,\s*\.featuresContinuationSection,\s*\.securitySection,\s*\.securityContinuationSection\s*\{\s*position:\s*sticky;\s*top:\s*calc\(var\(--landing-nav-height\)\s*\+\s*env\(safe-area-inset-top,\s*0px\)\);\s*min-height:\s*calc\(100svh \+ 12rem\);/
  );

  // Short Viewport Fallback (< 36rem Mobile / < 42rem Tablet / < 38rem Desktop)
  assert.match(
    contentStyles,
    /@media\s*\(max-width:\s*47\.99rem\)\s*and\s*\(max-height:\s*35\.99rem\),\s*\(min-width:\s*48rem\)\s*and\s*\(max-width:\s*63\.99rem\)\s*and\s*\(max-height:\s*41\.99rem\),\s*\(min-width:\s*64rem\)\s*and\s*\(max-height:\s*37\.99rem\)\s*\{/
  );
  assert.match(contentStyles, /position:\s*relative\s*!important;/);
  assert.match(contentStyles, /margin-block-start:\s*-1\.25rem;/);
});


