use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Metadata {
    pub view_mode: Option<String>,     // "single" or "split"
    pub related_note_preference: Option<String>,  // "side-by-side" or "replace"
}

impl Default for Metadata {
    fn default() -> Self {
        Self {
            view_mode: None,
            related_note_preference: Some("side-by-side".to_string()), // Default to side-by-side view
        }
    }
}

/// Get metadata for a specific note
#[tauri::command]
pub async fn get_metadata(
    state: tauri::State<'_, DbState>,
    note_id: String,
) -> Result<Metadata, String> {
    let conn = state.db.lock().unwrap();

    let sql = "SELECT metadata FROM notes WHERE id = ?";
    let mut stmt = conn.prepare(sql).map_err(|e| {
        format!("Failed to prepare get_metadata query: {}", e)
    })?;

    let metadata_json = stmt.query_row::<_, String>([note_id])
        .map_err(|e| format!("Failed to query metadata: {}", e))?
        .unwrap_or_default_else(String::from("{}"), "{}");

    match serde_json::from_str::<Metadata>(&metadata_json) {
        Ok(metadata) => Ok(metadata),
        Err(e) => Err(format!("Failed to deserialize metadata: {}", e)),
    }
}

/// Set metadata for a specific note
#[tauri::command]
pub async fn set_metadata(
    state: tauri::State<'_, DbState>,
    note_id: String,
    metadata: Metadata,
) -> Result<(), String> {
    let conn = state.db.lock().unwrap();

    let metadata_json = serde_json::to_string(&metadata).map_err(|e| {
        format!("Failed to serialize metadata: {}", e)
    })?;

    let sql = "UPDATE notes SET metadata = ? WHERE id = ?";
    let mut stmt = conn.prepare(sql).map_err(|e| {
        format!("Failed to prepare set_metadata query: {}", e)
    })?;

    stmt.execute([note_id, metadata_json])
        .map_err(|e| format!("Failed to execute set_metadata: {}", e))?;

    Ok(())
}
