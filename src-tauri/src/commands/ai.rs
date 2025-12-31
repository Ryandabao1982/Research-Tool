use crate::services::db_service::DbState;
use crate::services::cards;
use crate::services::ollama;
use tauri::State;

#[tauri::command]
pub async fn synthesize_query(
    state: State<'_, DbState>,
    query: String,
) -> Result<String, String> {
    // 1. Search for relevant cards using FTS5
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let cards = cards::search_cards(&conn, &query).map_err(|e| e.to_string())?;

    // 2. Bundle context from top 5 cards
    let context = cards.iter()
        .take(5)
        .map(|c| format!("Source: Card {}\nContent: {}", c.id, c.content))
        .collect::<Vec<_>>()
        .join("\n\n");

    if context.is_empty() {
        return Ok("I couldn't find any relevant notes in your brain to answer that.".to_string());
    }

    // 3. Generate response via Ollama
    // We run this in a blocking task safely because reqwest blocking is used.
    // In a real async heavy app we'd use async reqwest, but for local orchestration this is fine.
    let response = tauri::async_runtime::spawn_blocking(move || {
        ollama::generate_response(&query, &context)
    })
    .await
    .map_err(|e| e.to_string())?
    .map_err(|e| e.to_string())?;

    Ok(response)
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
