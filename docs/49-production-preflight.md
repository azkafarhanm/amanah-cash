# Production Preflight

**Status:** Implemented through Sprint 4 Epic 4.1 Batch 4.1.1
**Date:** 2026-07-29

## Scope

This preflight closes repository-local production risks without selecting a
hosting vendor, changing the approved SQLite persistence architecture, or
performing environment-specific deployment qualification.

It covers:

- runtime dependency advisory review;
- production environment contract validation;
- secret-safe operational summaries;
- production-safe authentication, migration, protected-route, unexpected-error,
  and export-limit behavior; and
- the repository release commands.

Deployment topology, backup/restore, live OAuth registration, physical-device
qualification, and measured export capacity remain in the blocked Sprint 4
batches defined by `docs/09-development-roadmap.md`.

## Dependency Review

The 2026-07-29 production dependency audit initially reported 17 findings:
1 critical, 12 high, and 4 moderate.

The following semver-compatible direct upgrades were applied:

| Package | Before | After | Result |
|---|---:|---:|---|
| `next-auth` | 4.24.14 | 4.24.15 | Resolves the critical Unicode email-normalization advisory and the malformed Bearer-header advisory. |
| `next` | 16.2.10 | 16.2.11 | Resolves the reported App Router, Server Action, cache, rewrite, and endpoint-disclosure advisories fixed by this patch. |
| `@prisma/client` | 7.8.0 | 7.9.1 | Keeps the runtime client aligned with the adapter and CLI. |
| `@prisma/adapter-better-sqlite3` | 7.8.0 | 7.9.1 | Keeps the approved SQLite adapter aligned with Prisma. |
| `prisma` | 7.8.0 | 7.9.1 | Resolves the reported Prisma development-tool advisory chain. |
| `eslint-config-next` | 16.2.10 | 16.2.11 | Keeps framework lint rules aligned with Next.js. |

After the upgrades, `npm audit --omit=dev` reports 12 high findings and no
critical or moderate findings. They form two unresolved upstream chains:

### ExcelJS archive chain

`exceljs@4.4.0` depends on `archiver@5.3.2`, which reaches vulnerable
`archiver-utils`, `readdir-glob`, `zip-stream`, `glob`, `minimatch`, and
`brace-expansion` versions. Amanah Cash uses ExcelJS only to generate an
in-memory workbook with application-defined worksheet/archive structure.
User-provided report strings become cell values; they do not select filesystem
paths or archive entry paths.

The npm-recommended action is a forced downgrade to `exceljs@4.1.1`; it is not a
safe patch and would regress the approved adapter without resolving through a
maintained forward release. Batch 4.1.1 therefore records this as an upstream
dependency blocker. Required decision: upgrade to a future ExcelJS release with
a patched archive chain, or separately approve and validate an alternative
workbook adapter. Do not use `npm audit fix --force`.

### Next.js PostCSS and Sharp chain

`next@16.2.11` currently installs `postcss@8.4.31` and `sharp@0.34.5`. The
registry audit marks both as high severity and offers only an incompatible
Next.js downgrade. The application does not accept user-authored CSS/source
maps, import Sharp directly, or configure remote image sources. These facts
reduce current reachability but do not erase the advisory.

Required decision: adopt the first supported Next.js patch that updates these
transitives, or separately approve and validate explicit dependency overrides.
Next.js 16.2.12 was evaluated but reproducibly terminated with a native
`Bus error` under the repository's Node.js 24.18.0 build environment; 16.2.11 is
the newest patch that passed the complete production build gate here.
The project must not claim production readiness while these high findings remain
unreviewed at final release acceptance.

## Production Environment Contract

Run:

```text
npm run env:check:production
```

The command forces production validation even when executed from a development
shell. It requires:

- `DATABASE_URL`: approved SQLite `file:` URL;
- `AUTH_DEV_MODE=false`;
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`;
- `NEXTAUTH_SECRET`: at least 32 characters;
- `NEXTAUTH_URL`: exact HTTPS application origin without path, query, or
  fragment;
- `EXPORT_MAX_ROWS`: optional positive integer, default `10000`; and
- `EXPORT_MAX_BYTES`: optional positive integer.

The summary prints the application origin and export limits. It never prints the
database location, Google credentials, Auth.js secret, tokens, or financial
data. Production callback registration remains exactly:

```text
${NEXTAUTH_URL}/api/auth/callback/google
```

The callback must be registered explicitly; wildcard callbacks are prohibited.

## Diagnostic Verification

- Authentication configuration failures return a private, no-store generic
  `503` response and do not serialize configuration values.
- Migration success and failure messages redact the database location. A
  failure points the operator to `DATABASE_URL`, permissions, and ordered
  migration files without printing SQL, a stack trace, or an exception payload.
- Protected API adapters retain stable `401`, `403`, and masked `404` responses.
- Root, application-shell, and feature error boundaries render localized generic
  recovery states and never render the Error object.
- Export-limit failures retain controlled `413 EXPORT_LIMIT_EXCEEDED` behavior
  without exposing thresholds, queries, internal identifiers, or financial
  payloads.

## Verification

Automated coverage includes production-mode OAuth enforcement, secret and URL
validation, export-limit validation, redacted preflight summaries, redacted
migration diagnostics, authentication configuration mapping, protected-route
mapping, unexpected error boundaries, and export-limit mapping.

Repository release gates for this batch:

```text
npm test
npm run typecheck
npm run lint
npm run prisma:validate
npm run build
git diff --check
```

Manual QA remains required before Engineering Review acceptance:

1. Run `npm run env:check:production` with deployment-like placeholder values and
   confirm no secret or database path is printed.
2. Run it with `AUTH_DEV_MODE=true`, a missing Google secret, an HTTP non-loopback
   origin, and an invalid export limit; confirm each fails explicitly without
   echoing the submitted value.
3. Point a disposable configuration at an inaccessible SQLite location and run
   `npm run db:migrate`; confirm the message is actionable and redacted.
4. Exercise unauthenticated, wrong-role, missing-resource, and oversized-export
   failures and confirm their controlled status/message contracts.

## Remaining Blockers

- Production hosting/runtime, region, process count, persistent storage, and
  database topology are not selected.
- Backup/restore objectives, secret manager, OAuth production origins, and
  Platform Admin bootstrap ownership are not specified.
- The supported browser/device/network/data-volume baseline is not approved.
- ExcelJS/Archiver and Next.js PostCSS/Sharp high advisory chains await supported
  upstream remediation or a separately approved adapter/override decision.
