# Amanah Cash — Profile Photos Feature Design Specification

**Status:** Approved — Phases 1, 2.1, and 2.2 complete; Phase 2.3 and Phases 3–5 pending Product Owner and Engineering gates  
**Date:** 2026-08-03  
**Feature:** Profile Photos (MVP Evolution)  
**Scope:** Architecture and feature design only; no implementation, migration, or database change is authorized by this document

## 0. Decision Summary

Amanah Cash will treat profile photos as optional recognition aids. Photos do not establish identity, authorization, ownership, role, account status, or financial truth. The existing deterministic initials avatar remains the universal base and fallback in every surface.

The proposed production design is:

```text
Browser
  ↓ authenticated request
Next.js on Vercel
  ↓ authorize, validate, normalize
Profile Photo Upload API
  ↓ write immutable objects
Private Vercel Blob store
  ↓ return opaque object key
SQLite reference
```

The application stores an opaque object key, not image bytes, a signed URL, or a public URL. Reads pass through an authorized same-origin media route. Student photos appear only where recognizing a person improves the task.

### Deployment prerequisite

The declared production target is Vercel, SQLite, Auth.js, and Google Provider. Vercel's serverless filesystem is ephemeral and does not provide the shared permanent local storage required by a writable SQLite database. Profile photos therefore must not use the local filesystem, and the production database must use a separately approved durable, Vercel-compatible SQLite arrangement. This specification does not select or migrate that database arrangement.

Profile-photo implementation is blocked until production database persistence is qualified independently. This constraint does not change the media design: image bytes belong in object storage, not SQLite.

## 1. Feature Goals

### 1.1 Product goals

- Improve recognition without changing an existing business workflow.
- Reduce wrong-person selection when names are similar.
- Keep every photo optional and removable.
- Preserve usable, stable UI when media is missing, slow, denied, corrupt, or unavailable.
- Avoid introducing photos into financial truth, audit evidence, reports, or exports.
- Preserve current Operator ownership and Platform Admin privacy separation.

### 1.2 Student photos

Student photos help an Operator distinguish people in student lists, search results, and selection controls. Their primary value is at the moment a Student is selected or confirmed. They are not proof that the person shown is the Student named by the record.

Student-photo success means fewer selection mistakes and faster recognition without making registration, transaction entry, reconciliation, or reporting depend on an image.

### 1.3 Operator and Admin photos

Operator/Admin photos provide account recognition in the application shell and help a Platform Admin distinguish Operator accounts. The existing `User.image` already represents optional Auth.js display metadata. It remains non-authoritative and must not overwrite the provisioned name, email, role, active status, or provider linkage.

The initial User-photo source is the approved Google profile image. Application-managed User uploads are outside the first implementation scope.

### 1.4 Non-goals

- Identity verification, face recognition, attendance, biometrics, or fraud detection.
- Required photos or blocking a workflow when no photo exists.
- Multiple-photo galleries or photo history visible to users.
- Photos in financial exports or audit evidence.
- Public profile pages or public image URLs.
- Changes to Student ownership, authentication, authorization, or financial rules.

## 2. Architecture

### 2.1 Component flow

```text
Browser
  ├─ renders deterministic initials immediately
  ├─ crops an optional 1:1 preview
  └─ submits the selected image
       ↓
Next.js route on Vercel
  ├─ verifies Auth.js database session
  ├─ authorizes actor against target User/Student
  ├─ enforces request and rate limits
  └─ passes bytes to the upload service
       ↓
Upload service
  ├─ verifies signature and decodes image
  ├─ checks dimensions and pixel count
  ├─ strips metadata
  ├─ re-encodes normalized renditions
  └─ writes immutable random object keys
       ↓
Private Vercel Blob
  └─ returns provider metadata/pathname
       ↓
SQLite
  └─ stores current opaque object key and update time
```

Image delivery follows a separate path:

```text
Avatar request
  ↓
same-origin media route
  ↓ authenticate and authorize subject visibility
private Blob get
  ↓
stream image with explicit Content-Type, ETag, and Cache-Control
```

