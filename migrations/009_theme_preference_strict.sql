CREATE TABLE "settings_preferences_strict" (
    "user_id" TEXT NOT NULL PRIMARY KEY,
    "theme" TEXT NOT NULL DEFAULT 'SYSTEM'
      CHECK ("theme" IN ('LIGHT', 'DARK', 'SYSTEM', 'TIME')),
    "created_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TEXT NOT NULL,
    CONSTRAINT "settings_preferences_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users" ("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
) STRICT;

INSERT INTO "settings_preferences_strict" ("user_id", "theme", "created_at", "updated_at")
SELECT "user_id", "theme", "created_at", "updated_at"
FROM "settings_preferences";

DROP TABLE "settings_preferences";
ALTER TABLE "settings_preferences_strict" RENAME TO "settings_preferences";
