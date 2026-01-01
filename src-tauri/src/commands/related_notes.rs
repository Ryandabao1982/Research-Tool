use crate::services::search_service::{get_related_notes, SearchResult};
use rusqlite::Connection;

#[tauri::command]
pub async fn get_related_notes(
    state: tauri::State<'_, DbState>,
    note_content: String,
    current_note_id: String,
    limit: usize,
) -> Result<Vec<SearchResult>, String> {
    // Get database connection from state
    let conn = state.db.lock().unwrap();

    // Call service function with current note ID to exclude it from results
    match get_related_notes(&conn, note_content, current_note_id, limit) {
        Ok(notes) => Ok(notes),
        Err(e) => Err(format!("Failed to get related notes: {}", e)),
    }
}
