CREATE TABLE maintenance_audit_events (
  id TEXT PRIMARY KEY NOT NULL,
  actor_id TEXT,
  operation TEXT NOT NULL CHECK (operation IN ('BACKUP', 'RESTORE')),
  outcome TEXT NOT NULL CHECK (outcome IN ('SUCCESS', 'FAILURE')),
  artifact_created_at TEXT,
  application_version TEXT,
  schema_version TEXT,
  occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
) STRICT;

CREATE INDEX ix_maintenance_audit_occurred
ON maintenance_audit_events (occurred_at DESC);
