-- Block-Level References Migration
-- Version: 2.0.0
-- Created: 2025-12-29
-- Adds block-level content tracking for granular referencing

-- 8. Blocks Table
-- Stores individual content blocks within notes for block-level references.
CREATE TABLE IF NOT EXISTS blocks (
    id TEXT PRIMARY KEY,
    note_id TEXT NOT NULL,
    content TEXT NOT NULL,
    block_type TEXT DEFAULT 'paragraph', -- paragraph, heading, list, code, quote, etc.
    position INTEGER NOT NULL, -- Order within the note
    parent_block_id TEXT, -- For nested blocks
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_block_id) REFERENCES blocks(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_blocks_note_id ON blocks(note_id);
CREATE INDEX IF NOT EXISTS idx_blocks_parent_block_id ON blocks(parent_block_id);

-- 9. Block Full-Text Search (FTS5)
-- Virtual table for block-level search.
CREATE VIRTUAL TABLE IF NOT EXISTS blocks_fts USING fts5(
    block_id UNINDEXED,
    content,
    block_type,
    note_id,
    tokenize = 'porter unicode61 remove_diacritics 1'
);

-- Triggers for Block FTS5 Sync

-- After Insert Block
CREATE TRIGGER IF NOT EXISTS trg_blocks_insert AFTER INSERT ON blocks BEGIN
    INSERT INTO blocks_fts (block_id, content, block_type, note_id)
    VALUES (new.id, new.content, new.block_type, new.note_id);
END;

-- After Update Block
CREATE TRIGGER IF NOT EXISTS trg_blocks_update AFTER UPDATE ON blocks BEGIN
    UPDATE blocks_fts SET 
        content = new.content,
        block_type = new.block_type
    WHERE block_id = old.id;
END;

-- After Delete Block
CREATE TRIGGER IF NOT EXISTS trg_blocks_delete AFTER DELETE ON blocks BEGIN
    DELETE FROM blocks_fts WHERE block_id = old.id;
END;
