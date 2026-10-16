-- Student archive.
--
-- An Operator can archive a Student who has left, which hides them from
-- everyday work without deleting anything: transactions and financial audit
-- events stay append-only, and past reports keep reconciling.
--
-- archived_at records when, for the banner on an archived Student. It may only
-- be set while the Student is ARCHIVED, so the date and the status cannot
-- disagree. Students archived before this migration keep a NULL date.
--
-- operator_audit gains STUDENT_ARCHIVE and STUDENT_RESTORE. SQLite cannot alter
-- a CHECK in place, so the table is rebuilt exactly as 007 built it.

ALTER TABLE students
ADD COLUMN archived_at TEXT
CHECK (archived_at IS NULL OR status = 'ARCHIVED');

CREATE TABLE operator_audit_new (
  id TEXT PRIMARY KEY NOT NULL,
  operator_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('CREATED', 'UPDATED', 'ACTIVATED', 'DEACTIVATED', 'DELETED', 'STUDENT_CREATE', 'STUDENT_ARCHIVE', 'STUDENT_RESTORE')),
  summary TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

INSERT INTO operator_audit_new SELECT * FROM operator_audit;
DROP TABLE operator_audit;
ALTER TABLE operator_audit_new RENAME TO operator_audit;

CREATE INDEX ix_operator_audit_operator
ON operator_audit (operator_id, created_at DESC);
