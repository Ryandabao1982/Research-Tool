-- Add encryption support to notes table
-- Migration for Story 1.8: AES-256 Encryption

-- Add encrypted content column (stores AES-256-GCM encrypted data)
ALTER TABLE notes ADD COLUMN content_encrypted BLOB;

-- Add nonce column (96-bit random value per encryption)
ALTER TABLE notes ADD COLUMN nonce BLOB;

-- Add plaintext content column (for search transparency when decrypted)
-- This allows search to work on decrypted content
ALTER TABLE notes ADD COLUMN content_plaintext TEXT;

-- Add settings table for encryption preferences
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    encryption_enabled BOOLEAN DEFAULT FALSE,
    encryption_passphrase_hash TEXT,  -- Argon2 hash of passphrase
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings row
INSERT OR IGNORE INTO settings (id, encryption_enabled) VALUES (1, FALSE);

-- Update FTS5 triggers to handle encrypted content
-- Note: For encrypted notes, we'll need to update content_plaintext when decrypting
-- This trigger ensures FTS stays in sync with plaintext content when available
DROP TRIGGER IF EXISTS notes_ai;
DROP TRIGGER IF EXISTS notes_ad;
DROP TRIGGER IF EXISTS notes_au;

-- Insert trigger: Use content_plaintext if available, otherwise use content
CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
    INSERT INTO notes_fts(rowid, title, content, properties) 
    VALUES (
        new.internal_id, 
        new.title, 
        COALESCE(new.content_plaintext, new.content), 
        new.properties
    );
END;

-- Delete trigger
CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
    INSERT INTO notes_fts(notes_fts, rowid, title, content, properties) 
    VALUES(
        'delete', 
        old.internal_id, 
        old.title, 
        COALESCE(old.content_plaintext, old.content), 
        old.properties
    );
END;

-- Update trigger
CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
    INSERT INTO notes_fts(notes_fts, rowid, title, content, properties) 
    VALUES(
        'delete', 
        old.internal_id, 
        old.title, 
        COALESCE(old.content_plaintext, old.content), 
        old.properties
    );
    INSERT INTO notes_fts(rowid, title, content, properties) 
    VALUES (
        new.internal_id, 
        new.title, 
        COALESCE(new.content_plaintext, new.content), 
        new.properties
    );
END;

-- Add index for encrypted notes lookup
CREATE INDEX IF NOT EXISTS idx_notes_encrypted ON notes(content_encrypted);

-- Add index for settings
CREATE INDEX IF NOT EXISTS idx_settings_id ON settings(id);