### 2.2 Why this fits Vercel

- Vercel Functions are stateless; object storage survives deployments and function instances.
- Blob credentials remain server-side.
- Private delivery allows current Amanah Cash authorization rules to run before a Student photo is returned.
- Immutable keys avoid stale images across Vercel and browser caches.
- Small normalized images fit ordinary function request and response limits without multipart upload.
- Database rows remain small and backups are not inflated by binary blobs.

### 2.3 Boundaries

- The browser may crop and downscale for UX, but the server remains the validation authority.
- The upload API may write Blob objects, but only the database reference makes an upload current.
- A Blob object is never authorization evidence. Every private read re-establishes access.
- Photo failures never fail a Student, transaction, dashboard, or settings read.
- Media operations do not participate in financial transactions or financial audit events.

## 3. Data Model Proposal

No migration is authorized by this specification.

### 3.1 Current `User.image`

The current nullable `User.image` is compatible with Auth.js and is already exposed in authenticated identity data. Retain it for approved Google profile-image metadata.

Rules:

- Keep the field name `image`; do not add synonymous `photoUrl` or `avatarUrl` fields.
- Treat it as optional, mutable display metadata.
- Do not use it in admission, authorization, role, active-status, or audit decisions.
- Do not silently refresh it from Google until refresh timing and consent are approved.
- If the URL is absent, invalid, disallowed, or fails to load, show initials.
- Application-managed User uploads require a later decision about precedence over Google metadata.

### 3.2 Student proposal

Proposed fields:

```text
Student.photoObjectKey  String?    // opaque immutable storage pathname/key
Student.photoUpdatedAt DateTime?  // null with no current managed photo
```

`photoObjectKey` is preferred over `photoUrl` because:

- Private Blob URLs cannot be read anonymously.
- Signed or presigned URLs expire and must not be persisted.
- Storage domains and delivery routes may change.
- An opaque key supports authorization, deletion, restore, and provider migration.

`photoUpdatedAt` supports cache versioning, freshness, conflict handling, operational inspection, and accessible status copy. When `photoObjectKey` is null, `photoUpdatedAt` must also be null.

The MVP does not need a general `MediaAsset` table because each Student has at most one current photo and no user-visible photo history. Reconsider a media table only if managed User uploads, attachments, moderation, history, or multiple asset purposes are approved.

### 3.3 Reference rules

- Store no binary bytes in SQLite.
- Store no original filename, public URL, temporary upload token, signed URL, or access credential.
- Prefer a generated pathname such as `profile-photos/students/<random-id>/<variant>.webp`; the random segment is server-generated and does not contain a name or email.
- A new photo uses a new immutable key. Never overwrite the current key.
- Replacing/removing a photo updates the reference first and queues the old object for idempotent cleanup.

## 4. Storage Strategy

### 4.1 Selected solution: private Vercel Blob

Use one private Vercel Blob store dedicated to profile-photo media.

Reasons:

- Native Vercel project integration and serverless credentials.
- Designed for runtime user uploads and avatar-like assets.
- Durable object storage independent of deployments and function instances.
- Private stores require authenticated access.
- CDN-backed delivery and ETag/cache support.
- Lower operational burden than provisioning a separate S3-compatible provider for this small media scope.

Private Vercel Blob is currently documented as beta. Production approval therefore requires a launch gate covering service status, data residency, retention, pricing, export/recovery procedures, and an acceptable provider contingency. If it does not pass that gate, do not silently switch to public Blob; return to architecture review.

### 4.2 Rejected alternatives

| Alternative | Decision | Reason |
|---|---|---|
| Vercel/local filesystem | Reject | Ephemeral and not shared across function instances or deployments |
| `public/` uploads | Reject | Build asset area, not runtime persistence; photos would be public |
| Public Blob | Reject | Anyone with the URL can read a Student photo; unguessability is not authorization |
| SQLite BLOB | Reject | Enlarges the write path and every backup; poor delivery/caching; base64 backup inflation |
| External S3/R2 | Reserve alternative | Mature and portable, but adds provider configuration and operational surface for the MVP |

