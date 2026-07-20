-- Legacy financial rows have no trustworthy actor, business occurrence time,
-- revision, command identity, or audit evidence. Fail closed rather than invent it.
CREATE TABLE transaction_engine_migration_guard (
  valid INTEGER NOT NULL CHECK (valid = 1)
) STRICT;
INSERT INTO transaction_engine_migration_guard (valid)
SELECT CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END FROM transactions;
DROP TABLE transaction_engine_migration_guard;

ALTER TABLE students ADD COLUMN balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0);
ALTER TABLE students ADD COLUMN financial_version INTEGER NOT NULL DEFAULT 0 CHECK (financial_version >= 0);

DROP INDEX ix_transactions_student_history;
DROP TABLE transactions;

CREATE TABLE transactions (
  id TEXT PRIMARY KEY NOT NULL,
  student_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'CORRECTION')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  correction_direction TEXT CHECK (correction_direction IN ('INCREASE', 'DECREASE')),
  reason TEXT,
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  created_by TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  deleted_at TEXT,
  deleted_by TEXT,
  CONSTRAINT ck_transactions_correction CHECK (
    (type = 'CORRECTION' AND correction_direction IS NOT NULL AND reason IS NOT NULL
      AND length(trim(reason)) BETWEEN 1 AND 500 AND reason = trim(reason))
    OR
    (type <> 'CORRECTION' AND correction_direction IS NULL AND reason IS NULL)
  ),
  CONSTRAINT ck_transactions_deletion_pair CHECK ((deleted_at IS NULL) = (deleted_by IS NULL)),
  CONSTRAINT fk_transactions_student FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE RESTRICT,
  CONSTRAINT fk_transactions_creator FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT fk_transactions_updater FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT fk_transactions_deleter FOREIGN KEY (deleted_by) REFERENCES users (id) ON DELETE RESTRICT
) STRICT;

CREATE INDEX ix_transactions_student_history
  ON transactions (student_id, occurred_at DESC, id DESC);
CREATE INDEX ix_transactions_student_active_history
  ON transactions (student_id, deleted_at, occurred_at DESC, id DESC);
CREATE INDEX ix_transactions_student_type_date
  ON transactions (student_id, type, occurred_at DESC);

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
      AND (event_type = 'CREATE' OR reason IS NOT NULL))
  ),
  CONSTRAINT fk_financial_audit_actor FOREIGN KEY (actor_id) REFERENCES users (id) ON DELETE RESTRICT,
  CONSTRAINT fk_financial_audit_student FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE RESTRICT,
  CONSTRAINT fk_financial_audit_transaction FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE RESTRICT
) STRICT;

CREATE UNIQUE INDEX uq_financial_audit_command ON financial_audit_events (command_id);
CREATE INDEX ix_financial_audit_student
  ON financial_audit_events (student_id, occurred_at DESC, id DESC);
CREATE INDEX ix_financial_audit_transaction_revision
  ON financial_audit_events (transaction_id, transaction_revision);

CREATE TRIGGER trg_transactions_immutable_identity
BEFORE UPDATE OF id, student_id, created_at, created_by ON transactions
FOR EACH ROW
WHEN NEW.id <> OLD.id OR NEW.student_id <> OLD.student_id
  OR NEW.created_at <> OLD.created_at OR NEW.created_by <> OLD.created_by
BEGIN
  SELECT RAISE(ABORT, 'transaction identity, ownership, and creation evidence are immutable');
END;

CREATE TRIGGER trg_transactions_no_hard_delete
BEFORE DELETE ON transactions
BEGIN
  SELECT RAISE(ABORT, 'transactions cannot be hard deleted');
END;

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
