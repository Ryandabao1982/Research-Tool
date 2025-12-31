use crate::services::synthesis_service;
use crate::services::db_service::DbState;
use tauri::State;

#[tauri::command]
pub async fn synthesize_notes(
    state: State<'_, DbState>,
    note_ids: Vec<String>, 
    prompt_type: String
) -> Result<String, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let mut notes = Vec::new();
    
    for id in note_ids {
        let mut stmt = conn.prepare("SELECT title, content FROM notes WHERE id = ?")
            .map_err(|e| e.to_string())?;
        
        let note = stmt.query_row([id], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?
            ))
        });

        if let Ok((title, content)) = note {
            notes.push((title, content));
        }
    }

    // Convert notes into the format expected by bundle_notes_content
    // The service currently expects Vec<(&str, &str, &str)> but we can adjust it or the caller.
    // Let's adjust the bundling to be more flexible or map here.
    let bundled_notes = notes.iter()
        .map(|(t, c)| ("", t.as_str(), c.as_str()))
        .collect::<Vec<_>>();

    let bundled = synthesis_service::bundle_notes_content(bundled_notes);
    
    // In a real implementation, this would call an AI service with the bundled content
    Ok(format!("Grounded synthesis: [Type: {}]\n\nUsing context:\n{}", prompt_type, bundled))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_synthesize_notes_command() {
        let note_ids = vec!["1".to_string(), "2".to_string()];
        let prompt_type = "summary".to_string();
        
        let result = synthesize_notes(note_ids, prompt_type).await.unwrap();
        
        assert!(result.contains("Grounded synthesis:"));
    }
}
