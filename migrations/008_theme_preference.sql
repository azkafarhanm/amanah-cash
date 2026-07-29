CREATE TABLE "settings_preferences" (
    "user_id" TEXT NOT NULL PRIMARY KEY,
    "theme" TEXT NOT NULL DEFAULT 'SYSTEM'
      CHECK ("theme" IN ('LIGHT', 'DARK', 'SYSTEM', 'TIME')),
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "settings_preferences_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users" ("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
);
