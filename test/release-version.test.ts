import assert from "node:assert/strict";
import test from "node:test";
import {
  latestReleasedVersion,
  validateReleaseVersion
} from "../scripts/validate-release.js";

const changelog = `# Changelog

## [Unreleased]

### Added

- Internal work in progress.

## [1.2.0] - 2026-08-02

### Added

- A released user-facing improvement.

## [1.1.0] - 2026-07-25
`;

test("release validation uses the newest dated release and ignores Unreleased", () => {
  assert.equal(latestReleasedVersion(changelog), "1.2.0");
  assert.equal(validateReleaseVersion("1.2.0", changelog), "1.2.0");
});

test("release validation fails when package and Changelog versions drift", () => {
  assert.throws(
    () => validateReleaseVersion("1.1.0", changelog),
    /Release version mismatch: package\.json is 1\.1\.0.*1\.2\.0/
  );
});

test("release validation requires a dated semantic release section", () => {
  assert.throws(
    () => latestReleasedVersion("## [Unreleased]\n\n### Changed\n\n- Work."),
    /no dated released version section/
  );
});
