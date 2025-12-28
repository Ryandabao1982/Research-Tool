-- Initial Schema for KnowledgeBase Pro
-- Version: 2.0.0
-- Created: 2025-12-29

-- 1. Folders Table
-- Stores the organizational hierarchy of the knowledge base.
CREATE TABLE IF NOT EXISTS folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id TEXT,
    path TEXT, -- Materialized path for fast hierarchy queries (e.g., "root.work.projects")
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_folders_path ON folders(path);

-- 2. Notes Table
-- The primary storage for knowledge base content.
CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata TEXT, -- JSON string for flexible note properties
    folder_id TEXT,
    is_daily_note BOOLEAN DEFAULT FALSE,
    word_count INTEGER DEFAULT 0,
    reading_time INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes(folder_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);

-- 3. Tags Table
-- Global registry for tags.
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    color TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Note Tags (Many-to-Many)
-- Maps tags to notes.
CREATE TABLE IF NOT EXISTS note_tags (
    note_id TEXT,
    tag_id TEXT,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- 5. Links Table
-- Stores bidirectional links between notes.
CREATE TABLE IF NOT EXISTS links (
    id TEXT PRIMARY KEY,
    source_note_id TEXT NOT NULL,
    target_note_id TEXT NOT NULL,
    source_block_id TEXT, -- Future proofing for block-level references
    target_block_id TEXT, -- Future proofing for block-level references
    link_type TEXT DEFAULT 'wikilink',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (target_note_id) REFERENCES notes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_links_source ON links(source_note_id);
CREATE INDEX IF NOT EXISTS idx_links_target ON links(target_note_id);

-- 6. Full-Text Search (FTS5)
-- Virtual table for lightning fast search.
CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
    note_id UNINDEXED,
    title,
    content,
    tokenize = 'porter unicode61 remove_diacritics 1'
);

-- 7. Triggers for FTS5 Sync
-- Ensures the search index is always up to date with the notes table.

-- After Insert Note
CREATE TRIGGER IF NOT EXISTS trg_notes_insert AFTER INSERT ON notes BEGIN
    INSERT INTO notes_fts (note_id, title, content)
    VALUES (new.id, new.title, new.content);
END;

-- After Update Note
CREATE TRIGGER IF NOT EXISTS trg_notes_update AFTER UPDATE ON notes BEGIN
    UPDATE notes_fts SET 
        title = new.title,
        content = new.content
    WHERE note_id = old.id;
END;

-- After Delete Note
CREATE TRIGGER IF NOT EXISTS trg_notes_delete AFTER DELETE ON notes BEGIN
    DELETE FROM notes_fts WHERE note_id = old.id;
END;
