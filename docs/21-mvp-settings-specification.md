# Amanah Cash — MVP Settings Specification

**Version:** 1.0  
**Status:** Approved Product and Design Specification  
**Owner:** Product Owner  
**Last Updated:** 2026-07-29

---

## 1. Purpose

This document defines the complete MVP Settings module. It is authoritative for
Settings scope, roles, behavior, information architecture, safety boundaries,
and acceptance criteria.

Settings exists to improve daily operation and continuity. It is not a place for
enterprise administration, cosmetic personalization, speculative integrations,
or controls over financial invariants.

## 2. Product Principles

Every Settings control must:

1. solve a recurring usability, security, recovery, or product-transparency need;
2. have a safe and understandable default;
3. explain its consequence in plain language;
4. preserve authorization, ownership, exact-IDR arithmetic, immutable audit, and
   the persisted-Balance consistency boundary; and
5. remain absent when its benefit is unclear.

Settings never exposes Student ownership, financial rules, transaction types,
Balance calculation, audit retention, authorization, or privacy boundaries as
configurable preferences.

## 3. Roles and Routes

Both authenticated roles receive a real Settings screen:

| Role | Route | Available groups |
|---|---|---|
| Platform Admin | `/admin/settings` | Appearance, Preferences, Data, Security, About |
| Operator | `/operator/settings` | Appearance, Preferences, Security, About |

Platform Admin alone may perform Backup and Restore. Operators cannot request,
download, inspect, validate, or restore a whole-application backup.

All Settings reads and mutations require an active authenticated user. Role and
active-state authorization is enforced on the server; hidden navigation is not
an authorization boundary.

## 4. Information Architecture

The screen uses a single responsive column of five restrained groups:

1. Appearance
2. Preferences
3. Data — Platform Admin only
4. Security
5. About

Rows use a visible label, concise current value, and supporting consequence when
needed. The page has no dashboard cards, charts, promotional content, search,
nested enterprise menus, or decorative personalization.

## 5. Appearance

### 5.1 Theme

Theme has exactly four values:

| Value | Behavior |
|---|---|
| `LIGHT` | Always use the approved light theme. |
| `DARK` | Always use the intentionally designed dark theme. |
| `SYSTEM` | Follow the operating-system/browser color-scheme preference and update when it changes. |
| `TIME` | Use Light from 06:00–17:59 local time and Dark from 18:00–05:59 local time. |

The default is `SYSTEM`.

Theme is a per-user preference and applies across public-independent
authenticated application screens. The chosen preference follows the user
across browsers and devices after login. Before authentication, or while the
stored preference is loading, the application may use the device preference but
must avoid a disruptive theme flash.

Dark mode is not a color inversion. It requires a reviewed semantic palette for
surfaces, text, borders, focus, controls, overlays, charts, transaction
directions, success, warning, and error states. Deposit and Withdrawal meaning
continues to use text and iconography; color remains reinforcement only.
Its approved visual direction is Modern Tech & Finance: calm blue-slate
surfaces, soft near-white text, restrained sky action emphasis, subtle
elevation, and financial content that remains visually dominant. The complete
mapping is governed by `docs/18-design-tokens.md`; reference colors must not be
hard-coded into controls or screens.

Light mode follows the approved Tropical Sunrise direction: a white-dominant
canvas, quiet secondary background, optional light-cyan surface separation,
dark neutral text, teal interaction emphasis, and sparing orange or soft-yellow
highlights. Financial status colors remain independent, and reference colors
must not be hard-coded into controls or screens.

Light and Dark preserve identical spacing, typography, component structure,
iconography, interaction behavior, and semantic meaning. Theme changes only
select the reviewed semantic color mapping.

Theme changes affect presentation only. They never change business data,
financial meaning, export content, printable document styling, or audit
evidence.

### 5.2 Theme Accessibility

- Every light and dark semantic pairing must meet the contrast requirements in
  `docs/16-accessibility-guidelines.md`.
- Native controls declare the active color scheme so browser-provided UI matches
  the chosen theme.
- Focus indicators remain visible on every surface.
- Theme selection is operable by keyboard and announced by accessible name and
  selected state.
- `SYSTEM` is presented as a distinct choice, not as an ambiguous automatic
  toggle.
- `TIME` uses the user's browser/device local time, changes at 06:00 and 18:00
  without a page reload, and is presented as a distinct choice from `SYSTEM`.

## 6. Preferences

### 6.1 Default Items per Page

Users may choose `10`, `20`, or `50` items. The default is `20`.

The preference supplies the initial page size for paginated operational lists
and tables that support those sizes. It applies when the current URL does not
already contain a valid explicit page-size value. A valid URL value wins for
that view so shared/bookmarked views remain deterministic.

