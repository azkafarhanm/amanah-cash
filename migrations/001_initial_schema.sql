CREATE TABLE students (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL
    CHECK (length(name) BETWEEN 1 AND 100)
    CHECK (name = trim(name))
    CHECK (name NOT LIKE '%' || char(9) || '%')
    CHECK (name NOT LIKE '%  %'),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;

CREATE UNIQUE INDEX uq_students_name_ci ON students (name COLLATE NOCASE);

CREATE TABLE transactions (
  id TEXT PRIMARY KEY NOT NULL,
  student_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CONSTRAINT fk_transactions_student
    FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE RESTRICT
) STRICT;

CREATE INDEX ix_transactions_student_history
  ON transactions (student_id, created_at DESC, id DESC);
