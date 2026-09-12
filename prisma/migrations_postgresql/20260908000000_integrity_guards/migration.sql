-- PostgreSQL integrity parity for the SQLite financial persistence contract.

ALTER TABLE "users"
  ADD CONSTRAINT "ck_users_name_normalized"
  CHECK (length(btrim("name")) > 0 AND "name" = btrim("name"));

ALTER TABLE "users"
  ADD CONSTRAINT "ck_users_email_normalized"
  CHECK (length(btrim("email")) > 0 AND "email" = lower(btrim("email")));

ALTER TABLE "settings_preferences"
  ADD CONSTRAINT "ck_settings_default_page_size"
  CHECK ("default_page_size" IN (10, 20, 50));

ALTER TABLE "transactions"
  ADD CONSTRAINT "ck_transactions_correction"
  CHECK (
    (
      "type" = 'CORRECTION'
      AND "correction_direction" IS NOT NULL
      AND "reason" IS NOT NULL
      AND length(btrim("reason")) BETWEEN 1 AND 500
      AND "reason" = btrim("reason")
    )
    OR (
      "type" <> 'CORRECTION'
      AND "correction_direction" IS NULL
      AND "reason" IS NULL
    )
  );

ALTER TABLE "transactions"
  ADD CONSTRAINT "ck_transactions_notes"
  CHECK (
    "notes" IS NULL
    OR (
      length(btrim("notes")) BETWEEN 1 AND 500
      AND "notes" = btrim("notes")
    )
  );

ALTER TABLE "financial_audit_events"
  ADD CONSTRAINT "ck_financial_audit_shape"
  CHECK (
    (
      "event_type" = 'OWNERSHIP_TRANSFER'
      AND "transaction_id" IS NULL
      AND "transaction_revision" IS NULL
      AND "before_snapshot" IS NULL
      AND "after_snapshot" IS NULL
      AND "balance_before" IS NULL
      AND "balance_after" IS NULL
      AND "balance_delta" IS NULL
      AND "old_operator_id" IS NOT NULL
      AND "new_operator_id" IS NOT NULL
      AND "reason" IS NOT NULL
    )
    OR (
      "event_type" <> 'OWNERSHIP_TRANSFER'
      AND "actor_role" = 'OPERATOR'
      AND "transaction_id" IS NOT NULL
      AND "transaction_revision" IS NOT NULL
      AND "after_snapshot" IS NOT NULL
      AND "balance_before" IS NOT NULL
      AND "balance_after" IS NOT NULL
      AND "balance_delta" IS NOT NULL
      AND "old_operator_id" IS NULL
      AND "new_operator_id" IS NULL
      AND (
        ("event_type" = 'CREATE' AND "before_snapshot" IS NULL)
        OR ("event_type" <> 'CREATE' AND "before_snapshot" IS NOT NULL)
      )
      AND ("event_type" = 'CREATE' OR "reason" IS NOT NULL)
    )
  );

ALTER TABLE "financial_audit_events"
  ADD CONSTRAINT "ck_financial_audit_reason"
  CHECK (
    "reason" IS NULL
    OR (
      length(btrim("reason")) BETWEEN 1 AND 500
      AND "reason" = btrim("reason")
    )
  );

CREATE OR REPLACE FUNCTION amanah_enforce_active_student_owner()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "users"
    WHERE "id" = NEW."operator_id"
      AND "role" = 'OPERATOR'
      AND "is_active" = true
      AND "deleted_at" IS NULL
  ) THEN
    RAISE EXCEPTION 'student owner must be an active operator';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER "trg_students_active_owner_insert"
BEFORE INSERT ON "students"
FOR EACH ROW
EXECUTE FUNCTION amanah_enforce_active_student_owner();

CREATE TRIGGER "trg_students_active_owner_update"
BEFORE UPDATE OF "operator_id" ON "students"
FOR EACH ROW
EXECUTE FUNCTION amanah_enforce_active_student_owner();

CREATE OR REPLACE FUNCTION amanah_preserve_owned_operator()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (NEW."role" <> 'OPERATOR' OR NEW."is_active" = false OR NEW."deleted_at" IS NOT NULL)
     AND EXISTS (SELECT 1 FROM "students" WHERE "operator_id" = OLD."id") THEN
    RAISE EXCEPTION 'transfer owned students before changing operator role or status';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER "trg_users_preserve_owned_operator"
BEFORE UPDATE OF "role", "is_active", "deleted_at" ON "users"
FOR EACH ROW
EXECUTE FUNCTION amanah_preserve_owned_operator();

CREATE OR REPLACE FUNCTION amanah_prevent_transaction_identity_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW."id" IS DISTINCT FROM OLD."id"
     OR NEW."student_id" IS DISTINCT FROM OLD."student_id"
     OR NEW."created_at" IS DISTINCT FROM OLD."created_at"
     OR NEW."created_by" IS DISTINCT FROM OLD."created_by" THEN
    RAISE EXCEPTION 'transaction identity, ownership, and creation evidence are immutable';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER "trg_transactions_immutable_identity"
BEFORE UPDATE OF "id", "student_id", "created_at", "created_by" ON "transactions"
FOR EACH ROW
EXECUTE FUNCTION amanah_prevent_transaction_identity_change();

CREATE OR REPLACE FUNCTION amanah_prevent_transaction_hard_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'transactions cannot be hard deleted';
END;
$$;

CREATE TRIGGER "trg_transactions_no_hard_delete"
BEFORE DELETE ON "transactions"
FOR EACH ROW
EXECUTE FUNCTION amanah_prevent_transaction_hard_delete();

CREATE OR REPLACE FUNCTION amanah_prevent_financial_audit_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'financial audit events are immutable';
END;
$$;

CREATE TRIGGER "trg_financial_audit_no_update"
BEFORE UPDATE ON "financial_audit_events"
FOR EACH ROW
EXECUTE FUNCTION amanah_prevent_financial_audit_mutation();

CREATE TRIGGER "trg_financial_audit_no_delete"
BEFORE DELETE ON "financial_audit_events"
FOR EACH ROW
EXECUTE FUNCTION amanah_prevent_financial_audit_mutation();
