use tauri::State;
use std::path::PathBuf;
use std::path::PathBuf;
use crate::services::{db_service, import_service, export_service, backup_service, search_service};
use crate::services::search_service::SearchResult;


#[tauri::command]
pub async fn import_files(
    state: State<'_, db_service::DbState>,
    path: String,
) -> Result<usize, String> {
    let conn = state.0.lock().unwrap();
    import_service::import_files(&conn, &PathBuf::from(path)).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn export_notes(
    state: State<'_, db_service::DbState>,
    path: String,
) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    export_service::export_notes(&conn, &PathBuf::from(path)).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_backup(
    state: State<'_, db_service::DbState>,
    path: String,
) -> Result<(), String> {
    let conn = state.0.lock().unwrap();
    backup_service::create_backup(&conn, &PathBuf::from(path)).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn search_notes(
    state: State<'_, db_service::DbState>,
    query: String,
) -> Result<Vec<SearchResult>, String> {
    let conn = state.0.lock().unwrap();
    search_service::search_notes(&conn, &query).map_err(|e| e.to_string())
}

