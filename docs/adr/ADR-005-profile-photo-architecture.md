# ADR-005 — Profile Photo Architecture

**Status:** Accepted — Phase 1 implementation approved  
**Date:** 2026-08-03  
**Owner:** Product Owner  
**Decision scope:** Profile-photo architecture only; no implementation, schema migration, database change, test, or rollout is approved by this ADR

## Context

Amanah Cash has approved optional Profile Photos in principle as an MVP evolution. Photos should improve human recognition without changing Student management, authentication, authorization, financial workflows, audit meaning, reports, or exports.

The current system already has:

- nullable Auth.js-compatible `User.image` metadata;
- a `Student` model with no photo reference;
- deterministic initials avatars used as the current visual identity fallback;
- Auth.js database sessions and Google Provider;
- ownership-scoped Student and financial access;
- a sanitized SQLite database backup/restore artifact; and
- a declared Vercel production target.

Vercel Functions do not provide durable shared local filesystem persistence. Vercel's official guidance also states that a local writable SQLite file is not supported as permanent serverless storage. The production SQLite arrangement must therefore be resolved and qualified separately. Regardless of that resolution, photos must not be stored on the Vercel function filesystem.

Student photos may represent children's personal data. An unguessable public URL is not sufficient access control. Image storage, delivery, backup, removal, and cleanup require explicit privacy and authorization boundaries.

## Decision

### 1. Product meaning

- Profile photos are optional recognition aids only.
- A photo never proves identity and never influences authentication, authorization, role, account status, Student ownership, Balance, Transaction behavior, or audit truth.
- Deterministic initials remain the universal fallback during absence, loading, denial, error, or missing media.

### 2. Storage

- Use a dedicated **private Vercel Blob** store for normalized profile-photo renditions.
- Never store runtime uploads on the Vercel/local filesystem or under `public/`.
- Never store image bytes in SQLite.
- Access private photos through an authenticated, authorized same-origin Next.js media route.
- Treat every stored rendition as immutable. Replacement creates new random keys; it does not overwrite an existing object.
- Keep `BLOB_READ_WRITE_TOKEN` and equivalent credentials server-only.

Private Vercel Blob is currently documented as beta. Production use requires an explicit qualification gate for service status, data residency, retention, cost, recovery, and provider contingency. Failing that gate returns the feature to architecture review; it does not authorize public Blob.

### 3. Data references

- Retain `User.image` for approved Google profile-image display metadata.
- Do not introduce a duplicate `User.photoUrl` or `User.avatarUrl`.
- Propose nullable `Student.photoObjectKey` and `Student.photoUpdatedAt` fields in a later, separately approved migration.
- Persist only opaque immutable object keys, never public URLs, expiring URLs, access tokens, original filenames, or user-supplied paths.
- A general media table is deferred until multiple asset purposes, managed User uploads, history, or moderation require it.

### 4. Processing

- Accept only JPEG, PNG, and static WebP up to 5 MiB, 8,192 × 8,192, and 25 megapixels decoded.
- Verify magic bytes and decoder output; do not trust extension or declared MIME type.
- Apply orientation, crop to 1:1, strip metadata, convert to sRGB, and re-encode static WebP.
- Store normalized 64px, 96px, 128px, and 512px square renditions; do not retain the original upload.
- Reject active, animated, unsupported, malformed, or decompression-bomb content.

### 5. Authorization

- Every upload, read, replace, remove, and restore operation requires a valid active Auth.js session and server-side authorization.
- Student media follows current Student ownership and approved management access immediately, including after ownership transfer.
- Platform Admin photo access must not create a path to Operator-owned financial data.
- Object keys are not capabilities and cannot substitute for authorization.

### 6. UI placement

Photos may appear in:

- signed-in User sidebar/header account context;
- Admin Operator list/detail identity context;
- Student list, detail header, picker, and search results;
- fixed Student context in a transaction dialog;
- Financial Assurance Student header;
- Dashboard Recent Activity; and
- Operator identity lists on the Admin dashboard.

Photos must not appear in:

- financial or ownership audit timelines/details;
- transaction history rows by default;
- aggregate KPI/dashboard cards, generic insights, or Quick Actions;
- financial reports; or
- PDF, Excel, CSV, or other exports.

### 7. Backup and restore

