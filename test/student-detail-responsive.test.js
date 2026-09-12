import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Student detail mobile layout keeps panels and photo controls inside the viewport", async () => {
  const styles = await readFile("src/components/students/students.module.css", "utf8");

  assert.match(styles, /\.panel\s*\{/);
  assert.match(styles, /\.field\s*\{[^}]*min-width:\s*0/);
  assert.match(styles, /\.input, \.select, \.textarea\s*\{[^}]*width:\s*var\(--size-full\)/);
  assert.match(styles, /\.input, \.select, \.textarea\s*\{[^}]*box-sizing:\s*border-box/);
});
