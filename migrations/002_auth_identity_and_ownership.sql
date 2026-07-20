CREATE TABLE users (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL
    CHECK (length(name) > 0)
    CHECK (name = trim(name)),
  email TEXT NOT NULL
    CHECK (length(email) > 0)
    CHECK (email = lower(trim(email))),
  email_verified TEXT,
  image TEXT,
  role TEXT NOT NULL CHECK (role IN ('PLATFORM_ADMIN', 'OPERATOR')),
  is_active INTEGER NOT NULL DEFAULT 0 CHECK (is_active IN (0, 1))
) STRICT;

CREATE UNIQUE INDEX uq_users_email ON users (email);

CREATE TABLE accounts (
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  CONSTRAINT pk_accounts PRIMARY KEY (provider, provider_account_id),
  CONSTRAINT fk_accounts_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) STRICT;

CREATE INDEX ix_accounts_user ON accounts (user_id);

CREATE TABLE sessions (
  session_token TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  expires TEXT NOT NULL,
  CONSTRAINT fk_sessions_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) STRICT;

CREATE INDEX ix_sessions_user ON sessions (user_id);
CREATE INDEX ix_sessions_expires ON sessions (expires);

CREATE TABLE new_students (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL
    CHECK (length(name) BETWEEN 1 AND 100)
    CHECK (name = trim(name))
    CHECK (name NOT LIKE '%' || char(9) || '%')
    CHECK (name NOT LIKE '%  %'),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  operator_id TEXT NOT NULL,
  CONSTRAINT fk_students_operator
    FOREIGN KEY (operator_id) REFERENCES users (id) ON DELETE RESTRICT
) STRICT;

-- Existing Students cannot be assigned safely without an approved Operator.
-- This copy intentionally fails and rolls back the migration if any rows exist.
INSERT INTO new_students (id, name, created_at, operator_id)
SELECT id, name, created_at, NULL
FROM students;

DROP INDEX uq_students_name_ci;
DROP TABLE students;
ALTER TABLE new_students RENAME TO students;

CREATE UNIQUE INDEX uq_students_name_ci ON students (name COLLATE NOCASE);
CREATE INDEX ix_students_operator ON students (operator_id);

CREATE TRIGGER trg_students_owner_insert
BEFORE INSERT ON students
FOR EACH ROW
WHEN NOT EXISTS (
  SELECT 1
  FROM users
  WHERE id = NEW.operator_id
    AND role = 'OPERATOR'
    AND is_active = 1
)
BEGIN
  SELECT RAISE(ABORT, 'student owner must be an active operator');
END;

CREATE TRIGGER trg_students_owner_update
BEFORE UPDATE OF operator_id ON students
FOR EACH ROW
WHEN NOT EXISTS (
  SELECT 1
  FROM users
  WHERE id = NEW.operator_id
    AND role = 'OPERATOR'
    AND is_active = 1
)
BEGIN
  SELECT RAISE(ABORT, 'student owner must be an active operator');
END;

CREATE TRIGGER trg_users_preserve_active_operator_ownership
BEFORE UPDATE OF role, is_active ON users
FOR EACH ROW
WHEN (NEW.role <> 'OPERATOR' OR NEW.is_active <> 1)
  AND EXISTS (SELECT 1 FROM students WHERE operator_id = OLD.id)
BEGIN
  SELECT RAISE(ABORT, 'transfer owned students before changing operator role or status');
END;