## 5. Shared Avatar Component

### 5.1 Contract

Design one reusable `Avatar` primitive for Student and User identities.

Conceptual inputs:

```text
name                  required display/fallback source
photoSource           optional authorized same-origin media source
size                  XS | SM | MD | LG | XL
altPolicy             decorative | standalone
loading               eager | lazy
```

The component owns sizing, circular clipping, deterministic initials, loading/error fallback, image fit, and accessibility behavior. It does not own authorization or construct storage-provider URLs.

### 5.2 Sizes

| Token | CSS size | Intended use | Minimum source rendition |
|---|---:|---|---:|
| XS | 24px | Recent Activity and compact context | 48px |
| SM | 32px | Lists, search results, pickers | 64px |
| MD | 40px | Sidebar/header and settings account summary | 80px |
| LG | 48px | Student or Operator detail header | 96px |
| XL | 64px | Photo edit preview or future profile surface | 128px |

All sizes use `border-radius: 50%`, fixed width and height, `object-fit: cover`, no shrink, and an optional one-pixel neutral border. Spacing is 8px beside XS/SM and 12px beside MD/LG/XL.

### 5.3 States

| State | Required presentation |
|---|---|
| No photo | Deterministic initials and deterministic muted background |
| Loading | Initials remain visible beneath/in place of the image; dimensions never change |
| Loaded | Photo covers the same circle; no label or layout change |
| Decode/network/403/404 error | Return to initials without broken-image chrome |
| Empty name | Derive from approved email when available; otherwise `?` |
| Upload preview | Local cropped preview; marked unsaved until Save succeeds |

There is no empty avatar placeholder. Neutral skeleton circles may appear only in whole-page loading skeletons where the person's name is also not yet available.

## 6. Dashboard Integration

### 6.1 Operator dashboard

| Surface | Decision | Rationale |
|---|---|---|
| Recent Activity | Include XS Student avatar | Multiple Students appear together; recognition improves scanning. Keep transaction-type icon and text because the avatar carries no event meaning. |
| Quick Actions | Exclude | Actions describe tasks, not people. |
| Smart Insights | Exclude by default | Insights communicate conditions and next steps. Include an SM avatar only if a future insight names one actionable Student and links directly to that Student. |
| KPI/dashboard cards | Exclude | Aggregate totals have no person identity. |

### 6.2 Admin dashboard

- Include SM Operator avatars in Operator-oriented recent/account lists where several Operators appear.
- Do not add Student photos to aggregate Admin cards.
- Do not expose Student photos as a path around the existing prohibition on Admin financial visibility.
- Keep role, active status, assignment count, and textual name authoritative and visible.

## 7. Student UI

| Surface | Decision | Size and behavior |
|---|---|---|
| Student list | Include | SM, leading the name; lazy below fold; entire row dimensions remain stable |
| Student detail | Include | LG beside the page title; one identity anchor only |
| Student picker | Include | SM in each result and selected value; valuable for avoiding wrong selection |
| Search results | Include | SM when results represent Students; match list behavior |
| Transaction dialog | Conditional | Show SM only in the fixed Student context header/confirmation summary; do not repeat beside each field or transaction row |
| Financial Assurance header | Include | LG once beside Student name/status to confirm context; never beside Balance or integrity verdict |

The photo must never replace the Student name, status, ownership rule, or confirmation copy.

## 8. Operator and Admin UI

| Surface | Decision | Size and behavior |
|---|---|---|
| Sidebar account area | Include | MD signed-in User image with initials fallback |
| Header/user menu | Include | MD; use the same instance as the responsive shell, not a duplicate nearby |
| Settings | Include narrowly | LG in an account summary only. Do not imply upload controls in Phase 1 because User photos are Google-sourced. |
| Admin Operator list | Include | SM leading Operator name |
| Admin Operator detail | Include | LG beside name in header; current Google image when approved/available |

