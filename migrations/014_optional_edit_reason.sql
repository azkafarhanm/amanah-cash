DROP TRIGGER trg_financial_audit_no_update;
DROP TRIGGER trg_financial_audit_no_delete;
DROP INDEX uq_financial_audit_command;
DROP INDEX ix_financial_audit_student;
DROP INDEX ix_financial_audit_transaction_revision;

ALTER TABLE financial_audit_events RENAME TO financial_audit_events_old;

CREATE TABLE financial_audit_events (
  id TEXT PRIMARY KEY NOT NULL,
  command_id TEXT NOT NULL,
  command_payload_hash TEXT NOT NULL CHECK (length(command_payload_hash) = 64),
  event_type TEXT NOT NULL CHECK (event_type IN ('CREATE', 'EDIT', 'DELETE', 'RESTORE', 'OWNERSHIP_TRANSFER')),
  actor_id TEXT NOT NULL,
  actor_role TEXT NOT NULL CHECK (actor_role IN ('PLATFORM_ADMIN', 'OPERATOR')),
  student_id TEXT NOT NULL,
  transaction_id TEXT,
  transaction_revision INTEGER CHECK (transaction_revision >= 1),
  reason TEXT CHECK (reason IS NULL OR (length(trim(reason)) BETWEEN 1 AND 500 AND reason = trim(reason))),
  before_snapshot TEXT,
  after_snapshot TEXT,
  balance_before INTEGER,
  balance_after INTEGER,
  balance_delta INTEGER,
  old_operator_id TEXT,
  new_operator_id TEXT,
  occurred_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  schema_version INTEGER NOT NULL DEFAULT 1 CHECK (schema_version >= 1),
  correlation_id TEXT NOT NULL CHECK (length(trim(correlation_id)) > 0),
  CONSTRAINT ck_financial_audit_shape CHECK (
    (event_type = 'OWNERSHIP_TRANSFER'
      AND transaction_id IS NULL AND transaction_revision IS NULL
      AND before_snapshot IS NULL AND after_snapshot IS NULL
      AND balance_before IS NULL AND balance_after IS NULL AND balance_delta IS NULL
      AND old_operator_id IS NOT NULL AND new_operator_id IS NOT NULL AND reason IS NOT NULL)
    OR
    (event_type <> 'OWNERSHIP_TRANSFER'
      AND actor_role = 'OPERATOR' AND transaction_id IS NOT NULL AND transaction_revision IS NOT NULL
      AND after_snapshot IS NOT NULL AND balance_before IS NOT NULL
      AND balance_after IS NOT NULL AND balance_delta IS NOT NULL
      AND old_operator_id IS NULL AND new_operator_id IS NULL
      AND ((event_type = 'CREATE' AND before_snapshot IS NULL)
        OR (event_type <> 'CREATE' AND before_snapshot IS NOT NULL))
      AND (event_type IN ('CREATE', 'EDIT') OR reason IS NOT NULL))
  ),
  CONSTRAINT fk_financial_audit_actor FOREIGN KEY (actor_id) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT fk_financial_audit_student FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE RESTRICT,
  CONSTRAINT fk_financial_audit_transaction FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE RESTRICT
) STRICT;

INSERT INTO financial_audit_events (
  id, command_id, command_payload_hash, event_type, actor_id, actor_role, student_id,
  transaction_id, transaction_revision, reason, before_snapshot, after_snapshot,
  balance_before, balance_after, balance_delta, old_operator_id, new_operator_id,
  occurred_at, schema_version, correlation_id
)
SELECT
  id, command_id, command_payload_hash, event_type, actor_id, actor_role, student_id,
  transaction_id, transaction_revision, reason, before_snapshot, after_snapshot,
  balance_before, balance_after, balance_delta, old_operator_id, new_operator_id,
  occurred_at, schema_version, correlation_id
FROM financial_audit_events_old;

DROP TABLE financial_audit_events_old;

CREATE UNIQUE INDEX uq_financial_audit_command ON financial_audit_events (command_id);
CREATE INDEX ix_financial_audit_student
  ON financial_audit_events (student_id, occurred_at DESC, id DESC);
CREATE INDEX ix_financial_audit_transaction_revision
  ON financial_audit_events (transaction_id, transaction_revision);

CREATE TRIGGER trg_financial_audit_no_update
BEFORE UPDATE ON financial_audit_events
BEGIN
  SELECT RAISE(ABORT, 'financial audit events are immutable');
END;

CREATE TRIGGER trg_financial_audit_no_delete
BEFORE DELETE ON financial_audit_events
BEGIN
  SELECT RAISE(ABORT, 'financial audit events cannot be deleted');
END;