Changing the default:

- applies to the next compatible list navigation or refresh;
- resets that list to its first page when changed from within a list control;
- does not alter export limits or export row counts;
- does not change unpaginated controls, autocomplete result limits, audit
  retention, or database query safety limits; and
- must not expose records outside the user's existing authorization scope.

### 6.2 Delete Confirmation

Delete confirmation is not configurable in the MVP.

Transaction soft delete and logical administrative deletion retain their
required confirmation, reason, revision, and server validation. Removing a
safety confirmation offers insufficient daily value compared with the risk of
mistakes. Settings must not present a non-functional or misleading toggle for
it.

### 6.3 Preference Persistence and Failure

Preferences are stored per provisioned user, not per browser.

- A successful save takes effect without requiring logout.
- Concurrent updates use a last-accepted-write rule for independent preference
  fields; the server returns the committed preference state.
- Invalid or unsupported values fail closed and do not alter the stored value.
- If preferences cannot be loaded, the application uses safe defaults for that
  request and shows a non-destructive retry state in Settings.
- A failed save retains the previous committed value and exposes an explicit
  error; optimistic presentation must reconcile to the server result.
- Preference changes contain no financial payload and do not enter financial
  audit history.

## 7. Data — Backup and Restore

### 7.1 Purpose and Use Cases

Backup and Restore preserve the application's operational state for:

- moving to a new computer;
- device replacement;
- manual backup; and
- disaster recovery.

This user-facing capability complements, but does not replace, deployment-level
backup, retention, restore rehearsal, and disaster-recovery procedures.

### 7.2 Backup Scope

A successful backup preserves the business and authorization state required to
continue using the application after a compatible migration or recovery:

- provisioned users, roles, active/deleted lifecycle state, and identity mapping;
- Students, status, notes, current Operator assignment, persisted Balance, and
  financial version;
- Transactions, revisions, occurrence data, actor metadata, and soft-deletion
  state;
- immutable financial and ownership/operator audit evidence;
- persisted user Settings preferences;
- schema/migration metadata required to validate and upgrade the backup; and
- other server-owned relational records required to preserve referential and
  operational integrity.

The backup excludes:

- environment variables, OAuth client secrets, application secrets, signing
  keys, and deployment configuration;
- source code, logs, caches, temporary exports, and generated screenshots;
- current database sessions and session tokens; and
- browser-local or device-local transient state.

After Restore, users authenticate again through Google. A backup never creates
password authentication or transports reusable login sessions.

### 7.3 Backup Artifact

The application produces one versioned, opaque backup artifact with:

- a stable Amanah Cash format identifier;
- backup format version;
- source application version and schema version;
- creation timestamp;
- integrity digest/check; and
- the complete approved payload.

The artifact is sensitive even when opaque. The UI warns the Admin to store it
securely and never claims encryption unless an approved implementation actually
provides and verifies encryption.

Backup generation must use one database-consistent snapshot. It must never
assemble independently timed table exports or expose financial records as a
human-readable report. The Admin receives the artifact but no routine
application UI for browsing its financial payload.

### 7.4 Restore Validation

Restore accepts only a supported Amanah Cash backup artifact. Before any
replacement, the server validates:

- format and version compatibility;
- artifact integrity;
- required records and referential integrity;
- schema/migration compatibility;
- whole-Rupiah and enum constraints;
- Student ownership validity;
- persisted Balance against active Transaction effects;
- immutable audit structure; and
- the availability of a safe atomic replacement procedure.

Invalid, corrupt, incomplete, newer-unsupported, or inconsistent artifacts fail
without changing current data.

### 7.5 Restore Interaction and Safety

Restore is a destructive whole-application maintenance operation:

1. The Admin selects one local backup artifact.
2. The UI shows file identity, creation time, source version, and a plain
   replacement warning after server validation.
3. The Admin explicitly confirms that current application data will be replaced.
4. The server creates and verifies a pre-restore safety backup.
5. Restore commits the complete validated state atomically or leaves the current
   state unchanged.
6. All existing sessions are invalidated.
7. The Admin signs in again and receives a clear success or failure result.

Restore never merges selected Students, Transactions, users, or preferences.
Partial restore, cross-tenant import, conflict resolution, and backup editing are
outside MVP scope.

The implementation must prevent concurrent financial or administrative writes
during the replacement window and must provide a recoverable maintenance state
if the process is interrupted.

### 7.6 Privacy and Audit

- Only Platform Admin may initiate Backup or Restore.
- Routine Admin pages still cannot read Student financial details.
- Backup download and Restore attempt/outcome are recorded in a
  privacy-minimized maintenance audit containing actor, time, artifact metadata,
  outcome, and failure category—not Transaction rows, Balances, secrets, or the
  artifact itself.
