PRAGMA foreign_keys = OFF;
BEGIN IMMEDIATE;

DROP TRIGGER IF EXISTS trg_users_preserve_active_operator_ownership;
DROP TRIGGER IF EXISTS trg_users_preserve_operator_ownership_on_delete;
DROP TRIGGER IF EXISTS trg_students_updated_at;
DROP TRIGGER IF EXISTS trg_students_status_update;
DROP TRIGGER IF EXISTS trg_students_status_insert;
DROP TRIGGER IF EXISTS trg_students_owner_update;
DROP TRIGGER IF EXISTS trg_students_owner_insert;

CREATE TABLE previous_students (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL
    CHECK (length(name) BETWEEN 1 AND 100)
    CHECK (name = trim(name))
    CHECK (name NOT LIKE '%' || char(9) || '%')
    CHECK (name NOT LIKE '%  %'),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

INSERT INTO previous_students (id, name, created_at)
SELECT id, name, created_at FROM students;

DROP INDEX ix_students_operator;
DROP INDEX uq_students_name_ci;
DROP TABLE students;
ALTER TABLE previous_students RENAME TO students;
CREATE UNIQUE INDEX uq_students_name_ci ON students (name COLLATE NOCASE);

DROP TABLE IF EXISTS operator_audit;

DROP TABLE sessions;
DROP TABLE accounts;
DROP TABLE users;

DELETE FROM schema_migrations
WHERE version IN ('002_auth_identity_and_ownership.sql', '003_operator_management.sql', '004_student_management.sql');

COMMIT;
PRAGMA foreign_keys = ON;

PRAGMA foreign_key_check;
