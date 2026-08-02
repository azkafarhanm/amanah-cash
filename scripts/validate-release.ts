import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const SEMANTIC_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const RELEASE_HEADING = /^## \[([^\]]+)\] - (\d{4}-\d{2}-\d{2})$/gm;

export function latestReleasedVersion(changelog: string): string {
  for (const match of changelog.matchAll(RELEASE_HEADING)) {
    const version = match[1];
    if (version !== "Unreleased") {
      if (!SEMANTIC_VERSION.test(version)) {
        throw new Error(`Latest released Changelog version is not valid SemVer: ${version}`);
      }
      return version;
    }
  }

  throw new Error("CHANGELOG.md has no dated released version section.");
}

export function validateReleaseVersion(packageVersion: string, changelog: string): string {
  if (!SEMANTIC_VERSION.test(packageVersion)) {
    throw new Error(`package.json.version is not valid SemVer: ${packageVersion}`);
  }

  const changelogVersion = latestReleasedVersion(changelog);
  if (packageVersion !== changelogVersion) {
    throw new Error(
      `Release version mismatch: package.json is ${packageVersion}, but the latest released Changelog version is ${changelogVersion}.`
    );
  }

  return packageVersion;
}

export async function validateReleaseFiles(
  packagePath = resolve(process.cwd(), "package.json"),
  changelogPath = resolve(process.cwd(), "CHANGELOG.md")
): Promise<string> {
  const [packageSource, changelog] = await Promise.all([
    readFile(packagePath, "utf8"),
    readFile(changelogPath, "utf8")
  ]);
  const metadata = JSON.parse(packageSource) as { version?: unknown };
  if (typeof metadata.version !== "string") {
    throw new Error("package.json.version must be a string.");
  }

  return validateReleaseVersion(metadata.version, changelog);
}

async function main() {
  try {
    const version = await validateReleaseFiles();
    console.log(`Release validation passed: ${version}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Release validation failed: ${message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await main();
}
