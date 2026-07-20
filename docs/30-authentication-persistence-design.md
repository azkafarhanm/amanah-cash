# Authentication Persistence Design

**Status:** Implemented persistence contract  
**Date:** 2026-07-20  
**Scope:** Prisma schema, Auth.js adapter storage, and Student ownership only

## 1. Contract and boundaries

This persistence design implements ADR-001, ADR-002, ADR-003, and the Authentication and Authorization TDS. It introduces no Auth.js configuration, provider, callback, session behavior, bootstrap executable, route protection, authorization middleware, API, or UI.

The existing SQLite migration runner remains the application-startup migration authority. The executable migration is `migrations/002_auth_identity_and_ownership.sql`; the Prisma migration artifact at `prisma/migrations/20260720000000_auth_identity_and_ownership/migration.sql` is kept identical by an automated test. This avoids changing the working persistence bootstrap during an identity-only sprint while providing the Prisma migration artifact needed by the next integration sprint.

## 2. Model decisions

| Model or field | Decision | Reason |
|---|---|---|
| `User` | Official Auth.js Prisma model baseline plus `role`, `isActive`, and Operator-owned Students | Amanah Cash user is both the pre-provisioned admission record and authorization identity |
| `User.name` | Required, trimmed, non-empty | Platform Admin provisioning requires Full Name; Google must not create/overwrite the authorization profile |
| `User.email` | Required, lowercase/trimmed, unique | Implements exact normalized Google-email admission and duplicate prevention |
| `User.emailVerified`, `User.image` | Nullable Auth.js adapter fields | Adapter compatibility; neither authorizes access |
| `User.role` | Required closed enum: `PLATFORM_ADMIN`, `OPERATOR`; no default | Prevents an adapter-created or incomplete row from receiving an implicit role |
| `User.isActive` | Required boolean, default false | New/incomplete rows fail closed; future provisioning/bootstrap must activate explicitly |
| `Account` | Official OAuth account shape and `(provider, providerAccountId)` primary key | Supports immutable Google subject linkage without a custom auth table |
| `Session` | Official database-session shape; opaque `sessionToken` primary key | Supports direct token lookup, uniqueness, expiry, per-user revocation, and cleanup |
| `VerificationToken` | Omitted | Google-only OAuth does not use email magic links or verification tokens |
| `Authenticator` | Omitted | WebAuthn/passkeys are outside the approved Google-only architecture |
| `Student.operatorId` | Required FK to `User`, delete restricted | Every Student has exactly one current owner and cannot become orphaned |
| `Transaction` | Unchanged | Authentication must not add actor attribution or alter immutable financial history |

Prisma model names stay compatible with the Auth.js Prisma adapter. `@@map` and `@map` preserve the project's lowercase snake-case SQLite convention. No password, password reset, registration, permission, tenant, MFA, audit-log, balance, or Transaction-actor field is introduced.

## 3. Referential actions and database enforcement

- Deleting a User cascades to that User's `accounts` and `sessions`; these records have no meaning without the identity.
- Deleting a User is restricted while that User owns any Student. Students must be transferred first.
- Student deletion remains restricted when Transactions exist.
- Primary identifiers are immutable; all foreign keys use `ON UPDATE NO ACTION` rather than cascading identity changes.
- Database triggers accept a Student owner only when the referenced User is currently active and has role `OPERATOR`.
- A User who owns Students cannot be deactivated or changed away from `OPERATOR` until those Students are transferred.
- The database cannot enforce the authorization required to perform a transfer; that remains a future server-side application operation.

The ownership trigger is a physical SQLite constraint not expressible as a Prisma relation. Prisma describes the required FK; the migration adds the cross-row role/active invariant.

## 4. Indexes and uniqueness

| Index/key | Purpose |
|---|---|
| `uq_users_email` | Unique normalized Google email admission lookup |
| Account composite primary key | Unique provider subject and Auth.js `getUserByAccount` lookup |
| `ix_accounts_user` | User-linked account lookup and cascade support |
| Session-token primary key | Unique database-session lookup |
| `ix_sessions_user` | Revoke all sessions for a User |
| `ix_sessions_expires` | Expired-session cleanup |
| `ix_students_operator` | Ownership-scoped Student list/search and transfer checks |
| Existing Student-name and Transaction-history indexes | Preserve current financial behavior |

SQLite email uniqueness is case-sensitive by storage, while a check constraint requires the stored email to equal `lower(trim(email))`. Together these enforce the TDS normalization contract without Gmail alias rewriting.

## 5. Migration and rollback

The migration:

1. Creates `users`, `accounts`, and `sessions` as SQLite `STRICT` tables.
2. Adds keys, foreign keys, checks, and indexes.
3. Rebuilds `students` with required `operator_id`, preserving its prior columns and constraints.
4. Restores the existing case-insensitive Student-name index.
5. Adds active-Operator ownership triggers.
6. Leaves `transactions` unchanged.

The migration deliberately attempts no automatic data backfill and creates no User. If any Student already exists, the required `operator_id` copy fails and the existing migration runner rolls back the complete migration. Before applying to a populated database, an approved operational migration must provision active Operators and provide an explicit Student-to-Operator mapping. That operation must be reviewed separately because this sprint forbids bootstrap logic and cannot infer ownership safely.

`rollback.sql` is an explicit maintenance rollback because Prisma Migrate has no automatic down-migration command. It disables FK enforcement only for the controlled table rebuild, removes auth/ownership objects, restores the prior Student shape, preserves Students and Transactions, removes the migration-runner record, commits atomically, re-enables FK enforcement, and runs `foreign_key_check`. Run it only with the application stopped and a verified backup.

## 6. Bootstrap preparation

There is no seed file and no automatic User creation. The future `SUPER_ADMIN_EMAIL` bootstrap operation can create a User because the schema provides required normalized `email`, required `name`, required `PLATFORM_ADMIN` role, and explicit `isActive`. The environment variable is not consumed in this sprint. `SUPER_ADMIN_EMAIL` is not stored as a separate field and does not create a `SUPER_ADMIN` role.

## 7. Operational notes for the Auth.js sprint

- Auth.js integration must use the generated Prisma client and the approved database-session strategy.
- Admission logic must link Google to an existing active User; it must not rely on the adapter to create a provisioned User.
- Because `name` and `role` are required and role has no default, an unintended generic adapter `createUser` call fails closed.
- Provider-token retention must follow the TDS. Nullable Account token fields exist for adapter compatibility; their presence does not authorize retaining offline credentials.
- The runtime must continue enabling SQLite foreign keys and use the existing single-writer boundary.
- The separately approved populated-database ownership mapping must be completed before production migration.
