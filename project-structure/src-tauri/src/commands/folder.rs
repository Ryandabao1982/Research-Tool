use tauri::State;
use std::sync::Arc;
use crate::models::{Folder, CreateFolderRequest, UpdateFolderRequest};
use crate::AppState;
use crate::services::FolderService;

#[tauri::command]
pub async fn list_folders(state: State<'_, Arc<AppState>>) -> Result<Vec<Folder>, String> {
    state.folder_service
        .list_folders()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_folder(request: CreateFolderRequest, state: State<'_, Arc<AppState>>) -> Result<Folder, String> {
    state.folder_service
        .create_folder(request)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_folder(id: String, request: UpdateFolderRequest, state: State<'_, Arc<AppState>>) -> Result<Folder, String> {
    state.folder_service
        .update_folder(&id, request)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_folder(id: String, state: State<'_, Arc<AppState>>) -> Result<(), String> {
    state.folder_service
        .delete_folder(&id)
        .await
        .map_err(|e| e.to_string())
}
