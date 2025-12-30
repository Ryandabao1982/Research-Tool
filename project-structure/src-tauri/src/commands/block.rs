use tauri::State;
use std::sync::Arc;
use crate::models::{Block, CreateBlockRequest, UpdateBlockRequest};
use crate::AppState;
use crate::services::BlockService;

#[tauri::command]
pub async fn list_blocks(note_id: String, state: State<'_, Arc<AppState>>) -> Result<Vec<Block>, String> {
    state.block_service
        .list_blocks(&note_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_block(id: String, state: State<'_, Arc<AppState>>) -> Result<Option<Block>, String> {
    state.block_service
        .get_block(&id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_block(request: CreateBlockRequest, state: State<'_, Arc<AppState>>) -> Result<Block, String> {
    state.block_service
        .create_block(request)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_block(id: String, request: UpdateBlockRequest, state: State<'_, Arc<AppState>>) -> Result<Block, String> {
    state.block_service
        .update_block(&id, request)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_block(id: String, state: State<'_, Arc<AppState>>) -> Result<(), String> {
    state.block_service
        .delete_block(&id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_block_link(
    source_block_id: String,
    target_block_id: String,
    note_id: String,
    state: State<'_, Arc<AppState>>
) -> Result<String, String> {
    state.block_service
        .create_block_link(&source_block_id, &target_block_id, &note_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_blocks(
    query: String,
    note_id: Option<String>,
    state: State<'_, Arc<AppState>>
) -> Result<Vec<Block>, String> {
    state.block_service
        .search_blocks(&query, note_id.as_deref())
        .await
        .map_err(|e| e.to_string())
}
