use crate::services::db_service::DbState;
use crate::services::cards;
use crate::services::local_llm::{LocalLLMState, ModelStatus};
use tauri::State;

#[tauri::command]
pub fn get_model_status(llm_state: State<'_, LocalLLMState>) -> ModelStatus {
    llm_state.get_status()
}

#[tauri::command]
pub fn delete_model(llm_state: State<'_, LocalLLMState>) -> Result<(), String> {
    llm_state.delete_model().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn synthesize_query(
    db_state: State<'_, DbState>,
    llm_state: State<'_, LocalLLMState>,
    query: String,
) -> Result<String, String> {
    // 1. Search for relevant cards using FTS5
    let conn = db_state.0.lock().map_err(|e| e.to_string())?;
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

    // 3. Construct Prompt
    let prompt = format!(
        "<|im_start|>system\nYou are a helpful second brain assistant. Answer the query based ONLY on the provided context.\n<|im_end|>\n<|im_start|>user\nContext:\n{}\n\nQuery: {}\n<|im_end|>\n<|im_start|>assistant\n",
        context, query
    );

    // 4. Generate response via Local Candle LLM
    // We run this in a blocking task to avoid freezing the async runtime
    let response = tauri::async_runtime::spawn_blocking(move || {
        // Run the async check_and_download inside a blocking runtime block
        // This is a bit tricky mixing sync/async, so we use a mini-runtime for the download part
        let rt = tokio::runtime::Runtime::new().unwrap();
        let (model_path, tokenizer_path) = match rt.block_on(llm_state.check_and_download()) {
             Ok(paths) => paths,
             Err(e) => return format!("Error initializing brain: {}", e)
        };

        // Load model if not already loaded
        if let Err(e) = llm_state.load_model(&model_path, &tokenizer_path) {
             return format!("Error loading brain: {}", e);
        }

        match llm_state.generate(&prompt) {
            Ok(output) => output,
            Err(e) => format!("Brain freeze: {}", e)
        }
    })
    .await
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
