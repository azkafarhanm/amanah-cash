ALTER TABLE users ADD COLUMN created_at TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z';
ALTER TABLE users ADD COLUMN last_login_at TEXT;
ALTER TABLE users ADD COLUMN deleted_at TEXT;

UPDATE users SET created_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE created_at = '1970-01-01T00:00:00.000Z';

CREATE INDEX ix_users_operator_list
ON users (role, deleted_at, is_active, created_at DESC);

CREATE TABLE operator_audit (
  id TEXT PRIMARY KEY NOT NULL,
  operator_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('CREATED', 'UPDATED', 'ACTIVATED', 'DEACTIVATED', 'DELETED')),
  summary TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE INDEX ix_operator_audit_operator
ON operator_audit (operator_id, created_at DESC);

CREATE TRIGGER trg_users_preserve_operator_ownership_on_delete
BEFORE UPDATE OF deleted_at ON users
FOR EACH ROW
WHEN NEW.deleted_at IS NOT NULL
  AND EXISTS (SELECT 1 FROM students WHERE operator_id = OLD.id)
BEGIN
  SELECT RAISE(ABORT, 'remove operator ownership before deletion');
END;
