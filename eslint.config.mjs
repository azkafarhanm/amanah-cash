import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypeScript,
  // .claude/** holds git worktrees, i.e. full checkouts of this same repo.
  // Without this, every file gets linted twice and reported at both paths.
  globalIgnores([".next/**", "out/**", "coverage/**", "next-env.d.ts", ".claude/**"]),
]);
