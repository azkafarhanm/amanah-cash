CREATE TABLE operator_audit_new (
  id TEXT PRIMARY KEY NOT NULL,
  operator_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('CREATED', 'UPDATED', 'ACTIVATED', 'DEACTIVATED', 'DELETED', 'STUDENT_CREATE')),
  summary TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

INSERT INTO operator_audit_new SELECT * FROM operator_audit;
DROP TABLE operator_audit;
ALTER TABLE operator_audit_new RENAME TO operator_audit;

CREATE INDEX ix_operator_audit_operator
ON operator_audit (operator_id, created_at DESC);
