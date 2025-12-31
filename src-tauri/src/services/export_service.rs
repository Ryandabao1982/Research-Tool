use rusqlite::{Connection, Result};
use std::fs;
use std::path::Path;
use serde::Serialize;
use chrono::{DateTime, Utc};

#[derive(Serialize)]
struct NoteExport {
    id: String,
    title: String,
    content: String,
    created_at: String,
    updated_at: String,
}

pub fn export_notes(conn: &Connection, export_dir: &Path) -> Result<()> {
    if !export_dir.exists() {
        fs::create_dir_all(export_dir).map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
    }

    let mut stmt = conn.prepare("SELECT id, title, content, created_at, updated_at FROM notes")?;
    let note_iter = stmt.query_map([], |row| {
        Ok(NoteExport {
            id: row.get(0)?,
            title: row.get(1)?,
            content: row.get(2)?,
            created_at: row.get(3)?,
            updated_at: row.get(4)?,
        })
    })?;

    for note in note_iter {
        let note = note?;
        let filename = format!("{}.md", sanitize_filename(&note.title));
        let path = export_dir.join(filename);

        let markdown = format!(
            "---\nid: {}\ntitle: {}\ncreated_at: {}\nupdated_at: {}\n---\n\n{}",
            note.id, note.title, note.created_at, note.updated_at, note.content
        );

        fs::write(path, markdown).map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
    }

    Ok(())
}

fn sanitize_filename(name: &str) -> String {
    name.chars()
        .map(|c| if c.is_alphanumeric() || c == ' ' || c == '-' || c == '_' { c } else { '_' })
        .collect::<String>()
        .replace(" ", "_")
}
