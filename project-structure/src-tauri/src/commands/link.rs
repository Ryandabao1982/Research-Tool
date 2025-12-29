use tauri::State;
use std::sync::Arc;
use crate::models::{Link, CreateLinkRequest};
use crate::AppState;
use crate::services::LinkService;

#[tauri::command]
pub async fn list_links(state: State<'_, Arc<AppState>>) -> Result<Vec<Link>, String> {
    state.link_service
        .list_links()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_link(request: CreateLinkRequest, state: State<'_, Arc<AppState>>) -> Result<Link, String> {
    state.link_service
        .create_link(request)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_link(id: String, state: State<'_, Arc<AppState>>) -> Result<(), String> {
    state.link_service
        .delete_link(&id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_backlinks(note_id: String, state: State<'_, Arc<AppState>>) -> Result<Vec<crate::models::Note>, String> {
    state.link_service
        .get_backlinks(&note_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_forward_links(note_id: String, state: State<'_, Arc<AppState>>) -> Result<Vec<crate::models::Note>, String> {
    state.link_service
        .get_forward_links(&note_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn parse_and_create_links(note_id: String, content: String, state: State<'_, Arc<AppState>>) -> Result<Vec<Link>, String> {
    state.link_service
        .parse_and_create_links(&note_id, &content)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_link_count(note_id: String, state: State<'_, Arc<AppState>>) -> Result<i64, String> {
    state.link_service
        .get_link_count(&note_id)
        .await
        .map_err(|e| e.to_string())
}
