import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("ContentWrapper exclusively owns spacing between page sections", async () => {
  const styles = await readFile("src/components/ui/ui.module.css", "utf8");
  const contentWrapper = styles.match(/\.contentWrapper\s*\{([^}]*)\}/)?.[1] ?? "";
  const sectionHeader = styles.match(/\.sectionHeader\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.match(contentWrapper, /gap:\s*var\(--layout-section-gap\)/);
  assert.doesNotMatch(sectionHeader, /margin(?:-block(?:-end)?)?\s*:/);
});

test("shared UI styles use parser-safe fractional spacing token names", async () => {
  const styles = await readFile("src/components/ui/toast.module.css", "utf8");

  assert.doesNotMatch(styles, /--space-\d+\.\d+/);
  assert.match(styles, /--space-3-5/);
  assert.match(styles, /--space-1-5/);
});

test("authenticated tables share the semantic table-header contract", async () => {
  const [globals, ...tables] = await Promise.all([
    readFile("src/app/globals.css", "utf8"),
    readFile("src/components/reports/reports.module.css", "utf8"),
    readFile("src/components/students/students.module.css", "utf8"),
    readFile("src/components/transactions/workspace/workspace.module.css", "utf8"),
    readFile("src/app/(app)/(admin)/admin/operators/operators.module.css", "utf8")
  ]);

  assert.match(globals, /--table-header-background:\s*var\(--color-background-subtle\)/);
  assert.match(globals, /--table-header-foreground:\s*var\(--color-text-secondary\)/);
  assert.match(globals, /--table-header-font:\s*var\(--font-weight-medium\)/);
  assert.match(globals, /--table-header-padding-block:\s*var\(--space-3\)/);
  assert.match(globals, /--table-header-padding-inline:\s*var\(--space-4\)/);

  for (const styles of tables) {
    assert.match(styles, /background:\s*var\(--table-header-background\)/);
    assert.match(styles, /color:\s*var\(--table-header-foreground\)/);
    assert.match(styles, /font:\s*var\(--table-header-font\)/);
    assert.match(styles, /border-block-end:\s*var\(--table-header-border\)/);
    assert.match(styles, /border-start-start-radius:\s*var\(--table-header-radius\)/);
    assert.match(styles, /border-start-end-radius:\s*var\(--table-header-radius\)/);
  }
});

test("shared pagination distinguishes single, enabled, current, and disabled states", async () => {
  const [component, styles, globals] = await Promise.all([
    readFile("src/components/ui/pagination.tsx", "utf8"),
    readFile("src/components/ui/ui.module.css", "utf8"),
    readFile("src/app/globals.css", "utf8")
  ]);

  assert.match(component, /if \(pages <= 1\)/);
  assert.match(component, /1 halaman/);
  assert.match(component, /aria-current="page"/);
  assert.match(component, /aria-disabled="true"/);
  assert.match(styles, /\.paginationControls a:hover/);
  assert.match(styles, /\.paginationControls a:focus-visible/);
  assert.match(styles, /\.paginationDisabled/);
  assert.match(globals, /--pagination-control-disabled-background:/);
  assert.match(globals, /--pagination-control-background-hover:/);
});

test("all numbered datasets consume shared pagination", async () => {
  const [reports, students, operators] = await Promise.all([
    readFile("src/components/reports/report-components.tsx", "utf8"),
    readFile("src/components/students/student-list.tsx", "utf8"),
    readFile("src/app/(app)/(admin)/admin/operators/page.tsx", "utf8")
  ]);

  assert.match(reports, /<Pagination ariaLabel="Paginasi laporan"/);
  assert.match(reports, /<Pagination ariaLabel="Paginasi laporan administratif"/);
  assert.match(students, /<Pagination ariaLabel="Paginasi Siswa"/);
  assert.match(operators, /<Pagination ariaLabel="Paginasi Operator"/);
});

test("polished operational surfaces remain free of raw colors and undefined legacy tokens", async () => {
  const files = [
    "src/components/ui/ui.module.css",
    "src/components/reports/reports.module.css",
    "src/components/students/students.module.css",
    "src/components/transactions/transactions.module.css",
    "src/components/transactions/workspace/workspace.module.css",
    "src/app/(app)/(admin)/admin/operators/operators.module.css"
  ];
  const styles = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");

  assert.doesNotMatch(styles, /#[0-9a-f]{3,8}|rgba?\(|hsla?\(/i);
  assert.doesNotMatch(styles, /--color-background-muted|--duration-fast/);
});
