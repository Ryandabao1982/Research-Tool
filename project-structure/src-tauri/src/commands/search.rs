use tauri::State;
use std::sync::Arc;
use crate::models::SearchResult;
use crate::AppState;
use crate::services::SearchService;

#[tauri::command]
pub async fn search_notes(query: String, state: State<'_, Arc<AppState>>) -> Result<Vec<SearchResult>, String> {
    state.search_service
        .search_notes(&query)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_in_folder(folder_id: String, query: String, state: State<'_, Arc<AppState>>) -> Result<Vec<SearchResult>, String> {
    state.search_service
        .search_in_folder(&folder_id, &query)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_by_tag(tag_name: String, query: String, state: State<'_, Arc<AppState>>) -> Result<Vec<SearchResult>, String> {
    state.search_service
        .search_by_tag(&tag_name, &query)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_search_suggestions(query: String, limit: u32, state: State<'_, Arc<AppState>>) -> Result<Vec<String>, String> {
    state.search_service
        .get_search_suggestions(&query, limit)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_all_notes_count(state: State<'_, Arc<AppState>>) -> Result<i64, String> {
    state.search_service
        .get_all_notes_count()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_recent_notes(limit: u32, state: State<'_, Arc<AppState>>) -> Result<Vec<crate::models::Note>, String> {
    state.search_service
        .get_recent_notes(limit)
        .await
        .map_err(|e| e.to_string())
}
