-- Baseline PostgreSQL Migration for Amanah Cash Production
-- Target: PostgreSQL / Neon Serverless

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PLATFORM_ADMIN', 'OPERATOR');
CREATE TYPE "ThemePreference" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'CORRECTION');
CREATE TYPE "CorrectionDirection" AS ENUM ('INCREASE', 'DECREASE');
CREATE TYPE "FinancialAuditEventType" AS ENUM ('CREATE', 'EDIT', 'DELETE', 'RESTORE', 'OWNERSHIP_TRANSFER');

-- CreateTable users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "role" "Role" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable settings_preferences
CREATE TABLE "settings_preferences" (
    "user_id" TEXT NOT NULL,
    "theme" "ThemePreference" NOT NULL DEFAULT 'SYSTEM',
    "default_page_size" INTEGER NOT NULL DEFAULT 20,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_preferences_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable maintenance_audit_events
CREATE TABLE "maintenance_audit_events" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT,
    "operation" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "artifact_created_at" TIMESTAMP(3),
    "application_version" TEXT,
    "schema_version" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable operator_audit
CREATE TABLE "operator_audit" (
    "id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operator_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable accounts
CREATE TABLE "accounts" (
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("provider", "provider_account_id")
);

-- CreateTable sessions
CREATE TABLE "sessions" (
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("session_token")
);

-- CreateTable students
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "operator_id" TEXT NOT NULL,
    "balance" BIGINT NOT NULL DEFAULT 0,
    "financial_version" INTEGER NOT NULL DEFAULT 0,
    "photo_object_key" TEXT,
    "photo_updated_at" TIMESTAMP(3),

    CONSTRAINT "students_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ck_students_balance" CHECK ("balance" >= 0),
    CONSTRAINT "ck_students_financial_version" CHECK ("financial_version" >= 0)
);

-- CreateTable transactions
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" BIGINT NOT NULL,
    "correction_direction" "CorrectionDirection",
    "reason" TEXT,
    "notes" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ck_transactions_amount" CHECK ("amount" > 0),
    CONSTRAINT "ck_transactions_revision" CHECK ("revision" >= 1),
    CONSTRAINT "ck_transactions_deletion_pair" CHECK (("deleted_at" IS NULL) = ("deleted_by" IS NULL))
);

-- CreateTable financial_audit_events
CREATE TABLE "financial_audit_events" (
    "id" TEXT NOT NULL,
    "command_id" TEXT NOT NULL,
    "command_payload_hash" TEXT NOT NULL,
    "event_type" "FinancialAuditEventType" NOT NULL,
    "actor_id" TEXT NOT NULL,
    "actor_role" "Role" NOT NULL,
    "student_id" TEXT NOT NULL,
    "transaction_id" TEXT,
    "transaction_revision" INTEGER,
    "reason" TEXT,
    "before_snapshot" TEXT,
    "after_snapshot" TEXT,
    "balance_before" BIGINT,
    "balance_after" BIGINT,
    "balance_delta" BIGINT,
    "old_operator_id" TEXT,
    "new_operator_id" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "correlation_id" TEXT NOT NULL,

    CONSTRAINT "financial_audit_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ck_financial_audit_hash" CHECK (length("command_payload_hash") = 64)
);

-- Create Indexes & Constraints
CREATE UNIQUE INDEX "uq_users_email" ON "users"("email");
CREATE INDEX "ix_maintenance_audit_occurred" ON "maintenance_audit_events"("occurred_at" DESC);
CREATE INDEX "ix_operator_audit_operator" ON "operator_audit"("operator_id", "created_at" DESC);
CREATE INDEX "ix_accounts_user" ON "accounts"("user_id");
CREATE INDEX "ix_sessions_user" ON "sessions"("user_id");
CREATE INDEX "ix_sessions_expires" ON "sessions"("expires");
CREATE INDEX "ix_students_operator" ON "students"("operator_id");
CREATE INDEX "ix_transactions_student_history" ON "transactions"("student_id", "occurred_at" DESC, "id" DESC);
CREATE INDEX "ix_transactions_student_active_history" ON "transactions"("student_id", "deleted_at", "occurred_at" DESC, "id" DESC);
CREATE INDEX "ix_transactions_student_type_date" ON "transactions"("student_id", "type", "occurred_at" DESC);
CREATE UNIQUE INDEX "uq_financial_audit_command" ON "financial_audit_events"("command_id");
CREATE INDEX "ix_financial_audit_student" ON "financial_audit_events"("student_id", "occurred_at" DESC, "id" DESC);
CREATE INDEX "ix_financial_audit_transaction_revision" ON "financial_audit_events"("transaction_id", "transaction_revision");

-- Add Foreign Key Constraints
ALTER TABLE "settings_preferences" ADD CONSTRAINT "settings_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "students" ADD CONSTRAINT "students_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "financial_audit_events" ADD CONSTRAINT "financial_audit_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "financial_audit_events" ADD CONSTRAINT "financial_audit_events_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "financial_audit_events" ADD CONSTRAINT "financial_audit_events_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