Platform Admin and Operator use the same Avatar primitive. Role remains a separate textual badge.

## 9. Places Photos Must Not Appear

| Surface | Decision and reason |
|---|---|
| Financial Audit Timeline | Exclude. A current mutable portrait is not historical evidence and repeated images reduce event scanning density. |
| Audit detail/history | Exclude. Actor name, role, event, and timestamp are the evidence. |
| Financial reports | Exclude. Photos do not improve amount, date, type, status, or reconciliation interpretation. |
| PDF | Exclude. Avoid sensitive media disclosure, larger files, inconsistent rendering, and stale portraits. |
| Excel | Exclude. Images reduce interoperability and complicate row/column semantics. |
| CSV | Exclude. CSV is textual tabular data; never export media URLs or keys. |
| Other exports | Exclude by default. A later export-specific privacy review is required. |
| Transaction history rows | Exclude. Within a Student detail the identity is already fixed; in dense tables the name is sufficient. |
| KPI, cash-flow, balance, or insight cards | Exclude unless a future card is explicitly about one named Student. |

Exports must not contain Blob keys, Blob URLs, signed routes, original filenames, or embedded photos.

## 10. Upload Workflow

Student photo upload/replace is available to the currently assigned active Operator. Platform Admin may manage non-financial Student identity photos only if the existing Student-management authorization explicitly permits that operation. User-managed Operator/Admin uploads are deferred.

### 10.1 Happy path

```text
Choose photo
  ↓
client checks obvious type/size problems
  ↓
crop to 1:1 with zoom/reposition and keyboard controls
  ↓
client creates compressed preview
  ↓
user reviews Preview
  ↓
Save
  ↓
server re-authorizes and validates original/normalized upload
  ↓
server decodes, strips metadata, crops, and re-encodes
  ↓
write new immutable Blob renditions
  ↓
commit Student reference
  ↓
show saved photo and success status
  ↓
queue old object family for cleanup
```

Cropping is nondestructive until Save. The local preview must be labeled as unsaved and must not replace the persisted avatar elsewhere.

### 10.2 Cancellation and failure

- Cancel before Save: discard local object URLs and keep the persisted photo or initials unchanged.
- Validation failure: retain crop position where safe and give field-level guidance.
- Upload/processing failure: keep the previous persisted photo; show a retryable error.
- Database-reference failure after Blob write: keep the previous photo and enqueue the new object family as orphaned.
- Photo delivery failure after success: show initials; do not block the page.
- Concurrent replacement: reject stale save or use a version precondition; never let the older operation delete the newer photo.

### 10.3 Remove workflow

`Remove photo` requires a confirmation that initials will be shown. Commit the null reference first, immediately render initials after success, and delete the former object family asynchronously and idempotently.

## 11. Image Processing

### 11.1 Input limits

| Constraint | Decision |
|---|---|
| Maximum encoded upload | 5 MiB |
| Maximum dimensions | 8,192 × 8,192 |
| Maximum decoded pixels | 25 megapixels |
| Accepted input | JPEG, PNG, WebP |
| Rejected input | SVG, GIF, animated WebP, HEIC/HEIF, TIFF, BMP, PDF, HTML, arbitrary binary |
| Crop | Required square crop; center crop is only a default and remains adjustable |

Both client and server enforce user-friendly limits; only the server decision is authoritative.

### 11.2 Output

- Apply EXIF orientation before crop.
- Strip EXIF, GPS, comments, color-profile data not required for correct display, and original filename.
- Re-encode static WebP in sRGB.
- Store no original upload after successful processing.
- Produce immutable 64px, 96px, 128px, and 512px square renditions. The 512px normalized master supports future regeneration without retaining the original.
- Start with WebP quality approximately 80 and adjust only through measured visual/size testing.
- Target typical rendition sizes below 30 KiB; this is a monitoring target, not a reason to accept visibly damaged output.

XS may use 64px; SM uses 64px; MD/LG use 96px; XL uses 128px. Do not upscale a source that cannot meet the required rendition cleanly; request another image when necessary.

