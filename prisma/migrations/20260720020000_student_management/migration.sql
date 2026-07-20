ALTER TABLE students ADD COLUMN notes TEXT;
ALTER TABLE students ADD COLUMN status TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE students ADD COLUMN updated_at TEXT NOT NULL DEFAULT '1970-01-01T00:00:00.000Z';

UPDATE students SET updated_at = created_at
WHERE updated_at = '1970-01-01T00:00:00.000Z';

CREATE INDEX ix_students_management_list
ON students (status, operator_id, created_at DESC);

CREATE TRIGGER trg_students_status_insert
BEFORE INSERT ON students
FOR EACH ROW WHEN NEW.status NOT IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')
BEGIN
  SELECT RAISE(ABORT, 'invalid student status');
END;

CREATE TRIGGER trg_students_status_update
BEFORE UPDATE OF status ON students
FOR EACH ROW WHEN NEW.status NOT IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')
BEGIN
  SELECT RAISE(ABORT, 'invalid student status');
END;

CREATE TRIGGER trg_students_updated_at
AFTER UPDATE OF name, notes, status, operator_id ON students
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE students
  SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  WHERE id = NEW.id;
END;
