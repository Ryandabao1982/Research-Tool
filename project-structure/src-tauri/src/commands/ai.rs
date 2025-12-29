use tauri::State;
use std::sync::Arc;
use crate::AppState;
use crate::services::{AIService, AIRequest, AIResponse, AIConversation, AIMessage};

#[tauri::command]
pub async fn generate_ai_response(request: AIRequest, state: State<'_, Arc<AppState>>) -> Result<AIResponse, String> {
    state.ai_service
        .generate_response(request)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_ai_conversation(title: String, state: State<'_, Arc<AppState>>) -> Result<AIConversation, String> {
    state.ai_service
        .create_conversation(title)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_ai_message(conversation_id: String, role: String, content: String, citations: Option<String>, state: State<'_, Arc<AppState>>) -> Result<AIMessage, String> {
    state.ai_service
        .add_message(conversation_id, role, content, citations)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_ai_conversation_history(conversation_id: String, state: State<'_, Arc<AppState>>) -> Result<Vec<AIMessage>, String> {
    state.ai_service
        .get_conversation_history(conversation_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn list_ai_conversations(state: State<'_, Arc<AppState>>) -> Result<Vec<AIConversation>, String> {
    state.ai_service
        .list_conversations()
        .await
        .map_err(|e| e.to_string())
}
