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
  const landmarks = ["<SkipLink />", "<header>", "<main", "<footer>"];
  const positions = landmarks.map((landmark) => shell.indexOf(landmark));

  assert.equal(positions.every((position) => position >= 0), true);
  assert.deepEqual(positions, [...positions].sort((left, right) => left - right));
  assert.equal((shell.match(/<header>/g) ?? []).length, 1);
  assert.equal((shell.match(/<main/g) ?? []).length, 1);
  assert.equal((shell.match(/<footer>/g) ?? []).length, 1);
  assert.match(shell, /<main id="main-content" tabIndex=\{-1\}>/);
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
