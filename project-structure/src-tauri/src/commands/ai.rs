use tauri::State;
use std::sync::Arc;
use crate::AppState;
use crate::services::{AIService, AIRequest, AIResponse, AIConversation, AIMessage, AIModel};
use tokio::sync::mpsc;

#[tauri::command]
pub async fn generate_ai_response(request: AIRequest, state: State<'_, Arc<AppState>>) -> Result<AIResponse, String> {
    state.ai_service
        .generate_response(request)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn generate_ai_response_stream(request: AIRequest, state: State<'_, Arc<AppState>>) -> Result<String, String> {
    match state.ai_service.generate_response_stream(request).await {
        Ok(mut receiver) => {
            let mut response = String::new();
            while let Some(chunk) = receiver.recv().await {
                response.push_str(&chunk);
            }
            Ok(response)
        }
        Err(e) => Err(e.to_string())
    }
}

#[tauri::command]
pub async fn create_ai_conversation(title: String, state: State<'_, Arc<AppState>>) -> Result<AIConversation, String> {
    state.ai_service
        .create_conversation(title)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_ai_message(
    conversation_id: String, 
    role: String, 
    content: String, 
    citations: Option<String>,
    state: State<'_, Arc<AppState>>
) -> Result<AIMessage, String> {
    state.ai_service
        .add_message(conversation_id, role, content, citations, None, "phi3.1:mini".to_string())
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

#[tauri::command]
pub async fn get_available_ai_models(state: State<'_, Arc<AppState>>) -> Result<Vec<AIModel>, String> {
    state.ai_service
        .get_available_models()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_related_documents(query: String, limit: Option<i32>, state: State<'_, Arc<AppState>>) -> Result<Vec<String>, String> {
    state.ai_service
        .search_related_documents(&query, limit)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn generate_document_summary(document_ids: Vec<String>, state: State<'_, Arc<AppState>>) -> Result<String, String> {
    state.ai_service
        .generate_summary(&document_ids)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn generate_study_guide(topic: String, document_ids: Vec<String>, state: State<'_, Arc<AppState>>) -> Result<String, String> {
    state.ai_service
        .generate_study_guide(&topic, &document_ids)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn initialize_ai_providers(state: State<'_, Arc<AppState>>) -> Result<(), String> {
    state.ai_service
        .initialize_providers()
        .await
        .map_err(|e| e.to_string())
}