### 11.3 Loading and cache policy

- Eager-load only the current signed-in avatar and an above-fold detail identity anchor.
- Lazy-load list, search, dashboard, and below-fold avatars with asynchronous decoding.
- Treat Blob objects as immutable and use a new random key for every replacement.
- Private media responses use ETag and conditional requests.
- Allow private CDN caching; apply browser `private` caching because Student authorization is user-specific.
- The same-origin media URL includes an immutable asset/version identifier, never an expiring credential.
- Do not cache authorization failures as successful media responses.

## 12. Security and Privacy

### 12.1 Authorization

- Require a valid active Auth.js database session for upload, read, replace, remove, and portable backup operations.
- An Operator may read or manage a Student photo only while current Student ownership and status policy authorize the operation.
- Platform Admin access remains limited to approved Student-management identity data and must not expose financial records.
- A User photo is readable within authenticated account-management contexts; self-service replacement is out of scope.
- Blob tokens are server-only and never returned to the browser.
- Deny by default when the subject, role, active status, or ownership cannot be established.

### 12.2 Validation

- Enforce request-size limits before full buffering where the runtime permits.
- Compare declared MIME type, magic bytes, and successful decoder output.
- Decode and re-encode every accepted image; never serve user-supplied bytes directly.
- Reject malformed, truncated, polyglot, animated, oversized-dimension, and decompression-bomb candidates.
- Serve only the application's normalized WebP output with `X-Content-Type-Options: nosniff`.

### 12.3 Malware considerations

Decoder validation and re-encoding remove most active-content risk for the narrow raster allowlist. Maintain the image-decoding library as a security-sensitive dependency. A separate antivirus scanner is not required for MVP normalized raster images, but becomes mandatory for retained originals, broader file types, or download-as-uploaded behavior.

### 12.4 Keys and path traversal

- Generate every Blob pathname on the server from fixed prefixes plus cryptographically random identifiers.
- Never concatenate a client filename, Student name, email, or arbitrary path segment.
- Never accept a client-supplied Blob key for deletion or retrieval without resolving it from an authorized database record.
- Validate portable-backup archive paths against a strict manifest and reject absolute paths, `..`, duplicates, symlinks, and unexpected members.

### 12.5 Orphan cleanup

- Record enough operational metadata to retry cleanup without logging image content or credentials.
- Cleanup is idempotent and must verify the object is not the current reference before deletion.
- Run scheduled reconciliation over the dedicated prefix: referenced objects remain; unreferenced staged objects older than a safety window are deleted.
- Replacement and remove operations must tolerate Blob deletion failure without rolling back a correct new database reference.

### 12.6 Privacy

- Approve consent, notice, retention, removal, and incident handling before Student upload is enabled.
- Never present a photo as verified identity.
- Never place image bytes, keys, signed URLs, or filenames in application logs, audit summaries, analytics, or error messages.
- Storage region and subprocessors require Product Owner/security approval because Student photos may be children's personal data.

## 13. Backup and Restore

### 13.1 Database-only backup

The current database backup naturally preserves `photoObjectKey` and `photoUpdatedAt` after those fields exist, but it does not preserve Blob bytes. A database-only artifact is therefore environment-bound:

- Restoring while connected to the same intact Blob store preserves photos.
- Restoring into another project/store produces unresolved references.
- Unresolved, missing, or unauthorized media always renders initials, never a broken placeholder.

The backup UI must label database-only scope and must not imply portable photo recovery.

### 13.2 Portable backup

A later portable-media mode should package:

- the sanitized SQLite snapshot;
- a versioned media manifest;
- each currently referenced normalized photo rendition;
- content type, byte size, and SHA-256 checksum for every member; and
- an explicit `mediaIncluded` flag.

Portable backup should default to including media once the mode is production-ready, while allowing an Admin to exclude media to reduce size. Exclusion must clearly state that restored records will use initials unless their referenced Blob store remains available.

### 13.3 Restore rules

