use tauri::State;
use crate::services::db_service;
use chrono::Local;

/// Quick note creation with auto-title generation
/// 
/// # Arguments
/// * `content` - The content of the note
/// 
/// # Returns
/// * `Result<(String, String), String>` - (note_id, generated_title) or error
/// 
/// # Performance
/// * Target: <150ms for complete note creation
#[tauri::command]
pub async fn quick_create_note(
    state: State<'_, db_service::DbState>,
    content: String,
) -> Result<(String, String), String> {
    let start = std::time::Instant::now();
    
    // Auto-generate title from first line
    let title = generate_title(&content);
    
    // Get connection and create note
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    // Use existing db_service function
    let note_id = db_service::create_note(&conn, &title, &content)?;
    
    let duration = start.elapsed();
    log::info!("Quick create note completed in {:?} (target: <150ms)", duration);
    
    Ok((note_id, title))
}

/// Generate title from content
/// 
/// # Logic
/// 1. Extract first non-empty line
/// 2. Trim whitespace
/// 3. If empty or only whitespace, use "Untitled Note"
/// 4. Truncate to 100 characters for safety
fn generate_title(content: &str) -> String {
    let first_line = content.lines()
        .map(|line| line.trim())
        .find(|line| !line.is_empty());
    
    match first_line {
        Some(line) => {
            // Truncate if too long
            if line.len() > 100 {
                format!("{}...", &line[..97])
            } else {
                line.to_string()
            }
        }
        None => "Untitled Note".to_string(),
    }
}

/// Get recent notes (last 10)
/// 
/// # Returns
/// * `Vec<db_service::Note>` - List of recent notes
#[tauri::command]
pub async fn get_recent_notes(
    state: State<'_, db_service::DbState>,
) -> Result<Vec<db_service::Note>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT id, title, content, created_at, updated_at, folder_id 
         FROM notes 
         ORDER BY updated_at DESC 
         LIMIT 10"
    ).map_err(|e| e.to_string())?;
    
    let notes = stmt.query_map([], |row| {
        Ok(db_service::Note {
            id: row.get(0)?,
            title: row.get(1)?,
            content: row.get(2)?,
            created_at: row.get(3)?,
            updated_at: row.get(4)?,
            folder_id: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut result = Vec::new();
    for note in notes {
        result.push(note.map_err(|e| e.to_string())?);
    }
    Ok(result)
}
