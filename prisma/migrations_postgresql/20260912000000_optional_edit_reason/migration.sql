DROP TRIGGER IF EXISTS "trg_financial_audit_no_update";
DROP TRIGGER IF EXISTS "trg_financial_audit_no_delete";

ALTER TABLE "financial_audit_events"
  DROP CONSTRAINT IF EXISTS "ck_financial_audit_shape";

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
      AND ("event_type" IN ('CREATE', 'EDIT') OR "reason" IS NOT NULL)
    )
  );

ALTER TABLE "financial_audit_events"
  DROP CONSTRAINT IF EXISTS "ck_financial_audit_reason";

ALTER TABLE "financial_audit_events"
  ADD CONSTRAINT "ck_financial_audit_reason"
  CHECK (
    "reason" IS NULL
    OR (
      length(btrim("reason")) BETWEEN 1 AND 500
      AND "reason" = btrim("reason")
    )
  );
