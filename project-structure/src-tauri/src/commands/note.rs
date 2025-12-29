use tauri::State;
use std::sync::Arc;
use crate::models::{Note, CreateNoteRequest, UpdateNoteRequest};
use crate::AppState;
use crate::services::NoteService;

#[tauri::command]
pub async fn list_notes(state: State<'_, Arc<AppState>>) -> Result<Vec<Note>, String> {
    state.note_service
        .list_notes()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_note(id: String, state: State<'_, Arc<AppState>>) -> Result<Option<Note>, String> {
    state.note_service
        .get_note(&id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_note(request: CreateNoteRequest, state: State<'_, Arc<AppState>>) -> Result<Note, String> {
    state.note_service
        .create_note(request)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_note(id: String, request: UpdateNoteRequest, state: State<'_, Arc<AppState>>) -> Result<Note, String> {
    state.note_service
        .update_note(&id, request)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_note(id: String, state: State<'_, Arc<AppState>>) -> Result<(), String> {
    state.note_service
        .delete_note(&id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_notes_by_folder(folder_id: String, state: State<'_, Arc<AppState>>) -> Result<Vec<Note>, String> {
    state.note_service
        .get_notes_by_folder(&folder_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_notes_by_tag(tag_name: String, state: State<'_, Arc<AppState>>) -> Result<Vec<Note>, String> {
    state.note_service
        .get_notes_by_tag(&tag_name)
        .await
        .map_err(|e| e.to_string())
}