- Database-only backups preserve media references but not Blob bytes and are environment-bound.
- Missing media after restore degrades to initials.
- A later portable-backup version may include a strict checksummed media manifest and normalized renditions.
- Portable restore stages media under new keys, rewrites candidate references, validates the complete candidate, and activates database/media state atomically from the user's perspective.
- The existing base64 JSON backup envelope is not extended with arbitrary media bytes without a separate backup-format design and approval.

### 8. Accessibility

- Avatars adjacent to a visible name are decorative.
- Avatar-only controls receive an accessible action/name on the control, not descriptive image alt text.
- The crop workflow must be keyboard operable, visibly focused, and offer a non-gesture path.
- Loading and fallback changes do not create duplicate screen-reader announcements.

## Alternatives Considered

### Local filesystem or `public/`

Rejected. Vercel function storage is ephemeral and not shared or durable. Public assets also bypass Student authorization.

### Public Vercel Blob

Rejected. Anyone possessing the URL can read the photo. Randomness and obscurity are not access control for Student personal data.

### SQLite BLOB columns

Rejected. Binary media would enlarge SQLite writes, snapshots, restore memory, and the current base64 backup artifact while providing inferior image delivery and caching.

### External S3-compatible private storage

Viable contingency, but not selected for the MVP because it introduces another provider and operational integration. Reconsider if private Vercel Blob does not pass production qualification.

### Store full or signed URLs

Rejected. Private delivery URLs may expire, provider domains may change, and URLs couple persistence to delivery infrastructure. Opaque keys preserve provider and route flexibility.

### General MediaAsset table now

Deferred. One optional current photo per Student does not yet justify polymorphic ownership, history, or additional lifecycle complexity.

## Consequences

### Positive

- Photos survive Vercel deployments and scale independently from the application.
- Private delivery preserves ownership-based access.
- SQLite and database backups remain small.
- Immutable keys simplify caching and replacement correctness.
- Shared Avatar behavior guarantees initials fallback and UI consistency.
- The financial and audit domains remain unchanged.

### Negative

- A second durable state system creates coordination and orphan-cleanup work.
- Private image delivery adds Function and Blob transfer cost.
- Portable backup/restore becomes more complex than a database snapshot.
- Upload processing introduces a security-sensitive image decoder dependency.
- Private Vercel Blob beta status creates a production approval risk.

### Operational

- Monitor upload failures, rejected files, media authorization denials, missing objects, delivery latency, cache hit rate, storage volume, cleanup backlog, and cost.
- Use a scheduled idempotent orphan reconciler scoped to the dedicated profile-photo prefix.
- Maintain a Blob export/recovery procedure before production launch.
- Do not log media bytes, keys, signed URLs, filenames, or credentials.

## Compatibility and Supersession

This ADR supplements ADR-001 through ADR-004. It does not supersede:

- Google authentication and administrator-provisioned Amanah Cash users;
- current role and active-status authorization;
- current Student ownership;
- Platform Admin financial-data separation; or
- Transaction, Balance, and immutable financial-audit rules.

Where older UI guidance excluded avatars categorically, this approved MVP-evolution decision permits them only at the locations named above. The no-photo experience remains deterministic initials.

## Approval Gates

Before implementation, the Product Owner must approve:

1. this ADR and the companion Feature Design Specification;
2. consent, retention, removal, and uploader policy for Student photos;
3. private Vercel Blob production qualification;
4. the independently resolved durable SQLite-on-Vercel arrangement;
5. the proposed Student fields and a future migration plan; and
6. database-only and portable backup semantics.

The Product Owner accepted this ADR on 2026-08-03 and authorized Phase 1 only.
The remaining gates continue to block Student photos, uploads, media storage,
schema changes, and portable backup work until their corresponding phase is
separately approved.

## References

- `docs/53-profile-photos-feature-specification.md`
- `docs/26-adr-authentication.md`
- `docs/27-adr-authorization-and-roles.md`
- `docs/28-adr-financial-data-privacy.md`
- `docs/36-adr-transaction-balance-and-audit.md`
- `docs/21-mvp-settings-specification.md`
- Vercel Blob: https://vercel.com/docs/vercel-blob
- Vercel Private Storage: https://vercel.com/docs/vercel-blob/private-storage
- Vercel Blob Security: https://vercel.com/docs/vercel-blob/security
- Vercel SQLite guidance: https://vercel.com/kb/guide/is-sqlite-supported-in-vercel
