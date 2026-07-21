ALTER TABLE transactions
ADD COLUMN notes TEXT
CHECK (notes IS NULL OR (length(trim(notes)) BETWEEN 1 AND 500 AND notes = trim(notes)));
