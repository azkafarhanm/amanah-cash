ALTER TABLE settings_preferences
  ADD COLUMN default_page_size INTEGER NOT NULL DEFAULT 20
  CHECK (default_page_size IN (10, 20, 50));
