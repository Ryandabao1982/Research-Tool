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

    Ok(conn)
}
