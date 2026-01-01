use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize)]
pub struct Folder {
    pub id: String,
    pub name: String,
    pub parent_id: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct Tag {
    pub id: String,
    pub name: String,
}

pub fn create_folder(conn: &Connection, name: &str, parent_id: Option<String>) -> Result<Folder> {
    let id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO folders (id, name, parent_id) VALUES (?, ?, ?)",
        params![id, name, parent_id],
    )?;
    Ok(Folder { id, name: name.to_string(), parent_id })
}

pub fn get_folders(conn: &Connection) -> Result<Vec<Folder>> {
    let mut stmt = conn.prepare("SELECT id, name, parent_id FROM folders")?;
    let folder_iter = stmt.query_map([], |row| {
        Ok(Folder {
            id: row.get(0)?,
            name: row.get(1)?,
            parent_id: row.get(2)?,
        })
    })?;

    let mut folders = Vec::new();
    for folder in folder_iter {
        folders.push(folder?);
    }
    Ok(folders)
}

pub fn get_all_tags(conn: &Connection) -> Result<Vec<Tag>> {
    let mut stmt = conn.prepare("SELECT id, name FROM tags ORDER BY name")?;
    let tag_iter = stmt.query_map([], |row| {
        Ok(Tag {
            id: row.get(0)?,
            name: row.get(1)?,
        })
    })?;

    let mut tags = Vec::new();
    for tag in tag_iter {
        tags.push(tag?);
    }
    Ok(tags)
}

pub fn update_note_folder(conn: &Connection, note_id: &str, folder_id: Option<String>) -> Result<()> {
    conn.execute(
        "UPDATE notes SET folder_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        params![folder_id, note_id],
    )?;
    Ok(())
}

pub fn create_tag(conn: &Connection, name: &str) -> Result<Tag> {
    let id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)",
        params![id, name],
    )?;
    
    // If name already exists, we might need to fetch the existing ID.
    // For simplicity in this step, let's just return the new or existing one.
    let mut stmt = conn.prepare("SELECT id FROM tags WHERE name = ?")?;
    let existing_id: String = stmt.query_row(params![name], |row| row.get(0))?;
    
    Ok(Tag { id: existing_id, name: name.to_string() })
}

pub fn link_tag_to_note(conn: &Connection, note_id: &str, tag_id: &str) -> Result<()> {
    conn.execute(
        "INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)",
        params![note_id, tag_id],
    )?;
    Ok(())
}

pub fn get_note_tags(conn: &Connection, note_id: &str) -> Result<Vec<Tag>> {
    let mut stmt = conn.prepare(
        "SELECT t.id, t.name FROM tags t 
         JOIN note_tags nt ON t.id = nt.tag_id 
         WHERE nt.note_id = ?"
    )?;
    let tag_iter = stmt.query_map(params![note_id], |row| {
        Ok(Tag {
            id: row.get(0)?,
            name: row.get(1)?,
        })
    })?;

    let mut tags = Vec::new();
    for tag in tag_iter {
        tags.push(tag?);
    }
    Ok(tags)
}

pub fn unlink_tag_from_note(conn: &Connection, note_id: &str, tag_id: &str) -> Result<()> {
    conn.execute(
        "DELETE FROM note_tags WHERE note_id = ? AND tag_id = ?",
        params![note_id, tag_id],
    )?;
    Ok(())
}

