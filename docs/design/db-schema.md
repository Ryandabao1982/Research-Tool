# SQLite FTS5 Formalized Schema

This document formalizes the database architecture required for the high-performance RAG (Retrieval-Augmented Generation) flow in KnowledgeBase Pro.

## 1. Core Persistence Layer

To satisfy FTS5 efficiency requirements while maintaining UUID portability, the `notes` table is updated with an internal integer ID.

```sql
CREATE TABLE notes (
    internal_id INTEGER PRIMARY KEY AUTOINCREMENT, -- Used for FTS5 rowid mapping
    id TEXT UNIQUE NOT NULL,                       -- Public UUID
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    folder_id TEXT,
    is_daily_note BOOLEAN DEFAULT FALSE,
    properties TEXT,                               -- JSON metadata
    word_count INTEGER DEFAULT 0,
    reading_time INTEGER DEFAULT 0,
    FOREIGN KEY (folder_id) REFERENCES folders(id)
);
```

## 2. Search Index Layer (FTS5)

The search index operates as an **External Content** table to avoid doubling the storage of large note bodies.

```sql
CREATE VIRTUAL TABLE notes_fts USING fts5(
    title,
    content,
    tags,
    properties,
    content='notes',
    content_rowid='internal_id'
);
```

## 3. Synchronization Triggers

Automated triggers ensure the index is always in sync with the source of truth, satisfying Winston's "Developer Productivity is Architecture" principle.

```sql
-- Sync on New Note
CREATE TRIGGER notes_ai AFTER INSERT ON notes BEGIN
  INSERT INTO notes_fts(rowid, title, content, properties) 
  VALUES (new.internal_id, new.title, new.content, new.properties);
END;

-- Sync on Note Deletion
CREATE TRIGGER notes_ad AFTER DELETE ON notes BEGIN
  INSERT INTO notes_fts(notes_fts, rowid, title, content, properties) 
  VALUES('delete', old.internal_id, old.title, old.content, old.properties);
END;

-- Sync on Note Update
CREATE TRIGGER notes_au AFTER UPDATE ON notes BEGIN
  INSERT INTO notes_fts(notes_fts, rowid, title, content, properties) 
  VALUES('delete', old.internal_id, old.title, old.content, old.properties);
  INSERT INTO notes_fts(rowid, title, content, properties) 
  VALUES (new.internal_id, new.title, new.content, new.properties);
END;
```

## 4. RAG Retrieval Query

The synthesis engine will use the following query pattern to fetch grounded context:

```sql
SELECT n.title, n.content 
FROM notes_fts f
JOIN notes n ON f.rowid = n.internal_id
WHERE notes_fts MATCH :query
ORDER BY rank
LIMIT 5;
```

---
*Architectural Decision by Winston (System Architect)*
