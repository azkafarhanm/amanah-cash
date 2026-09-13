import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("safe area inset rules are present in app shell, drawers, and modal dialogs", async () => {
  const [appShell, drawer, transactions] = await Promise.all([
    readFile("src/components/app-shell/app-shell.module.css", "utf8"),
    readFile("src/components/ui/context-detail-drawer.module.css", "utf8"),
    readFile("src/components/transactions/transactions.module.css", "utf8")
  ]);

  assert.match(appShell, /env\(safe-area-inset-top\)/);
  assert.match(appShell, /env\(safe-area-inset-bottom\)/);
  assert.match(drawer, /env\(safe-area-inset-top\)/);
  assert.match(drawer, /env\(safe-area-inset-bottom\)/);
  assert.match(transactions, /env\(safe-area-inset-bottom\)/);
});

test("operational CSS modules define touch target minimum control heights and widths", async () => {
  const files = [
    "src/components/ui/ui.module.css",
    "src/components/app-shell/app-shell.module.css",
    "src/components/transactions/transactions.module.css",
    "src/components/transactions/workspace/workspace.module.css",
    "src/components/reports/reports.module.css",
    "src/components/students/students.module.css",
    "src/app/(app)/(admin)/admin/operators/operators.module.css"
  ];

  for (const file of files) {
    const css = await readFile(file, "utf8");
    assert.match(
      css,
      /min-height:\s*(var\(--control-height-minimum\)|var\(--button-height-default\)|min\(|max\(|44px|calc)/,
      `File ${file} missing touch target minimum control height`
    );
  }
});

test("operational CSS modules define viewport media query breakpoints for mobile reflow", async () => {
  const files = [
    "src/components/ui/ui.module.css",
    "src/components/app-shell/app-shell.module.css",
    "src/components/dashboard/dashboard-v2.module.css",
    "src/components/transactions/transactions.module.css",
    "src/components/transactions/workspace/workspace.module.css",
    "src/components/students/students.module.css",
    "src/app/(app)/(admin)/admin/operators/operators.module.css",
    "src/components/reports/reports.module.css",
    "src/app/(auth)/auth.module.css"
  ];

  for (const file of files) {
    const css = await readFile(file, "utf8");
    assert.match(
      css,
      /@media\s*\((max-width|min-width):/,
      `File ${file} missing responsive media query breakpoint`
    );
  }
});

test("tables and cards enforce overflow-wrap and min-width safety for narrow 320px viewports", async () => {
  const files = [
    "src/components/reports/reports.module.css",
    "src/components/students/students.module.css",
    "src/app/(app)/(admin)/admin/operators/operators.module.css",
    "src/components/transactions/workspace/workspace.module.css"
  ];

  for (const file of files) {
    const css = await readFile(file, "utf8");
    assert.match(
      css,
      /overflow-wrap:\s*anywhere|overflow-x:\s*auto|overflow:\s*visible/,
      `File ${file} missing overflow safety rule`
    );
  }
});

test("transaction filter search does not retain its desktop width basis as mobile height", async () => {
  const css = await readFile("src/components/transactions/workspace/workspace.module.css", "utf8");
  const mobileRules = css.slice(css.indexOf("@media (max-width: 48rem)"));

  // The toolbar stacks vertically on phones via an explicit single minmax(0, 1fr)
  // grid track (instead of the previous flex column): rows stay full-width and
  // the track hard-caps the intrinsic min-content of the select/pills strip,
  // which used to leak past narrow viewports.
  assert.match(mobileRules, /\.filterToolbar\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(mobileRules, /\.filterControls\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  assert.match(mobileRules, /\.filterGroup\s*\{[^}]*flex:\s*0 1 auto/);
});

test("the auth width breakpoint yields to the short-viewport ladder", async () => {
  const css = await readFile("src/components/auth/login-experience.module.css", "utf8");

  // The lamp geometry is set twice, and on a phone both blocks match at once: a
  // `max-width: 30rem` block and a ladder of `max-height` blocks. They target the
  // same `.viewport` selector, so specificity ties and source order decides the
  // winner. The height ladder has to come last.
  //
  // When it did not, a narrow short phone got the width block's reserved zone
  // (28 + 116 + 28 + 16 = 188px) instead of the 560px tier's (16 + 92 + 20 + 10 =
  // 138px). Fifty pixels of a ~553px iPhone SE viewport, inside a `.viewport`
  // that is `height: 100dvh; overflow: hidden` with no scroll until 440px — so
  // the bottom of the card was silently cut off on exactly the devices the
  // ladder was built for.
  const widthBlock = css.indexOf("--auth-lamp-rod-height: 28px");
  const ladderStart = css.indexOf("@media (max-height: 760px)");
  const ladderEnd = css.indexOf("@media (max-height: 560px)");

  assert.ok(widthBlock > -1, "expected the max-width: 30rem lamp geometry block");
  assert.ok(ladderStart > -1 && ladderEnd > -1, "expected the short-viewport ladder");
  assert.ok(
    widthBlock < ladderStart,
    "the max-width: 30rem lamp block must precede the max-height ladder, or short phones lose the compaction"
  );
  assert.ok(ladderEnd > ladderStart, "the ladder must run from tallest to shortest");
});
