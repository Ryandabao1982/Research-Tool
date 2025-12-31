use crate::services::synthesis_service;

#[tauri::command]
pub async fn synthesize_notes(note_ids: Vec<String>, prompt_type: String) -> Result<String, String> {
    // Mock note fetching
    let notes = note_ids.iter().map(|id| {
        (id.as_str(), "Mock Title", "Mock Content")
    }).collect::<Vec<_>>();

    let bundled = synthesis_service::bundle_notes_content(notes);
    
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