- Backup artifacts and file names must not contain Student names, Operator
  names, Balances, or other business payload.
- The application never logs backup payloads, session tokens, secrets, or
  restored financial records.

## 8. Security

### 8.1 Change Password

Amanah Cash has no application password. Google remains the only authentication
provider.

The Settings row is labeled `Ubah kata sandi Google` (“Change Google password”)
and explains that account credentials are managed by Google. Activating it opens
Google Account Security using a normal external link in a new browser context.
The UI does not ask for, receive, validate, store, or reset a password and does
not imply that a Google password change immediately revokes Amanah Cash
sessions.

The row must remain useful without becoming account self-service: it includes a
short reminder that suspected Amanah Cash access should also be reported to the
Platform Admin so the provisioned account can be deactivated and sessions
revoked.

## 9. About

### 9.1 Application Version

Settings displays the build's user-facing application version. It is read-only,
comes from one build-time source of truth, and is never inferred from database
contents or client cache.

### 9.2 Changelog

Settings provides a `Lihat perubahan` (“View changelog”) action to a read-only,
in-application Changelog view derived from the maintained project changelog.

The MVP Changelog:

- shows released, user-relevant changes newest first;
- excludes unreleased internal notes, secrets, vulnerability exploitation
  details, stack traces, commit hashes, and developer-only migration steps;
- supports a direct, stable route reachable from Settings; and
- provides an explicit empty/error state if release notes cannot be loaded.

No update checker, auto-update mechanism, telemetry, feedback form, support
portal, license marketplace, or promotional content is implied.

## 10. Screen States and Interaction

Settings defines:

- loading state with layout-stable group/row skeletons;
- loaded state with current committed values;
- saving state local to the changed preference;
- save success conveyed persistently and, if used, by supplemental status
  announcement;
- load/save error with retry and no loss of the last committed value;
- Backup preparation, ready/download, and failure states;
- Restore unselected, validating, invalid, ready-to-confirm, replacing,
  success/session-ended, and failure states; and
- About/Changelog loaded, empty, and failure states.

Only one preference mutation is disabled while that same row is saving. Backup
and Restore may lock their Data group while active. Whole-page disabling is
reserved for the actual Restore maintenance window.

Focus moves only for validation errors, the Restore confirmation dialog, or the
post-Restore sign-in transition. Dialog close restores focus to its trigger.
Progress and terminal outcomes use concise accessible status messages.

## 11. Data Model Contract

Each provisioned user has one Settings preference record:

| Field | Type | Rules |
|---|---|---|
| `user_id` | UUID/foreign key | Primary key; cascades only with the existing approved user lifecycle |
| `theme` | Enum | `LIGHT`, `DARK`, `SYSTEM`, or `TIME`; default `SYSTEM` |
| `default_page_size` | Integer | `10`, `20`, or `50`; default `20` |
| `created_at` | Timestamp | Server generated |
| `updated_at` | Timestamp | Server generated on committed change |

Missing preference rows resolve to defaults and may be created lazily on first
successful update. No financial preference is stored.

Maintenance audit records Backup and Restore operations separately from
financial audit. Backup artifacts are files produced on demand, not durable
application records.

## 12. Explicit Exclusions

The MVP Settings module does not include:

- profile photo;
- biography;
- social links;
- multiple languages or language selection;
- organization or school profile;
- branding customization;
- enterprise integrations;
- API keys;
- SMTP configuration;
- notification settings;
- application-managed password, password reset, or public account self-service;
- delete-confirmation bypass;
- configurable currency, transaction types, Balance rules, audit retention,
  ownership, roles, or authorization;
- partial/selective backup or restore;
- scheduled/cloud backup, remote storage, sync, sharing, or backup browsing;
- update checker, telemetry, or analytics preferences; or
- any preference without a documented day-to-day benefit.

## 13. Acceptance Summary

The Settings MVP is complete only when:

- both roles can use the approved Appearance, Preferences, Security, and About
  groups, while Data remains Platform Admin-only;
- Theme supports Light, Dark, System, and Time through complete reviewed semantic
  palettes;
- default page size behaves predictably across compatible lists and URLs;
- destructive confirmations and financial invariants remain non-configurable;
- Backup preserves the approved operational state in one consistent artifact;
- Restore validates, safety-backs-up, atomically replaces, invalidates sessions,
  and fails without partial change;
- Platform Admin privacy and Operator ownership boundaries remain intact;
- password handling remains entirely with Google;
- Version and sanitized Changelog information are truthful and read-only;
- all loading, saving, validation, error, confirmation, maintenance, responsive,
  keyboard, focus, and announcement states pass their documented contracts; and
- every excluded feature remains absent.
