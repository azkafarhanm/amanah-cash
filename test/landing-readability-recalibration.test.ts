import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";

const root = resolve(import.meta.dirname, "..");
const readSource = (path: string) => readFileSync(resolve(root, path), "utf8");

test("Mobile readability rules enforce 14px titles, 13px descriptions, and 2-column layout", () => {
  const styles = readSource("src/components/landing/landing-content.module.css");

  // Mobile Features List preserves 2-column grid and calibrated gap
  assert.match(
    styles,
    /\.featuresList\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*1fr\);/
  );

  // Mobile Feature Item enforces readable typography (>=14px title, >=13px description) and compact padding
  assert.match(
    styles,
    /\.featureItem\s*\{[^}]*padding:\s*var\(--space-1-5/
  );
  assert.match(
    styles,
    /\.featureItem\s*\.itemIcon\s*\{[^}]*width:\s*var\(--size-5/
  );
  assert.match(
    styles,
    /\.featureItem\s*h3\s*\{[^}]*font-size:\s*var\(--font-size-14/
  );
  assert.match(
    styles,
    /\.featureItem\s*p\s*\{[^}]*font-size:\s*var\(--font-size-13/
  );

  // General items (Problems, Solutions, Security) enforce 14px title and 13px description
  assert.match(
    styles,
    /\.item\s*h3\s*\{[^}]*font-size:\s*var\(--font-size-14,\s*0\.875rem\);/
  );
  assert.match(
    styles,
    /\.item\s*p\s*\{[^}]*font-size:\s*var\(--font-size-13,\s*0\.8125rem\);[^}]*line-height:\s*1\.42;/
  );

  // Workflow items enforce 14px title and 13px description
  assert.match(
    styles,
    /\.workflowCopy\s*h3\s*\{[^}]*font-size:\s*var\(--font-size-14,\s*0\.875rem\);/
  );
  assert.match(
    styles,
    /\.workflowCopy\s*p\s*\{[^}]*font-size:\s*var\(--font-size-13,\s*0\.8125rem\);[^}]*line-height:\s*1\.42;/
  );

  // Ensure min-width: 0 and overflow-wrap safety
  assert.match(styles, /\.featureItem\s*\{[^}]*min-width:\s*0;/);
  assert.match(styles, /\.item\s*\{[^}]*min-width:\s*0;/);
  assert.match(styles, /\.workflowItem\s*\{[^}]*min-width:\s*0;/);
  assert.match(styles, /\.workflowCopy\s*\{[^}]*min-width:\s*0;/);
});

test("Short viewport fallback (< 36rem) uses natural relative flow without micro-font shrinking", () => {
  const styles = readSource("src/components/landing/landing-content.module.css");

  // Destructive micro-font shrinking media query must be removed
  assert.doesNotMatch(styles, /font-size:\s*0\.6875rem;\s*line-height:\s*1\.15;/);
  assert.doesNotMatch(styles, /font-size:\s*0\.625rem;\s*line-height:\s*1\.2;/);
  assert.doesNotMatch(styles, /grid-template-columns:\s*auto\s*1fr;\s*grid-template-rows:\s*auto\s*auto;/);

  // Short viewport media query cleanly applies position: relative fallback
  assert.match(
    styles,
    /@media\s*\(max-width:\s*47\.99rem\)\s*and\s*\(max-height:\s*35\.99rem\)[^{]*\{\s*\.problemsSection[^{]*\{\s*position:\s*relative\s*!important;\s*top:\s*auto\s*!important;\s*min-height:\s*auto\s*!important;/
  );
});

test("Desktop Golden Reference remains immutable", () => {
  const styles = readSource("src/components/landing/landing-content.module.css");

  assert.match(
    styles,
    /@media\s*\(min-width:\s*64rem\)\s*and\s*\(min-height:\s*38rem\)\s*\{\s*\.problemsSection,\s*\.solutionSection,\s*\.workflowSection,\s*\.featuresSection,\s*\.securitySection\s*\{\s*position:\s*sticky;\s*top:\s*var\(--landing-nav-height\);\s*min-height:\s*calc\(100svh \+ 12rem\);/
  );
});
