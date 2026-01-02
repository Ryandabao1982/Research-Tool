use rusqlite::{Connection, Result};
use std::sync::Mutex;
use std::fs;
use std::path::Path;

pub struct DbState(pub Mutex<Connection>);

/// Run database migrations from the migrations directory
fn run_migrations(conn: &Connection) -> Result<(), String> {
    let migrations_dir = Path::new("src-tauri/migrations");
    
    if !migrations_dir.exists() {
        return Ok(());
    }
    
    // Get all .sql files and sort them
    let mut migrations: Vec<String> = fs::read_dir(migrations_dir)
        .map_err(|e| format!("Failed to read migrations directory: {}", e))?
        .filter_map(|entry| {
            let entry = entry.ok()?;
            let path = entry.path();
            if path.extension()? == "sql" {
                Some(path.to_string_lossy().to_string())
            } else {
                None
            }
        })
        .collect();
    
    migrations.sort();
    
    // Track which migrations have been applied
    conn.execute(
        "CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ).map_err(|e| format!("Failed to create migrations table: {}", e))?;
    
    // Apply each migration
    for migration_path in migrations {
        let migration_name = Path::new(&migration_path)
            .file_name()
            .unwrap()
            .to_string_lossy()
            .to_string();
        
        // Check if already applied
        let already_applied: bool = conn.query_row(
            "SELECT EXISTS(SELECT 1 FROM migrations WHERE name = ?)",
            [&migration_name],
            |row| row.get(0)
        ).unwrap_or(false);
        
        if !already_applied {
            log::info!("Applying migration: {}", migration_name);
            
            let sql = fs::read_to_string(&migration_path)
                .map_err(|e| format!("Failed to read migration {}: {}", migration_name, e))?;
            
            conn.execute_batch(&sql)
                .map_err(|e| format!("Failed to apply migration {}: {}", migration_name, e))?;
            
            conn.execute(
                "INSERT INTO migrations (name) VALUES (?)",
                [&migration_name],
            ).map_err(|e| format!("Failed to record migration {}: {}", migration_name, e))?;
            
            log::info!("Migration applied successfully: {}", migration_name);
        }
    }
    
    Ok(())
}

pub fn init_db() -> Result<Connection> {
    let conn = Connection::open("knowledge_base.db")?;
    
    // Run migrations first
    if let Err(e) = run_migrations(&conn) {
        log::error!("Migration error: {}", e);
        // Don't fail DB init on migration errors - they might be expected
    }
    
    // Core Tables (only create if not exists - migrations handle schema updates)
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
            reading_time INTEGER DEFAULT 0,
            content_encrypted BLOB,
            nonce BLOB,
            content_plaintext TEXT
        )",
        [],
    )?;
    
    // Create settings table if not exists
    conn.execute(
        "CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            encryption_enabled BOOLEAN DEFAULT FALSE,
            encryption_passphrase_hash TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;
    
    // Ensure default settings row exists
    conn.execute(
        "INSERT OR IGNORE INTO settings (id, encryption_enabled) VALUES (1, FALSE)",
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

    // Synchronization Triggers (Updated to handle encrypted content)
    conn.execute_batch("
        CREATE TRIGGER IF NOT EXISTS notes_ai AFTER INSERT ON notes BEGIN
          INSERT INTO notes_fts(rowid, title, content, properties) 
          VALUES (new.internal_id, new.title, COALESCE(new.content_plaintext, new.content), new.properties);
        END;

        CREATE TRIGGER IF NOT EXISTS notes_ad AFTER DELETE ON notes BEGIN
          INSERT INTO notes_fts(notes_fts, rowid, title, content, properties) 
          VALUES('delete', old.internal_id, old.title, COALESCE(old.content_plaintext, old.content), old.properties);
        END;

        CREATE TRIGGER IF NOT EXISTS notes_au AFTER UPDATE ON notes BEGIN
          INSERT INTO notes_fts(notes_fts, rowid, title, content, properties) 
          VALUES('delete', old.internal_id, old.title, COALESCE(old.content_plaintext, old.content), old.properties);
          INSERT INTO notes_fts(rowid, title, content, properties) 
          VALUES (new.internal_id, new.title, COALESCE(new.content_plaintext, new.content), new.properties);
        END;
    ")?;

    // Initialize Cards Schema
    use crate::services::cards;
    cards::create_tables(&conn)?;

    Ok(conn)
}

#[derive(Debug, Clone, PartialEq)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub created_at: String,
    pub updated_at: String,
    pub folder_id: Option<String>,
    pub is_encrypted: bool, // Whether this note is encrypted
}

pub fn get_all_notes(conn: &Connection) -> Result<Vec<Note>, String> {
    let mut stmt = conn.prepare(
        "SELECT id, title, content, created_at, updated_at, folder_id, content_encrypted FROM notes ORDER BY updated_at DESC"
    ).map_err(|e| e.to_string())?;
    
    let notes = stmt.query_map([], |row| {
        let content_encrypted: Option<Vec<u8>> = row.get(6)?;
        Ok(Note {
            id: row.get(0)?,
            title: row.get(1)?,
            content: row.get(2)?,
            created_at: row.get(3)?,
            updated_at: row.get(4)?,
            folder_id: row.get(5)?,
            is_encrypted: content_encrypted.is_some(),
        })
    }).map_err(|e| e.to_string())?;
    
    let mut result = Vec::new();
    for note in notes {
        result.push(note.map_err(|e| e.to_string())?);
    }
    Ok(result)
}

pub fn get_note_by_id(conn: &Connection, id: &str) -> Result<Option<Note>, String> {
    let mut stmt = conn.prepare(
        "SELECT id, title, content, created_at, updated_at, folder_id, content_encrypted FROM notes WHERE id = ?"
    ).map_err(|e| e.to_string())?;
    
    let note = stmt.query_row([id], |row| {
        let content_encrypted: Option<Vec<u8>> = row.get(6)?;
        Ok(Note {
            id: row.get(0)?,
            title: row.get(1)?,
            content: row.get(2)?,
            created_at: row.get(3)?,
            updated_at: row.get(4)?,
            folder_id: row.get(5)?,
            is_encrypted: content_encrypted.is_some(),
        })
    }).optional().map_err(|e| e.to_string())?;
    
    Ok(note)
}

pub fn create_note(conn: &Connection, title: &str, content: &str) -> Result<String, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    
    conn.execute(
        "INSERT INTO notes (id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        [&id, title, content, &now, &now],
    ).map_err(|e| e.to_string())?;
    
    Ok(id)
}