- Inspect and validate the complete database and media manifest before changing live state.
- Enforce artifact, entry-count, entry-size, aggregate-size, pathname, MIME, and checksum limits.
- Restore objects under new immutable keys, then rewrite references in the candidate database before cutover.
- Do not trust storage keys embedded in an artifact as write destinations.
- Make database and media replacement atomic from the user's perspective; partial success must not become active state.
- Create a compatible pre-restore safety backup.
- On rollback, retain current state and clean staged restore objects asynchronously.
- Continue accepting older database-only artifacts; their absent media uses initials.

The existing base64 JSON envelope and 100 MiB ceiling are unsuitable for a growing media bundle. Portable media should use a streamed, versioned archive rather than base64-encoding image bytes into JSON. This requires a separate backup-format design and approval before Phase 4.

## 14. Accessibility

### 14.1 Image alternatives

- When the person's visible name is adjacent, the avatar is decorative: use `alt=""` or an equivalent hidden-image treatment.
- Do not expose both initials and the adjacent name to a screen reader.
- When the avatar is the only visible content of a button, the button—not the image—gets an accessible name such as `Buka menu akun Siti Aminah`.
- Never use `Foto`, a filename, object key, or URL as alt text.
- Role, Student status, transaction type, and financial state remain textual.

### 14.2 Upload controls

- `Choose photo`, `Change photo`, `Remove photo`, `Cancel`, and `Save photo` have explicit accessible names.
- The crop control supports keyboard zoom/reposition, visible focus, and instructions that do not depend on gesture alone.
- Offer a `Use without further crop`/center-crop path if the interactive cropper is not operable.
- Announce validation and save results once through the established status/error pattern.
- Move focus to the first actionable error after failed validation; after modal close, restore focus to its trigger.
- The preview's unsaved status is available to assistive technology.
- Photo loading/fallback changes do not trigger live announcements.

## 15. Implementation Roadmap

No phase begins until this specification and ADR-005 are approved.

### Phase 0 — prerequisites and contracts

- Resolve durable SQLite compatibility for Vercel independently.
- Approve Student-photo privacy, consent, retention, and uploader policy.
- Qualify private Vercel Blob beta status, region, cost, recovery, and provider contingency.
- Finalize media endpoint authorization matrix and operational limits.
- Approve proposed schema and backup-format direction; still no migration in this phase.

### Phase 1 — shared avatar and User photos — Complete

- Introduce the shared Avatar contract while preserving current initials exactly.
- Pass existing `User.image` to the application shell.
- Enable Google-sourced photos in sidebar/header and approved Admin Operator surfaces.
- Add remote-source allowlisting/proxy policy and fallback telemetry.
- Do not add User upload controls.

Phase 1 implementation note (2026-08-03): the shared Avatar, authenticated
header/sidebar integration, and read-only Admin/Operator Settings account section
are complete using only the existing `User.image`. The Admin Operator list did
not previously display avatars, so its read model and UI were left unchanged.
No Student, upload, storage, schema, API, authentication, authorization, or
backup scope was introduced.

### Phase 2 — Student photo core — In progress

#### Phase 2.1 — Student Photo Foundation — Complete

- Added nullable `Student.photoObjectKey` and `Student.photoUpdatedAt` fields through migration `013_student_profile_photo_foundation.sql`.
- Enforced the invariant that the key and update timestamp are either both null or both populated.
- Added provider-neutral media storage, image-processor, media-service, metadata, validation, and immutable-key contracts under `src/media/`.
- Kept the Student-photo UI flag disabled and left all Student read models and presentation unchanged.
- Added no upload endpoint, image processor implementation, Vercel Blob adapter, delete/restore behavior, dashboard integration, Financial Assurance integration, or backup integration.

#### Phase 2.2 — Student Upload Workflow — Complete

