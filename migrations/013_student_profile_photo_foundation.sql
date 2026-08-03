ALTER TABLE students
ADD COLUMN photo_object_key TEXT;

ALTER TABLE students
ADD COLUMN photo_updated_at TEXT
CHECK (
  (photo_object_key IS NULL AND photo_updated_at IS NULL)
  OR
  (photo_object_key IS NOT NULL AND photo_updated_at IS NOT NULL)
);
