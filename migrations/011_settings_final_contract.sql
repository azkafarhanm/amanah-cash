PRAGMA foreign_keys=OFF;

CREATE TABLE settings_preferences_final (
  user_id TEXT PRIMARY KEY NOT NULL,
  theme TEXT NOT NULL DEFAULT 'SYSTEM'
    CHECK (theme IN ('LIGHT', 'DARK', 'SYSTEM')),
  default_page_size INTEGER NOT NULL DEFAULT 20
    CHECK (default_page_size IN (10, 20, 50)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL,
  CONSTRAINT settings_preferences_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE NO ACTION
) STRICT;

INSERT INTO settings_preferences_final (
  user_id,
  theme,
  default_page_size,
  created_at,
  updated_at
)
SELECT
  user_id,
  CASE WHEN theme = 'TIME' THEN 'SYSTEM' ELSE theme END,
  default_page_size,
  created_at,
  updated_at
FROM settings_preferences;

DROP TABLE settings_preferences;
ALTER TABLE settings_preferences_final RENAME TO settings_preferences;

PRAGMA foreign_keys=ON;