pub fn update_note(conn: &Connection, id: &str, title: &str, content: &str) -> Result<(), String> {
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    
    conn.execute(
        "UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE id = ?",
        [title, content, &now, id],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

pub fn delete_note(conn: &Connection, id: &str) -> Result<(), String> {
    conn.execute(
        "DELETE FROM notes WHERE id = ?",
        [id],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

pub fn get_all_tags(conn: &Connection) -> Result<Vec<String>, String> {
    let mut stmt = conn.prepare("SELECT name FROM tags ORDER BY name").map_err(|e| e.to_string())?;
    
    let tags: Result<Vec<String>, rusqlite::Error> = stmt.query_map([], |row| row.get(0))?.collect();
    
    tags.map_err(|e| e.to_string())
}

pub fn get_all_folders(conn: &Connection) -> Result<Vec<(String, String, Option<String>)>, String> {
    let mut stmt = conn.prepare("SELECT id, name, parent_id FROM folders ORDER BY name").map_err(|e| e.to_string())?;
    
    let mut result = Vec::new();
    for row in stmt.query_map([], |row| {
        Ok((row.get(0)?, row.get(1)?, row.get(2)?))
    }).map_err(|e| e.to_string())? {
        result.push(row.map_err(|e| e.to_string())?);
    }
    Ok(result)
}
