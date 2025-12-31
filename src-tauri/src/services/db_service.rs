use rusqlite::{Connection, Result};
use std::sync::Mutex;

pub struct DbState(pub Mutex<Connection>);

pub fn init_db() -> Result<Connection> {
    let conn = Connection::open("knowledge_base.db")?;
    
    // Core Tables
    conn.execute(
        "CREATE TABLE IF NOT EXISTS notes (
            internal_id INTEGER PRIMARY KEY AUTOINCREMENT,
            id TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            folder_id TEXT,
            is_daily_note BOOLEAN DEFAULT FALSE,
            properties TEXT,
            word_count INTEGER DEFAULT 0,
            reading_time INTEGER DEFAULT 0
        )",
        [],
    )?;

    // Folders Table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS folders (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            parent_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Tags Table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS tags (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Note-Tags Join Table (Many-to-Many)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS note_tags (
            note_id TEXT NOT NULL,
            tag_id TEXT NOT NULL,
            PRIMARY KEY (note_id, tag_id),
            FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        )",
        [],
    )?;


    // FTS5 Virtual Table
    conn.execute(
        "CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
            title,
            content,
            tags,
            properties,
            content='notes',
            content_rowid='internal_id'
        )",
        [],
    )?;

    // Synchronization Triggers
    conn.execute_batch("
        CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
          INSERT INTO notes_fts(rowid, title, content, properties) 
          VALUES (new.internal_id, new.title, new.content, new.properties);
        END;

        CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
          INSERT INTO notes_fts(notes_fts, rowid, title, content, properties) 
          VALUES('delete', old.internal_id, old.title, old.content, old.properties);
        END;

        CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
          INSERT INTO notes_fts(notes_fts, rowid, title, content, properties) 
          VALUES('delete', old.internal_id, old.title, old.content, old.properties);
          INSERT INTO notes_fts(rowid, title, content, properties) 
          VALUES (new.internal_id, new.title, new.content, new.properties);
        END;
    ")?;

    // Initialize Cards Schema
    use crate::services::cards;
    cards::create_tables(&conn)?;

    Ok(conn)
}
