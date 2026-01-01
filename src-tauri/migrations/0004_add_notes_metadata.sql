-- Add metadata column to notes table for storing view preferences
ALTER TABLE notes ADD COLUMN metadata TEXT DEFAULT '{}';

-- View preference structure: {"view_mode": "single|split", "related_note_preference": "side-by-side|replace"}