- Added the assigned-Operator Student Detail upload control with explicit 1:1 crop confirmation, keyboard sliders, compressed local WebP preview, cancellation, and recoverable status/error feedback.
- Added an authenticated owner-only upload route; no public or private media delivery route was added.
- Added authoritative Sharp decode/validation, orientation, crop, metadata stripping, sRGB WebP normalization, and the approved 64px, 96px, 128px, and 512px immutable renditions.
- Added the private Vercel Blob provider adapter behind `MediaStorage`; persistence stores only `photoObjectKey` and `photoUpdatedAt` after every rendition succeeds.
- Replacement retains the old family. Conflict or persistence failure preserves the Student reference and attempts immediate rollback only for the newly written objects.
- Added no delete-photo behavior, old-object lifecycle cleanup, media read route, dashboard photo, Financial Assurance photo, or backup integration.

#### Phase 2.3 — Student UI Integration — Pending

- Add Student photos to list, detail, picker/search, transaction context, and Financial Assurance header.
- Verify ownership transfer immediately changes media-read/manage authorization.

### Phase 3 — dashboard integration — Pending

- Add XS Student avatars to Recent Activity.
- Add SM Operator avatars to approved Admin dashboard identity lists.
- Measure request volume, cache hit rate, failures, layout shift, and dashboard responsiveness.
- Do not expand photos to aggregate cards, generic insights, or quick actions.

### Phase 4 — portable backup and restore — Pending

- Design and version a streamed media archive.
- Add optional media inclusion with clear scope labels.
- Restore under new keys with full validation and rollback cleanup.
- Exercise cross-project/store recovery and database-only backward compatibility.
- Update disaster-recovery runbooks only after verified implementation.

### Phase 5 — rollout and evaluation — Pending

- Enable for a small Operator cohort or feature flag.
- Review authorization denials, broken-media fallback, orphan rate, storage cost, and user feedback.
- Expand only after privacy, performance, accessibility, backup, and restore acceptance criteria pass.

## 16. Complexity and Regression Risk

| Area | Estimate | Main risk |
|---|---|---|
| Technical complexity | Medium–High | Non-transactional coordination across Blob and SQLite, secure processing, private delivery |
| UI complexity | Medium | Crop accessibility, multiple responsive placements, stable fallback states |
| Migration risk | Low–Medium | Two nullable fields are simple, but every relevant projection and backup/restore contract must remain compatible |
| Deployment risk | High until prerequisites resolve | Vercel cannot persist a local SQLite file; private Blob is currently beta |
| Authorization risk | High | Student photos must follow current ownership and Admin privacy separation on every read/write |
| Financial regression risk | Low | Photos stay outside Balance, Transaction, financial version, audit evidence, reports, and exports |
| Backup/restore risk | High in Phase 4 | Coordinating portable database and media state without partial activation |

### 16.1 Required regression boundaries

- No-photo records render exactly usable initials in every surface.
- A photo failure cannot fail page data or business actions.
- Operator ownership remains authoritative before and after transfer.
- Platform Admin gains no financial visibility.
- Session, role, name, email, Balance, Transaction, audit, report, and export semantics do not change.
- Legacy database-only backups remain inspectable/restorable under their existing compatibility rules.
- No report or export gains media data.

## 17. Acceptance Gates

Product Owner approval must explicitly confirm:

1. Photos are optional recognition aids and not identity verification.
2. Student-photo consent, retention, and uploader roles.
3. Private Vercel Blob as the selected media provider despite its current beta status, or a return to architecture review.
4. The durable SQLite-on-Vercel prerequisite is resolved outside this feature.
5. The exact UI inclusion/exclusion list in this specification.
6. Database-only versus portable backup semantics.
7. No code, migration, test, or production rollout is authorized merely by approving this design document.

## 18. External Platform References

- Vercel, “Vercel Blob”: https://vercel.com/docs/vercel-blob
- Vercel, “Private Storage”: https://vercel.com/docs/vercel-blob/private-storage
- Vercel, “Security”: https://vercel.com/docs/vercel-blob/security
- Vercel, “Is SQLite supported in Vercel?”: https://vercel.com/kb/guide/is-sqlite-supported-in-vercel
